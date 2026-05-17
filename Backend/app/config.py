import os
import re
from dotenv import load_dotenv

# Load env file
load_dotenv()

class Settings:
    DISCORD_CLIENT_ID: str = os.getenv("DISCORD_CLIENT_ID", "")
    DISCORD_CLIENT_SECRET: str = os.getenv("DISCORD_CLIENT_SECRET", "")
    DISCORD_REDIRECT_URI: str = os.getenv("DISCORD_REDIRECT_URI", "")
    DISCORD_BOT_TOKEN: str = os.getenv("DISCORD_BOT_TOKEN", "")

    @property
    def DATABASE_URL(self) -> str:
        """
        Retrieves the DATABASE_URL from environment variables and formats it 
        with the correct 'postgresql+asyncpg://' prefix required by SQLAlchemy.
        Raises a ValueError if the variable is missing.
        """
        url = os.getenv("DATABASE_URL")
        if not url:
            raise ValueError(
                "DATABASE_URL is missing from environment variables. "
                "Please configure it in your .env file."
            )

        # SQLAlchemy's asyncpg driver requires the 'postgresql+asyncpg://' prefix.
        # This replaces standard 'postgres://' or 'postgresql://' prefixes safely.
        if url.startswith("postgres://"):
            return url.replace("postgres://", "postgresql+asyncpg://", 1)
        elif url.startswith("postgresql://"):
            return url.replace("postgresql://", "postgresql+asyncpg://", 1)

        return url

settings = Settings()
