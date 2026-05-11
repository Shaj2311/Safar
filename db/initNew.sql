-- Run AFTER init.sql.

-- Schema fix: Required for sp_upsert_vehicle ON CONFLICT
ALTER TABLE Vehicle ADD CONSTRAINT uq_vehicle_driver_id UNIQUE (driver_id);

-- 1. USER-DEFINED FUNCTIONS (UDFs)

CREATE OR REPLACE FUNCTION fn_calculate_fare(p_dist DECIMAL)
RETURNS DECIMAL AS $$
BEGIN
    RETURN COALESCE(p_dist, 0) * 100.0;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_get_ride_status(
    p_start_time TIMESTAMPTZ, p_end_time TIMESTAMPTZ,
    p_driver_id BIGINT, p_is_deleted BOOLEAN
) RETURNS TEXT AS $$
BEGIN
    IF p_is_deleted THEN RETURN 'Cancelled';
    ELSIF p_end_time IS NOT NULL THEN RETURN 'Completed';
    ELSIF p_start_time IS NOT NULL THEN RETURN 'In Progress';
    ELSIF p_driver_id IS NOT NULL THEN RETURN 'Accepted';
    ELSE RETURN 'Pending';
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_average_driver_rating(p_driver_id BIGINT)
RETURNS DECIMAL AS $$
BEGIN
    RETURN (
        SELECT COALESCE(ROUND(AVG(r.score), 2), 0.0)
        FROM rating r JOIN trip t ON r.trip_id = t.trip_id
        WHERE t.driver_id = p_driver_id AND r.is_deleted = false
    );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_driver_total_earnings(p_driver_id BIGINT)
RETURNS DECIMAL AS $$
BEGIN
    RETURN (
        SELECT COALESCE(SUM(p.actual_fare), 0.0)
        FROM payment p JOIN trip t ON p.trip_id = t.trip_id
        WHERE t.driver_id = p_driver_id AND p.is_paid = true AND p.is_deleted = false
    );
END;
$$ LANGUAGE plpgsql;

-- 2. VIEWS

-- V1: Passenger profile with stats (users.py → viewPassengerProfile)
CREATE OR REPLACE VIEW v_passenger_profile AS
SELECT u.user_id, u.name, p.phone_no, p.cnic, p.inserted_at AS member_since,
    (SELECT COUNT(*) FROM trip WHERE passenger_id = u.user_id AND is_deleted = false) AS total_trips,
    (SELECT COALESCE(ROUND(AVG(r.score),2),0.0) FROM rating r JOIN trip t ON r.trip_id = t.trip_id
     WHERE t.passenger_id = u.user_id AND r.is_deleted = false) AS avg_rating
FROM appuser u JOIN passenger p ON u.user_id = p.passenger_id
WHERE p.is_deleted = false;

-- V2: Driver public profile (users.py + drivers.py)
CREATE OR REPLACE VIEW v_driver_public_profile AS
SELECT u.user_id AS driver_id, u.name, d.phone_no, d.cnic,
    v.make, v.model, v.plate_no,
    (SELECT COUNT(*) FROM trip WHERE driver_id = d.driver_id) AS total_trips,
    fn_average_driver_rating(d.driver_id) AS avg_rating
FROM appuser u
JOIN driver d ON u.user_id = d.driver_id
LEFT JOIN vehicle v ON d.driver_id = v.driver_id
WHERE d.is_deleted = false;

-- V3: Driver ratings (users.py → viewDriverRatings)
CREATE OR REPLACE VIEW v_driver_ratings AS
SELECT t.driver_id, r.score, r.feedback, r.inserted_at AS rated_at
FROM rating r JOIN trip t ON r.trip_id = t.trip_id
WHERE r.is_deleted = false;

-- V4: Incoming ride requests (drivers.py → checkIncomingRequests)
CREATE OR REPLACE VIEW v_incoming_ride_requests AS
SELECT t.trip_id, t.passenger_id, u.name AS passenger_name, p.phone_no,
    t.pickup_loc, t.dropoff_loc, t.estimated_dist
