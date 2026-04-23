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
    pass  # Standard support/staff role

class AdminSignup(StaffBase):
    pass  # Admin role

class SuperAdminSignup(StaffBase):
    pass  # Superadmin role

class Message(BaseModel):
    messageId: int
    content: str

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
