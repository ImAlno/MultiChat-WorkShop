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
    """
    
    # Step B: Exchange code for access token
    # We use application/x-www-form-urlencoded as required by Discord
    token_url = "https://discord.com/api/oauth2/token"
    data = {
        "client_id": DISCORD_CLIENT_ID,
        "client_secret": DISCORD_CLIENT_SECRET,
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": DISCORD_REDIRECT_URI,
    }
    headers = {
        "Content-Type": "application/x-www-form-urlencoded"
    }

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

        # Common headers for authenticated requests
        auth_headers = {"Authorization": f"Bearer {access_token}"}

        # Step C: Fetch authenticated user data using the access token
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

        # Step D: Fetch user's servers (guilds)
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

        # Multichat server guild ID is 1505129227865817109
        guild_id = "1505129227865817109"
        
        # Step E: Fetch channels of the specific guild using the BOT TOKEN
        # Note: The bot MUST be invited to the server for this to work.
        channels_url = f"https://discord.com/api/v10/guilds/{guild_id}/channels"
        bot_headers = {"Authorization": f"Bot {DISCORD_BOT_TOKEN}"}
        
        try:
            channels_response = await client.get(channels_url, headers=bot_headers)
            channels_response.raise_for_status()
            all_channels = channels_response.json()
            
            # Filter for text channels only (type 0)
            text_channels = [c for c in all_channels if c.get("type") == 0]
        except httpx.HTTPStatusError as e:
            # This often happens if the bot is not in the server or token is invalid
            print(f"Warning: Failed to fetch channels: {e.response.text}")
            text_channels = []

        # Testing will focus on this test channel form the selected guild
        test_channel_id = "1505129301207552130"
        
        # Step F: Fetch messages from the test channel using the BOT TOKEN
        messages_url = f"https://discord.com/api/v10/channels/{test_channel_id}/messages?limit=50"
        try:
            messages_response = await client.get(messages_url, headers=bot_headers)
            messages_response.raise_for_status()
            messages_data = messages_response.json()
        except httpx.HTTPStatusError as e:
            print(f"Warning: Failed to fetch messages: {e.response.text}")
            messages_data = []

        # Step G: Return the combined data
        return {
            "user": user_data,
        #    "guilds": guilds_data,
            "channels": text_channels,
            "messages": messages_data
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3000)