FROM trip t
JOIN appuser u ON t.passenger_id = u.user_id
JOIN passenger p ON t.passenger_id = p.passenger_id
WHERE t.driver_id IS NULL AND t.is_deleted = false;

-- V5: Active ride status (rides.py → getRideStatus)
CREATE OR REPLACE VIEW v_active_ride_status AS
SELECT trip_id, start_time, end_time, driver_id, is_deleted,
    fn_get_ride_status(start_time, end_time, driver_id, is_deleted) AS status
FROM trip;

-- V6: Ride summary (rides.py → getCompletedRideSummary)
CREATE OR REPLACE VIEW v_ride_summary AS
SELECT t.trip_id, t.passenger_id, p.name AS passenger_name,
    t.driver_id, d.name AS driver_name,
    t.start_time, t.end_time, t.pickup_loc, t.dropoff_loc,
    t.actual_dist AS distance,
    pay.base_amount, pay.trip_amount, pay.actual_fare AS total_fare
FROM trip t
JOIN appuser p ON t.passenger_id = p.user_id
LEFT JOIN appuser d ON t.driver_id = d.user_id
LEFT JOIN payment pay ON t.trip_id = pay.trip_id;

-- V7: Trip driver info (rides.py → getCurrentDriver)
CREATE OR REPLACE VIEW v_trip_driver_info AS
SELECT t.trip_id, t.passenger_id,
    u.name AS driver_name, d.phone_no, v.make, v.model, v.plate_no
FROM trip t
JOIN appuser u ON t.driver_id = u.user_id
JOIN driver d ON t.driver_id = d.driver_id
LEFT JOIN vehicle v ON d.driver_id = v.driver_id
WHERE t.is_deleted = false;

-- V8: Ride payment status (rides.py → getRidePaymentStatus)
CREATE OR REPLACE VIEW v_ride_payment_status AS
SELECT t.trip_id, t.passenger_id,
    pay.is_paid, pay.actual_fare AS fare, pay.inserted_at AS processed_at
FROM payment pay JOIN trip t ON pay.trip_id = t.trip_id
WHERE t.is_deleted = false;

-- V9: Public ride tracking (comms.py → getPublicRideDetails)
CREATE OR REPLACE VIEW v_public_ride_tracking AS
SELECT DISTINCT ON (t.trip_id)
    t.trip_id, t.is_deleted, t.end_time, lh.location AS latest_location
FROM trip t
LEFT JOIN locationhistory lh ON t.trip_id = lh.trip_id
ORDER BY t.trip_id, lh.timestamp DESC;

-- V10: Driver earnings (history.py → viewEarnings + getPastTrips)
CREATE OR REPLACE VIEW v_driver_earnings AS
SELECT t.trip_id, t.driver_id, t.start_time, t.pickup_loc, t.dropoff_loc,
    p.actual_fare, p.is_paid
FROM trip t JOIN payment p ON t.trip_id = p.trip_id
WHERE t.is_deleted = false AND p.is_deleted = false;

-- V11: Trip history detail (history.py → getPastTripDetails)
CREATE OR REPLACE VIEW v_trip_history_detail AS
SELECT t.trip_id, t.start_time, t.end_time, t.pickup_loc, t.dropoff_loc,
    t.actual_dist, p.base_amount, p.trip_amount, p.actual_fare, p.is_paid,
    u.name AS passenger_name
FROM trip t
LEFT JOIN payment p ON t.trip_id = p.trip_id
JOIN appuser u ON t.passenger_id = u.user_id;

-- V12: Chat messages (comms.py → receiveMessages)
CREATE OR REPLACE VIEW v_chat_messages AS
SELECT message_id, chat_id, sender_id, receiver_id, content, sent_at
FROM message WHERE is_deleted = false;

