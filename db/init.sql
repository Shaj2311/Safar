DROP TABLE IF EXISTS LocationHistory;
DROP TABLE IF EXISTS Vehicle;
DROP TABLE IF EXISTS Message;
DROP TABLE IF EXISTS Chat;
DROP TABLE IF EXISTS Payment;
DROP TABLE IF EXISTS Ticket;
DROP TABLE IF EXISTS Trip;

DROP TABLE IF EXISTS Staff;
DROP TABLE IF EXISTS Passenger;
DROP TABLE IF EXISTS Driver;
DROP TABLE IF EXISTS AppUser;


CREATE TABLE AppUser (
  user_id bigint generated always as identity,
  name varchar not null,
  password varchar not null,
  PRIMARY KEY (user_id)
);

CREATE TABLE Driver (
  driver_id bigint PRIMARY KEY REFERENCES AppUser(user_id) ON DELETE CASCADE,
  cnic varchar,
  phone_no varchar(20) not null,
  is_deleted boolean not null default false,
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

CREATE TABLE Passenger (
  passenger_id bigint PRIMARY KEY REFERENCES AppUser(user_id) ON DELETE CASCADE,
  cnic varchar,
  phone_no varchar(20) not null,
  is_deleted boolean not null default false,
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

CREATE TABLE Trip (
  trip_id bigint generated always as identity,
  passenger_id bigint,
  driver_id bigint,
  start_time timestamptz not null default now(),
  end_time timestamptz,
  pickup_loc point not null,
  dropoff_loc point not null,
  estimated_dist decimal(10,2),
  actual_dist decimal(10,2),
  is_deleted boolean not null default false,
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  PRIMARY KEY (trip_id),
  CONSTRAINT FK_Trip_driver_id
    FOREIGN KEY (driver_id)
      REFERENCES Driver(driver_id),
  CONSTRAINT FK_Trip_passenger_id
    FOREIGN KEY (passenger_id)
      REFERENCES Passenger(passenger_id)
);

CREATE TABLE Staff (
  staff_id bigint PRIMARY KEY REFERENCES AppUser(user_id) ON DELETE CASCADE,
  cnic varchar,
  phone_no varchar(20) not null,
  role varchar(20) not null check (role in ('admin', 'support')),
  is_deleted boolean not null default false,
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

CREATE TABLE Ticket (
  ticket_id bigint generated always as identity,
  trip_id bigint,
  staff_id bigint,
  content text not null,
  timestamp timestamptz not null default now(),
  status varchar(20) not null check (status in ('open', 'resolved', 'escalated')),
  is_deleted boolean not null default false,
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  PRIMARY KEY (ticket_id),
  CONSTRAINT FK_Ticket_trip_id
    FOREIGN KEY (trip_id)
      REFERENCES Trip(trip_id),
  CONSTRAINT FK_Ticket_staff_id
    FOREIGN KEY (staff_id)
      REFERENCES Staff(staff_id)
);

CREATE TABLE Payment (
  payment_id bigint generated always as identity,
  trip_id bigint,
  base_amount decimal(10,2) not null,
  trip_amount decimal(10,2) not null,
  estimated_fare decimal(10,2) not null,
  actual_fare decimal(10,2) not null,
  is_paid boolean not null default false,
  is_deleted boolean not null default false,
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  PRIMARY KEY (payment_id),
  CONSTRAINT FK_Payment_trip_id
    FOREIGN KEY (trip_id)
      REFERENCES Trip(trip_id)
);

CREATE TABLE Chat (
  chat_id bigint generated always as identity,
  trip_id bigint,
  is_deleted boolean not null default false,
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  PRIMARY KEY (chat_id),
  CONSTRAINT FK_Chat_trip_id
    FOREIGN KEY (trip_id)
      REFERENCES Trip(trip_id)
);

CREATE TABLE Message (
  message_id bigint generated always as identity,
  chat_id bigint,
  sender_id bigint not null,
  receiver_id bigint not null,
  content text not null,
  sent_at timestamptz not null default now(),
  is_deleted boolean not null default false,
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  PRIMARY KEY (message_id),
  CONSTRAINT FK_Message_chat_id
    FOREIGN KEY (chat_id)
      REFERENCES Chat(chat_id)
);

CREATE TABLE Vehicle (
  vehicle_id bigint generated always as identity,
  driver_id bigint,
  make varchar not null,
  model varchar not null,
  engine_no varchar not null,
  chassis_no varchar not null,
  plate_no varchar,
  owner_name varchar,
  owner_cnic varchar,
  is_deleted boolean not null default false,
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  PRIMARY KEY (vehicle_id),
  CONSTRAINT FK_Vehicle_driver_id
    FOREIGN KEY (driver_id)
      REFERENCES Driver(driver_id)
);

CREATE TABLE LocationHistory (
  location_id bigint generated always as identity,
  trip_id bigint,
  location point not null,
  timestamp timestamptz not null default now(),
  is_deleted boolean not null default false,
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  PRIMARY KEY (location_id),
  CONSTRAINT FK_LocationHistory_trip_id
    FOREIGN KEY (trip_id)
      REFERENCES Trip(trip_id)
);



-- -- Insert Drivers
-- WITH new_user AS (
--     INSERT INTO AppUser (name, password)
--     VALUES ('Driver A', 'pass1')
--     RETURNING user_id
-- )
-- INSERT INTO Driver (driver_id, cnic, phone_no)
-- SELECT user_id, '11111-1111111-1', '01001111111'
-- FROM new_user;
-- 
-- WITH new_user AS (
--     INSERT INTO AppUser (name, password)
--     VALUES ('Driver B', 'pass2')
--     RETURNING user_id
-- )
-- INSERT INTO Driver (driver_id, cnic, phone_no)
-- SELECT user_id, '22222-2222222-2', '02002222222'
-- FROM new_user;
-- 
-- 
-- 
-- -- Insert Passengers
-- WITH new_user AS (
--     INSERT INTO AppUser (name, password)
--     VALUES ('Passenger A', 'passA')
--     RETURNING user_id
-- )
-- INSERT INTO Passenger (passenger_id, cnic, phone_no)
-- SELECT user_id, '33333-3333333-3', '03003333333'
-- FROM new_user;
-- 
-- 
-- WITH new_user AS (
--     INSERT INTO AppUser (name, password)
--     VALUES ('Passenger B', 'passB')
--     RETURNING user_id
-- )
-- INSERT INTO Passenger (passenger_id, cnic, phone_no)
-- SELECT user_id, '44444-4444444-4', '04004444444'
-- FROM new_user;
-- 
-- 
-- 
-- 
-- INSERT INTO Vehicle (driver_id, make, model, engine_no, chassis_no, plate_no) VALUES
-- (1, 'Toyota', 'Corolla', 'ENG001', 'CHA001', 'ABC-001'),
-- (2, 'Honda', 'Civic', 'ENG002', 'CHA002', 'XYZ-002');
-- 
-- 
-- 
-- 
-- -- Insert Staff
-- WITH new_user AS (
--     INSERT INTO AppUser (name, password)
--     VALUES ('Admin 1', 'adminpass')
--     RETURNING user_id
-- )
-- INSERT INTO Staff (staff_id, cnic, phone_no, role)
-- SELECT user_id, '55555-5555555-5', '05005555555', 'admin'
-- FROM new_user;
-- 
-- 
-- WITH new_user AS (
--     INSERT INTO AppUser (name, password)
--     VALUES ('Support 1', 'supportpass')
--     RETURNING user_id
-- )
-- INSERT INTO Staff (staff_id, cnic, phone_no, role)
-- SELECT user_id, '66666-6666666-6', '06006666666', 'support'
-- FROM new_user;
-- 
-- 
-- 
-- INSERT INTO Trip (passenger_id, driver_id, pickup_loc, dropoff_loc, estimated_dist) VALUES
-- (3, 1, point(0,0), point(1,1), 10.0);

INSERT INTO AppUser (name, password) VALUES 
('John Driver', 'securepass123'),
('Jane Driver', 'securepass456'),
('Alice Passenger', 'alicepass'),
('Bob Passenger', 'bobpass'),
('Charlie Admin', 'adminpass'),
('Dana Support', 'supportpass');

INSERT INTO Driver (driver_id, cnic, phone_no, is_deleted, inserted_at, updated_at) VALUES
(1, '42101-1234567-1', '+923001112221', false, now(), now()),
(2, '42101-7654321-2', '+923001112222', false, now(), now());

INSERT INTO Passenger (passenger_id, cnic, phone_no, is_deleted, inserted_at, updated_at) VALUES
(3, '42101-1111111-3', '+923003334443', false, now(), now()),
(4, '42101-2222222-4', '+923003334444', false, now(), now());

INSERT INTO Staff (staff_id, cnic, phone_no, role, is_deleted, inserted_at, updated_at) VALUES
(5, '42101-9999999-5', '+923005556665', 'admin', false, now(), now()),
(6, '42101-8888888-6', '+923005556666', 'support', false, now(), now());

INSERT INTO Vehicle (driver_id, make, model, engine_no, chassis_no, plate_no, owner_name, owner_cnic, is_deleted, inserted_at, updated_at) VALUES
(1, 'Toyota', 'Corolla', 'ENG-101', 'CHS-101', 'ABC-123', 'John Driver', '42101-1234567-1', false, now(), now()),
(2, 'Honda', 'Civic', 'ENG-202', 'CHS-202', 'XYZ-789', 'Jane Driver', '42101-7654321-2', false, now(), now());

INSERT INTO Trip (passenger_id, driver_id, start_time, end_time, pickup_loc, dropoff_loc, estimated_dist, actual_dist, is_deleted, inserted_at, updated_at) VALUES
(3, 1, now() - interval '1 hour', now() - interval '30 minutes', point(24.86, 67.00), point(24.92, 67.12), 12.5, 13.1, false, now(), now()),
(4, 2, now() - interval '2 hours', now() - interval '1 hour', point(31.52, 74.35), point(31.45, 74.20), 8.0, 8.2, false, now(), now());

INSERT INTO Chat (trip_id, is_deleted, inserted_at, updated_at) VALUES 
(1, false, now(), now()),
(2, false, now(), now());

-- Populate Messages
INSERT INTO Message (chat_id, sender_id, receiver_id, content, sent_at, is_deleted, inserted_at, updated_at) VALUES
(1, 3, 1, 'I am waiting near the main gate.', now() - interval '55 minutes', false, now(), now()),
(1, 1, 3, 'Understood, I am in a white Corolla.', now() - interval '54 minutes', false, now(), now()),
(2, 4, 2, 'Please turn on the AC.', now() - interval '115 minutes', false, now(), now()),
(2, 2, 4, 'Sure thing, see you soon.', now() - interval '114 minutes', false, now(), now());

INSERT INTO Payment (trip_id, base_amount, trip_amount, estimated_fare, actual_fare, is_paid, is_deleted, inserted_at, updated_at) VALUES
(1, 100.00, 550.00, 600.00, 650.00, true, false, now(), now()),
(2, 100.00, 300.00, 400.00, 400.00, true, false, now(), now());

INSERT INTO Ticket (trip_id, staff_id, content, timestamp, status, is_deleted, inserted_at, updated_at) VALUES
(1, 6, 'Passenger reported extra waiting time.', now(), 'resolved', false, now(), now()),
(2, 6, 'Driver reported wrong pickup location on map.', now(), 'open', false, now(), now());

INSERT INTO LocationHistory (trip_id, location, timestamp, is_deleted, inserted_at, updated_at) VALUES
(1, point(24.86, 67.00), now() - interval '50 minutes', false, now(), now()),
(1, point(24.89, 67.05), now() - interval '40 minutes', false, now(), now()),
(2, point(31.52, 74.35), now() - interval '110 minutes', false, now(), now()),
(2, point(31.48, 74.28), now() - interval '100 minutes', false, now(), now());
