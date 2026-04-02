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

CREATE TABLE Driver (
  driver_id bigint generated always as identity,
  name varchar not null,
  password varchar not null,
  cnic varchar,
  phone_no varchar(20) not null,
  is_deleted boolean not null default false,
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  PRIMARY KEY (driver_id)
);

CREATE TABLE Passenger (
  passenger_id bigint generated always as identity,
  name varchar not null,
  password varchar not null,
  cnic varchar,
  phone_no varchar(20) not null,
  is_deleted boolean not null default false,
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  PRIMARY KEY (passenger_id)
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
  staff_id bigint generated always as identity,
  name varchar not null,
  password varchar not null,
  cnic varchar,
  phone_no varchar(20) not null,
  role varchar(20) not null check (role in ('admin', 'support')),
  is_deleted boolean not null default false,
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  PRIMARY KEY (staff_id)
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

INSERT INTO Driver (name, password, cnic, phone_no) VALUES 
('Driver 1', 'pass1', '11111-1111111-1', '03001111111'),
('Driver 2', 'pass2', '22222-2222222-2', '03002222222');

INSERT INTO Passenger (name, password, cnic, phone_no) VALUES 
('Passenger A', 'passA', '33333-3333333-3', '03003333333'),
('Passenger B', 'passB', '44444-4444444-4', '03004444444');

INSERT INTO Vehicle (driver_id, make, model, engine_no, chassis_no, plate_no) VALUES 
(1, 'Toyota', 'Corolla', 'ENG001', 'CHA001', 'ABC-001'),
(2, 'Honda', 'Civic', 'ENG002', 'CHA002', 'XYZ-002');

INSERT INTO Staff (name, password, cnic, phone_no, role) VALUES 
('Admin 1', 'adminpass', '55555-5555555-5', '03005555555', 'admin'),
('Support 1', 'supportpass', '66666-6666666-6', '03006666666', 'support');

INSERT INTO Trip (passenger_id, driver_id, pickup_loc, dropoff_loc, estimated_dist) VALUES 
(1, 1, point(0,0), point(1,1), 10.0);
