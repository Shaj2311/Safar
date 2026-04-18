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
