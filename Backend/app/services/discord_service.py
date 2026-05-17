import httpx
from app.config import settings
from fastapi import HTTPException

class DiscordService:
    @staticmethod
    async def exchange_code_for_token(code: str) -> str:
        """Exchanges an authorization code for an OAuth access token."""
        token_url = "https://discord.com/api/oauth2/token"
        data = {
            "client_id": settings.DISCORD_CLIENT_ID,
            "client_secret": settings.DISCORD_CLIENT_SECRET,
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": settings.DISCORD_REDIRECT_URI,
        }
        headers = {"Content-Type": "application/x-www-form-urlencoded"}

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(token_url, data=data, headers=headers)
                response.raise_for_status()
                token_data = response.json()
                return token_data.get("access_token")
            except httpx.HTTPStatusError as e:
                raise HTTPException(
                    status_code=e.response.status_code,
                    detail=f"Failed to exchange code for token: {e.response.text}"
                )

    @staticmethod
    async def fetch_user_profile(access_token: str) -> dict:
        """Fetches the logged-in user's Discord profile details."""
        url = "https://discord.com/api/users/@me"
        headers = {"Authorization": f"Bearer {access_token}"}
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url, headers=headers)
                response.raise_for_status()
                return response.json()
            except httpx.HTTPStatusError as e:
                raise HTTPException(
                    status_code=e.response.status_code,
                    detail=f"Failed to fetch user profile: {e.response.text}"
                )

    @staticmethod
    async def fetch_user_guilds(access_token: str) -> list:
        """Fetches the logged-in user's servers (guilds)."""
        url = "https://discord.com/api/users/@me/guilds"
        headers = {"Authorization": f"Bearer {access_token}"}
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url, headers=headers)
                response.raise_for_status()
                return response.json()
            except httpx.HTTPStatusError as e:
                raise HTTPException(
                    status_code=e.response.status_code,
                    detail=f"Failed to fetch user guilds: {e.response.text}"
                )

    @staticmethod
    async def fetch_guild_channels(guild_id: str) -> list:
        """Fetches all text channels of a specific guild using Bot Authorization."""
        if not settings.DISCORD_BOT_TOKEN:
            raise HTTPException(status_code=500, detail="Bot token not configured")
            
        url = f"https://discord.com/api/v10/guilds/{guild_id}/channels"
        headers = {"Authorization": f"Bot {settings.DISCORD_BOT_TOKEN}"}
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url, headers=headers)
                response.raise_for_status()
                all_channels = response.json()
                
                # Filter for text channels only (type 0)
                return [c for c in all_channels if c.get("type") == 0]
            except httpx.HTTPStatusError as e:
                raise HTTPException(
                    status_code=e.response.status_code,
                    detail=f"Failed to fetch channels: {e.response.text}"
                )

    @staticmethod
    async def fetch_channel_messages(channel_id: str, limit: int = 100) -> list:
        """Fetches up to 'limit' messages from a channel using Bot Authorization."""
        if not settings.DISCORD_BOT_TOKEN:
            raise HTTPException(status_code=500, detail="Bot token not configured")
            
        url = f"https://discord.com/api/v10/channels/{channel_id}/messages?limit={limit}"
        headers = {"Authorization": f"Bot {settings.DISCORD_BOT_TOKEN}"}
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url, headers=headers)
                response.raise_for_status()
                return response.json()
            except httpx.HTTPStatusError as e:
                raise HTTPException(
                    status_code=e.response.status_code,
                    detail=f"Failed to fetch messages: {e.response.text}"
                )
