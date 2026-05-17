import os
from fastapi import FastAPI, HTTPException, Query
import httpx
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

DISCORD_CLIENT_ID = os.getenv("DISCORD_CLIENT_ID")
DISCORD_CLIENT_SECRET = os.getenv("DISCORD_CLIENT_SECRET")
DISCORD_REDIRECT_URI = os.getenv("DISCORD_REDIRECT_URI")
DISCORD_BOT_TOKEN = os.getenv("DISCORD_BOT_TOKEN")

# Basic validation for environment variables
if not all([DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, DISCORD_REDIRECT_URI, DISCORD_BOT_TOKEN]):
    print("Warning: Missing DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, DISCORD_REDIRECT_URI, or DISCORD_BOT_TOKEN in .env")

app = FastAPI(title="Discord OAuth Minimal Backend")

@app.get("/auth/discord/callback")
async def discord_callback(code: str = Query(...)):
    """
    Step A: Receive the code from Discord redirect.
    Exchanges code for token, fetches user profile and user's guilds.
    """
    token_url = "https://discord.com/api/oauth2/token"
    data = {
        "client_id": DISCORD_CLIENT_ID,
        "client_secret": DISCORD_CLIENT_SECRET,
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": DISCORD_REDIRECT_URI,
    }
    headers = {"Content-Type": "application/x-www-form-urlencoded"}

    async with httpx.AsyncClient() as client:
        try:
            token_response = await client.post(token_url, data=data, headers=headers)
            token_response.raise_for_status()
            token_data = token_response.json()
            access_token = token_data.get("access_token")
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=e.response.status_code, 
                detail=f"Failed to exchange code for token: {e.response.text}"
            )

        auth_headers = {"Authorization": f"Bearer {access_token}"}

        # Fetch authenticated user data
        user_url = "https://discord.com/api/users/@me"
        try:
            user_response = await client.get(user_url, headers=auth_headers)
            user_response.raise_for_status()
            user_data = user_response.json()
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=e.response.status_code, 
                detail=f"Failed to fetch user profile: {e.response.text}"
            )

        # Fetch user's servers (guilds)
        guilds_url = "https://discord.com/api/users/@me/guilds"
        try:
            guilds_response = await client.get(guilds_url, headers=auth_headers)
            guilds_response.raise_for_status()
            guilds_data = guilds_response.json()
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=e.response.status_code, 
                detail=f"Failed to fetch user guilds: {e.response.text}"
            )

        return {
            "access_token": access_token, # Returning this so the frontend can store it if needed
            "user": user_data,
            "guilds": guilds_data
        }

@app.get("/guilds/{guild_id}/channels")
async def get_guild_channels(guild_id: str):
    """
    Step B: Fetch text channels for a specific guild using the Bot Token.
    """
    if not DISCORD_BOT_TOKEN:
        raise HTTPException(status_code=500, detail="Bot token not configured")
        
    channels_url = f"https://discord.com/api/v10/guilds/{guild_id}/channels"
    bot_headers = {"Authorization": f"Bot {DISCORD_BOT_TOKEN}"}
    
    async with httpx.AsyncClient() as client:
        try:
            channels_response = await client.get(channels_url, headers=bot_headers)
            channels_response.raise_for_status()
            all_channels = channels_response.json()
            
            # Filter for text channels only (type 0)
            text_channels = [c for c in all_channels if c.get("type") == 0]
            return {"channels": text_channels}
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"Failed to fetch channels: {e.response.text}"
            )

@app.get("/channels/{channel_id}/messages")
async def get_channel_messages(channel_id: str, limit: int = 100):
    """
    Step C: Fetch messages from a specific channel using the Bot Token.
    """
    if not DISCORD_BOT_TOKEN:
        raise HTTPException(status_code=500, detail="Bot token not configured")
        
    messages_url = f"https://discord.com/api/v10/channels/{channel_id}/messages?limit={limit}"
    bot_headers = {"Authorization": f"Bot {DISCORD_BOT_TOKEN}"}
    
    async with httpx.AsyncClient() as client:
        try:
            messages_response = await client.get(messages_url, headers=bot_headers)
            messages_response.raise_for_status()
            messages_data = messages_response.json()
            return {"messages": messages_data}
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"Failed to fetch messages: {e.response.text}"
            )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3000)