-- V13: Staff ride list (staff.py → staffViewRides)
CREATE OR REPLACE VIEW v_staff_ride_list AS
SELECT t.trip_id, t.pickup_loc, t.dropoff_loc, t.start_time, t.end_time,
    t.is_deleted, t.inserted_at,
    pay.actual_fare, u_p.name AS passenger_name, u_d.name AS driver_name,
    fn_get_ride_status(t.start_time, t.end_time, t.driver_id, t.is_deleted) AS status
FROM trip t
LEFT JOIN payment pay ON t.trip_id = pay.trip_id
LEFT JOIN appuser u_p ON t.passenger_id = u_p.user_id
LEFT JOIN appuser u_d ON t.driver_id = u_d.user_id;

-- V14: Staff passenger list (staff.py → viewAllPassengers)
CREATE OR REPLACE VIEW v_staff_passenger_list AS
SELECT p.passenger_id, u.name, p.cnic, p.phone_no, p.inserted_at
FROM passenger p JOIN appuser u ON p.passenger_id = u.user_id
WHERE p.is_deleted = false;

-- V15: Staff driver detail (staff.py → viewAllDrivers + viewDriverDetails)
CREATE OR REPLACE VIEW v_staff_driver_detail AS
SELECT d.driver_id, u.name, d.cnic, d.phone_no, d.inserted_at,
    v.make, v.model, v.plate_no, v.engine_no, v.chassis_no
FROM driver d
JOIN appuser u ON d.driver_id = u.user_id
LEFT JOIN vehicle v ON d.driver_id = v.driver_id
WHERE d.is_deleted = false;

-- V16: Super admin staff list (superAdmin.py → superViewStaff)
CREATE OR REPLACE VIEW v_super_staff_list AS
SELECT s.staff_id, u.name, s.cnic, s.phone_no, s.role, s.inserted_at
FROM staff s JOIN appuser u ON s.staff_id = u.user_id
WHERE s.is_deleted = false AND s.role IN ('admin', 'support');

-- V17: System stats (superAdmin.py → getSystemStats)
CREATE OR REPLACE VIEW v_system_stats AS
SELECT
    (SELECT COUNT(*) FROM trip WHERE is_deleted = false) AS total_trips,
    (SELECT COUNT(*) FROM driver WHERE is_deleted = false) AS active_drivers,
    (SELECT COUNT(*) FROM ticket WHERE status = 'open' AND is_deleted = false) AS open_tickets;

-- 3. STORED PROCEDURES

-- SP1: Passenger signup (TRANSACTION: appuser + passenger)
CREATE OR REPLACE PROCEDURE sp_signup_passenger(
    p_name VARCHAR, p_password VARCHAR, p_phone VARCHAR, p_cnic VARCHAR,
    INOUT p_user_id BIGINT DEFAULT NULL
) LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO appuser (name, password) VALUES (p_name, p_password) RETURNING user_id INTO p_user_id;
    INSERT INTO passenger (passenger_id, cnic, phone_no) VALUES (p_user_id, p_cnic, p_phone);
    COMMIT;
EXCEPTION WHEN OTHERS THEN
    ROLLBACK; RAISE;
END;
$$;

-- SP2: Driver signup (TRANSACTION: appuser + driver)
CREATE OR REPLACE PROCEDURE sp_signup_driver(
    p_name VARCHAR, p_password VARCHAR, p_phone VARCHAR, p_cnic VARCHAR,
    INOUT p_user_id BIGINT DEFAULT NULL
) LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO appuser (name, password) VALUES (p_name, p_password) RETURNING user_id INTO p_user_id;
    INSERT INTO driver (driver_id, cnic, phone_no) VALUES (p_user_id, p_cnic, p_phone);
    COMMIT;
EXCEPTION WHEN OTHERS THEN
    ROLLBACK; RAISE;
END;
$$;

