from sqlmodel import SQLModel, Field
from typing import Optional

class Message(SQLModel, table=True):
    id: str = Field(primary_key=True, index=True)
    content: str
    channel_id: str = Field(index=True)
    author_id: str
    author_username: str
    timestamp: str
