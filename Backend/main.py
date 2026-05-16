import os
from fastapi import FastAPI, HTTPException, Query
import httpx
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

DISCORD_CLIENT_ID = os.getenv("DISCORD_CLIENT_ID")
DISCORD_CLIENT_SECRET = os.getenv("DISCORD_CLIENT_SECRET")
DISCORD_REDIRECT_URI = os.getenv("DISCORD_REDIRECT_URI")

# Basic validation for environment variables
if not all([DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, DISCORD_REDIRECT_URI]):
    print("Warning: Missing DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, or DISCORD_REDIRECT_URI in .env")

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

        # Step C: Fetch authenticated user data using the access token
        user_url = "https://discord.com/api/users/@me"
        user_headers = {
            "Authorization": f"Bearer {access_token}"
        }

        try:
            user_response = await client.get(user_url, headers=user_headers)
            user_response.raise_for_status()
            user_data = user_response.json()
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=e.response.status_code, 
                detail=f"Failed to fetch user profile: {e.response.text}"
            )

        # Step D: Return the user data
        return user_data

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3000)
