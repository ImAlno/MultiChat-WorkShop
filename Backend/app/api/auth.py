from fastapi import APIRouter, Query
from app.services.discord_service import DiscordService

router = APIRouter(prefix="/auth")

@router.get("/discord/callback")
async def discord_callback(code: str = Query(...)):
    """
    Step A: Receive the code from Discord redirect.
    Exchanges code for access token, fetches user profile and user's guilds.
    """
    access_token = await DiscordService.exchange_code_for_token(code)
    user_data = await DiscordService.fetch_user_profile(access_token)
    guilds_data = await DiscordService.fetch_user_guilds(access_token)
    
    return {
        "access_token": access_token,
        "user": user_data,
        "guilds": guilds_data
    }
