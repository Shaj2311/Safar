from enum import Enum
from pydantic import BaseModel
from typing import Optional, Literal

class User(BaseModel):
    name: str
    password: str

class PassengerSignup(User):
    phoneNo: str
    cnic: Optional[str] = None

class DriverSignup(User):
    phoneNo: str
    cnic: str

class StaffBase(User):
    phoneNo: str
    cnic: str

class StaffSignup(StaffBase):
    pass

class AdminSignup(StaffBase):
    pass

class SuperAdminSignup(StaffBase):
    pass

class Message(BaseModel):
    receiverId: int
    content: str

class DriverProfileUpdate(BaseModel):
    name: Optional[str] = None
    phoneNo: Optional[str] = None

class AcceptRide(BaseModel):
    tripId: int

class RideRequest(BaseModel):
    pickup_x: float
    pickup_y: float
    dropoff_x: float
    dropoff_y: float

class GPSData(BaseModel):
    x: float
    y: float

class RatingData(BaseModel):
    score: int
    feedback: Optional[str] = None

class PassengerUpdate(BaseModel):
    name: Optional[str] = None
    cnic: Optional[str] = None
    phone: Optional[str] = None

class DriverUpdate(BaseModel):
    name: Optional[str] = None
    phone_no: Optional[str] = None

class VehicleUpdate(BaseModel):
    make: str
    model: str
    engine_no: str
    chassis_no: str
    plate_no: Optional[str] = None
    owner_name: Optional[str] = None
    owner_cnic: Optional[str] = None

class AdminDriverCreate(BaseModel):
    name: str
    password: str
    cnic: str
    phone_no: str

class TicketUpdate(BaseModel):
    content: Optional[str] = None
    status: Optional[Literal['open', 'resolved', 'escalated']] = None

class StaffCreate(BaseModel):
    name: str
    password: str
    cnic: str
    phone_no: str
    role: Literal['admin', 'support']

class TicketCreate(BaseModel):
    trip_id: int
    staff_id: int
    content: str

class Role(str, Enum):
    PASSENGER = "passenger"
    DRIVER = "driver"
    SUPPORT = "supportstaff"
    ADMIN = "admin"

ROLE_TABLE_MAP = {
        Role.PASSENGER: "passenger",
        Role.DRIVER: "driver",
        Role.SUPPORT: "staff",
        Role.ADMIN: "staff"
        }