-- SP3: Staff signup (TRANSACTION: appuser + staff, covers all roles)
CREATE OR REPLACE PROCEDURE sp_signup_staff(
    p_name VARCHAR, p_password VARCHAR, p_phone VARCHAR, p_cnic VARCHAR, p_role VARCHAR,
    INOUT p_user_id BIGINT DEFAULT NULL
) LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO appuser (name, password) VALUES (p_name, p_password) RETURNING user_id INTO p_user_id;
    INSERT INTO staff (staff_id, cnic, phone_no, role) VALUES (p_user_id, p_cnic, p_phone, p_role);
    COMMIT;
EXCEPTION WHEN OTHERS THEN
    ROLLBACK; RAISE;
END;
$$;

-- SP4: Request ride
CREATE OR REPLACE PROCEDURE sp_request_ride(
    p_passenger_id BIGINT, p_px FLOAT, p_py FLOAT, p_dx FLOAT, p_dy FLOAT, p_dist DECIMAL,
    INOUT p_trip_id BIGINT DEFAULT NULL
) LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO trip (passenger_id, pickup_loc, dropoff_loc, estimated_dist)
    VALUES (p_passenger_id, point(p_px, p_py), point(p_dx, p_dy), p_dist)
    RETURNING trip_id INTO p_trip_id;
    COMMIT;
END;
$$;

-- SP5: Accept ride (FOR UPDATE lock prevents race condition)
CREATE OR REPLACE PROCEDURE sp_accept_ride(p_trip_id BIGINT, p_driver_id BIGINT)
LANGUAGE plpgsql AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM trip WHERE trip_id = p_trip_id AND driver_id IS NULL FOR UPDATE) THEN
        UPDATE trip SET driver_id = p_driver_id WHERE trip_id = p_trip_id;
        INSERT INTO chat (trip_id) VALUES (p_trip_id);
        COMMIT;
    ELSE
        RAISE EXCEPTION 'Ride already taken or does not exist';
    END IF;
END;
$$;

-- SP6: Start ride
CREATE OR REPLACE PROCEDURE sp_start_ride(p_trip_id BIGINT)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE trip SET start_time = NOW() WHERE trip_id = p_trip_id;
    COMMIT;
END;
$$;

-- SP7: End ride (TRANSACTION: trip + payment + fare calc)
CREATE OR REPLACE PROCEDURE sp_end_ride(p_trip_id BIGINT, INOUT p_fare DECIMAL DEFAULT NULL)
LANGUAGE plpgsql AS $$
DECLARE v_dist DECIMAL;
BEGIN
    SELECT estimated_dist INTO v_dist FROM trip WHERE trip_id = p_trip_id;
    IF v_dist IS NULL THEN RAISE EXCEPTION 'Trip not found'; END IF;
    p_fare := fn_calculate_fare(v_dist);
    UPDATE trip SET end_time = NOW() WHERE trip_id = p_trip_id;
    INSERT INTO payment (trip_id, base_amount, trip_amount, estimated_fare, actual_fare)
    VALUES (p_trip_id, 0, p_fare, p_fare, p_fare);
    COMMIT;
EXCEPTION WHEN OTHERS THEN
    ROLLBACK; RAISE;
END;
$$;

-- SP8: Confirm payment
CREATE OR REPLACE PROCEDURE sp_confirm_payment(p_trip_id BIGINT)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE payment SET is_paid = true WHERE trip_id = p_trip_id;
    COMMIT;
END;
$$;

-- SP9: Cancel ride
CREATE OR REPLACE PROCEDURE sp_cancel_ride(p_trip_id BIGINT)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE trip SET is_deleted = true WHERE trip_id = p_trip_id;
    COMMIT;
END;
$$;

-- SP10: Submit rating
CREATE OR REPLACE PROCEDURE sp_submit_rating(p_trip_id BIGINT, p_score INT, p_feedback TEXT)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO rating (trip_id, score, feedback) VALUES (p_trip_id, p_score, p_feedback);
    COMMIT;
