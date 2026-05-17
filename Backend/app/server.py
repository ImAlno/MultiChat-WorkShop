from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.repository.db import init_db
from app.api.auth import router as auth_router
from app.api.guilds import router as guilds_router
from app.api.channels import router as channels_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Automatically initialize SQLite database tables on startup
    await init_db()
    yield

app = FastAPI(
    title="Discord OAuth Modular Backend",
    lifespan=lifespan
)

# Mount Layer 1 Routers
app.include_router(auth_router)
app.include_router(guilds_router)
app.include_router(channels_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.server:app", host="0.0.0.0", port=3000, reload=True)
