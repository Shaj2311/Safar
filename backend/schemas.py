from enum import Enum
from pydantic import BaseModel
from typing import Optional

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

class Ticket(BaseModel):
    ticketId: int
    description: str

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