END;
$$;

-- SP11: Update GPS
CREATE OR REPLACE PROCEDURE sp_update_gps(p_trip_id BIGINT, p_x FLOAT, p_y FLOAT)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO locationhistory (trip_id, location) VALUES (p_trip_id, point(p_x, p_y));
    COMMIT;
END;
$$;

-- SP12: Send message
CREATE OR REPLACE PROCEDURE sp_send_message(
    p_chat_id BIGINT, p_sender BIGINT, p_receiver BIGINT, p_content TEXT,
    INOUT p_msg_id BIGINT DEFAULT NULL, INOUT p_sent_at TIMESTAMPTZ DEFAULT NULL
) LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO message (chat_id, sender_id, receiver_id, content)
    VALUES (p_chat_id, p_sender, p_receiver, p_content)
    RETURNING message_id, sent_at INTO p_msg_id, p_sent_at;
    COMMIT;
END;
$$;

-- SP13: Update passenger profile (TRANSACTION: appuser + passenger)
CREATE OR REPLACE PROCEDURE sp_update_passenger_profile(
    p_user_id BIGINT, p_name VARCHAR, p_cnic VARCHAR, p_phone VARCHAR
) LANGUAGE plpgsql AS $$
BEGIN
    IF p_name IS NOT NULL THEN
        UPDATE appuser SET name = p_name WHERE user_id = p_user_id;
    END IF;
    UPDATE passenger SET cnic = COALESCE(p_cnic, cnic), phone_no = COALESCE(p_phone, phone_no)
    WHERE passenger_id = p_user_id;
    COMMIT;
EXCEPTION WHEN OTHERS THEN
    ROLLBACK; RAISE;
END;
$$;

-- SP14: Update driver profile (TRANSACTION: appuser + driver)
CREATE OR REPLACE PROCEDURE sp_update_driver_profile(
    p_user_id BIGINT, p_name VARCHAR, p_phone VARCHAR
) LANGUAGE plpgsql AS $$
BEGIN
    IF p_name IS NOT NULL THEN
        UPDATE appuser SET name = p_name WHERE user_id = p_user_id;
    END IF;
    IF p_phone IS NOT NULL THEN
        UPDATE driver SET phone_no = p_phone WHERE driver_id = p_user_id;
    END IF;
    COMMIT;
EXCEPTION WHEN OTHERS THEN
    ROLLBACK; RAISE;
END;
$$;

-- SP15: Upsert vehicle (ON CONFLICT requires uq_vehicle_driver_id)
CREATE OR REPLACE PROCEDURE sp_upsert_vehicle(
    p_driver_id BIGINT, p_make VARCHAR, p_model VARCHAR, p_engine VARCHAR,
    p_chassis VARCHAR, p_plate VARCHAR, p_owner VARCHAR, p_owner_cnic VARCHAR
) LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO vehicle (driver_id, make, model, engine_no, chassis_no, plate_no, owner_name, owner_cnic)
    VALUES (p_driver_id, p_make, p_model, p_engine, p_chassis, p_plate, p_owner, p_owner_cnic)
    ON CONFLICT (driver_id) DO UPDATE SET
        make = EXCLUDED.make, model = EXCLUDED.model, engine_no = EXCLUDED.engine_no,
        chassis_no = EXCLUDED.chassis_no, plate_no = EXCLUDED.plate_no,
        owner_name = EXCLUDED.owner_name, owner_cnic = EXCLUDED.owner_cnic;
    COMMIT;
END;
$$;

-- SP16: Create ticket
CREATE OR REPLACE PROCEDURE sp_create_ticket(
    p_trip_id BIGINT, p_staff_id BIGINT, p_content TEXT,
    INOUT p_ticket_id BIGINT DEFAULT NULL
) LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO ticket (trip_id, staff_id, content, status)
    VALUES (p_trip_id, p_staff_id, p_content, 'open')
    RETURNING ticket_id INTO p_ticket_id;
    COMMIT;
