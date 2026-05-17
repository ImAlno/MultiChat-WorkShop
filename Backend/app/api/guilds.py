from fastapi import APIRouter
from app.services.discord_service import DiscordService

router = APIRouter(prefix="/guilds")

@router.get("/{guild_id}/channels")
async def get_guild_channels(guild_id: str):
    """
    Step B: Fetch text channels for a specific guild using the Bot Token.
    """
    channels = await DiscordService.fetch_guild_channels(guild_id)
    return {"channels": channels}
