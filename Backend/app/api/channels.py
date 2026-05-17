from fastapi import APIRouter, Depends
from sqlmodel.ext.asyncio.session import AsyncSession
from app.services.discord_service import DiscordService
from app.repository.db import get_db_session
from app.repository.message_repo import MessageRepository

router = APIRouter(prefix="/channels")

@router.get("/{channel_id}/messages")
async def get_channel_messages(
    channel_id: str,
    limit: int = 100,
    db: AsyncSession = Depends(get_db_session)
):
    """
    Step C: Fetch messages from a specific channel using the Bot Token,
    persists them to the local SQLite database using the MessageRepository,
    and returns the stored entries.
    """
    # 1. Fetch live messages from the Discord service
    raw_messages = await DiscordService.fetch_channel_messages(channel_id, limit)
    
    # 2. Store them locally in the database via the Repository layer
    db_messages = await MessageRepository.save_messages(db, raw_messages, channel_id)
    
    return {"messages": db_messages}