END;
$$;

-- SP17: Escalate ticket
CREATE OR REPLACE PROCEDURE sp_escalate_ticket(p_ticket_id BIGINT, p_reason TEXT)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE ticket SET status = 'escalated',
        content = content || E'\n\nESCALATION REASON: ' || p_reason
    WHERE ticket_id = p_ticket_id AND is_deleted = false;
    COMMIT;
END;
$$;

-- SP18: Resolve ticket (used by staff.py AND admin.py)
CREATE OR REPLACE PROCEDURE sp_resolve_ticket(p_ticket_id BIGINT)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE ticket SET status = 'resolved' WHERE ticket_id = p_ticket_id AND is_deleted = false;
    COMMIT;
END;
$$;

-- SP19: Edit ticket (partial update with COALESCE)
CREATE OR REPLACE PROCEDURE sp_edit_ticket(p_ticket_id BIGINT, p_content TEXT, p_status VARCHAR)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE ticket SET content = COALESCE(p_content, content), status = COALESCE(p_status, status)
    WHERE ticket_id = p_ticket_id AND is_deleted = false;
    COMMIT;
END;
$$;

-- SP20: Soft-delete ticket
CREATE OR REPLACE PROCEDURE sp_soft_delete_ticket(p_ticket_id BIGINT)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE ticket SET is_deleted = true WHERE ticket_id = p_ticket_id;
    COMMIT;
END;
$$;

-- SP21: Admin create driver (TRANSACTION: appuser + driver)
CREATE OR REPLACE PROCEDURE sp_admin_create_driver(
    p_name VARCHAR, p_password VARCHAR, p_cnic VARCHAR, p_phone VARCHAR,
    INOUT p_user_id BIGINT DEFAULT NULL
) LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO appuser (name, password) VALUES (p_name, p_password) RETURNING user_id INTO p_user_id;
    INSERT INTO driver (driver_id, cnic, phone_no) VALUES (p_user_id, p_cnic, p_phone);
    COMMIT;
EXCEPTION WHEN OTHERS THEN
    ROLLBACK; RAISE;
END;
$$;

-- SP22: Admin soft-delete passenger
CREATE OR REPLACE PROCEDURE sp_admin_delete_passenger(p_id BIGINT)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE passenger SET is_deleted = true WHERE passenger_id = p_id;
    COMMIT;
END;
$$;

-- SP23: Admin soft-delete driver
CREATE OR REPLACE PROCEDURE sp_admin_delete_driver(p_id BIGINT)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE driver SET is_deleted = true WHERE driver_id = p_id;
    COMMIT;
END;
$$;

-- SP24: Super admin create staff (TRANSACTION: appuser + staff)
CREATE OR REPLACE PROCEDURE sp_super_create_staff(
    p_name VARCHAR, p_password VARCHAR, p_cnic VARCHAR, p_phone VARCHAR, p_role VARCHAR,
    INOUT p_user_id BIGINT DEFAULT NULL
) LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO appuser (name, password) VALUES (p_name, p_password) RETURNING user_id INTO p_user_id;
    INSERT INTO staff (staff_id, cnic, phone_no, role) VALUES (p_user_id, p_cnic, p_phone, p_role);
    COMMIT;
EXCEPTION WHEN OTHERS THEN
    ROLLBACK; RAISE;
END;
$$;

-- SP25: Super delete driver (TRANSACTION: driver + vehicle cascade)
CREATE OR REPLACE PROCEDURE sp_super_delete_driver(p_id BIGINT)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE driver SET is_deleted = true WHERE driver_id = p_id;
    UPDATE vehicle SET is_deleted = true WHERE driver_id = p_id;
    COMMIT;
EXCEPTION WHEN OTHERS THEN
    ROLLBACK; RAISE;
END;
$$;

-- SP26: Super delete passenger
CREATE OR REPLACE PROCEDURE sp_super_delete_passenger(p_id BIGINT)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE passenger SET is_deleted = true WHERE passenger_id = p_id;
    COMMIT;
