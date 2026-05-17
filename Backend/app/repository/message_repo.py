from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from app.repository.models import Message
from typing import List

class MessageRepository:
    @staticmethod
    async def get_messages_by_channel(session: AsyncSession, channel_id: str, limit: int = 100) -> List[Message]:
        """Fetch stored messages for a specific channel from the database."""
        statement = select(Message).where(Message.channel_id == channel_id).order_by(Message.timestamp.desc()).limit(limit)
        result = await session.exec(statement)
        return result.all()

    @staticmethod
    async def save_messages(session: AsyncSession, messages_data: List[dict], channel_id: str) -> List[Message]:
        """Upsert raw message payloads from Discord API into the database."""
        db_messages = []
        for msg in messages_data:
            msg_id = msg.get("id")
            if not msg_id:
                continue
                
            author = msg.get("author", {})
            db_message = Message(
                id=msg_id,
                content=msg.get("content", ""),
                channel_id=channel_id,
                author_id=author.get("id", "unknown"),
                author_username=author.get("username", "unknown"),
                timestamp=msg.get("timestamp", "")
            )
            
            # Using merge acts as an upsert (inserts if new, updates if existing)
            await session.merge(db_message)
            db_messages.append(db_message)
            
        await session.commit()
        return db_messages
