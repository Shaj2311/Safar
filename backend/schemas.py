from enum import Enum

from pydantic import BaseModel

class User(BaseModel):
    username: str
    password: str

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