END;
$$;

-- SP27: Super delete staff
CREATE OR REPLACE PROCEDURE sp_super_delete_staff(p_id BIGINT)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE staff SET is_deleted = true WHERE staff_id = p_id;
    COMMIT;
END;
$$;

-- 4. TRIGGERS

-- Auto-set updated_at on every UPDATE (replaces 20+ manual clauses in Python)
CREATE OR REPLACE FUNCTION fn_trg_set_updated_at() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to ALL 11 tables that have updated_at
CREATE TRIGGER trg_updated_at_driver BEFORE UPDATE ON driver FOR EACH ROW EXECUTE FUNCTION fn_trg_set_updated_at();
CREATE TRIGGER trg_updated_at_passenger BEFORE UPDATE ON passenger FOR EACH ROW EXECUTE FUNCTION fn_trg_set_updated_at();
CREATE TRIGGER trg_updated_at_trip BEFORE UPDATE ON trip FOR EACH ROW EXECUTE FUNCTION fn_trg_set_updated_at();
CREATE TRIGGER trg_updated_at_staff BEFORE UPDATE ON staff FOR EACH ROW EXECUTE FUNCTION fn_trg_set_updated_at();
CREATE TRIGGER trg_updated_at_ticket BEFORE UPDATE ON ticket FOR EACH ROW EXECUTE FUNCTION fn_trg_set_updated_at();
CREATE TRIGGER trg_updated_at_payment BEFORE UPDATE ON payment FOR EACH ROW EXECUTE FUNCTION fn_trg_set_updated_at();
CREATE TRIGGER trg_updated_at_chat BEFORE UPDATE ON chat FOR EACH ROW EXECUTE FUNCTION fn_trg_set_updated_at();
CREATE TRIGGER trg_updated_at_message BEFORE UPDATE ON message FOR EACH ROW EXECUTE FUNCTION fn_trg_set_updated_at();
CREATE TRIGGER trg_updated_at_vehicle BEFORE UPDATE ON vehicle FOR EACH ROW EXECUTE FUNCTION fn_trg_set_updated_at();
CREATE TRIGGER trg_updated_at_location BEFORE UPDATE ON locationhistory FOR EACH ROW EXECUTE FUNCTION fn_trg_set_updated_at();
CREATE TRIGGER trg_updated_at_rating BEFORE UPDATE ON rating FOR EACH ROW EXECUTE FUNCTION fn_trg_set_updated_at();

-- Prevent modifications to cancelled trips
CREATE OR REPLACE FUNCTION fn_trg_prevent_cancelled_modify() RETURNS TRIGGER AS $$
BEGIN
    IF OLD.is_deleted = true THEN
        RAISE EXCEPTION 'Cannot modify a cancelled trip';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_trip_safety BEFORE UPDATE ON trip FOR EACH ROW EXECUTE FUNCTION fn_trg_prevent_cancelled_modify();

-- Prevent double-accept race condition at DB level
CREATE OR REPLACE FUNCTION fn_trg_prevent_double_accept() RETURNS TRIGGER AS $$
BEGIN
    IF OLD.driver_id IS NOT NULL AND NEW.driver_id IS NOT NULL
       AND OLD.driver_id IS DISTINCT FROM NEW.driver_id THEN
        RAISE EXCEPTION 'Ride already accepted by another driver';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_trip_no_double_accept BEFORE UPDATE OF driver_id ON trip FOR EACH ROW EXECUTE FUNCTION fn_trg_prevent_double_accept();

-- Default ticket status to 'open' on insert
CREATE OR REPLACE FUNCTION fn_trg_default_ticket_status() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status IS NULL THEN
        NEW.status := 'open';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_ticket_default_status BEFORE INSERT ON ticket FOR EACH ROW EXECUTE FUNCTION fn_trg_default_ticket_status();