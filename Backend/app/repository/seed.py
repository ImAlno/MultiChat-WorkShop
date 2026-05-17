import asyncio
from app.repository.db import async_session_maker
from app.repository.models import Message

async def seed_data():
    print("Connecting to database and beginning transaction...")
    
    # Open an async database session
    async with async_session_maker() as session:
        # Open an explicit transaction block
        # Everything inside this block is treated as one atomic operation.
        # It automatically COMMITS when the block exits, or ROLLBACKS if an error occurs.
        async with session.begin():
            
            # Create a test message instance
            test_message = Message(
                id="seed_msg_12345",
                content="Hello from the seed.py script! This insertion ran inside an explicit Python transaction.",
                channel_id="1505129301207552130",
                author_id="seed_author_99",
                author_username="SystemSeeder",
                timestamp="2026-05-17T11:35:00Z"
            )
            
            # Merge the record (upsert: inserts if missing, updates if already exists)
            # In an explicit transaction, we stage operations on the session.
            await session.merge(test_message)
            print(f"Staged record '{test_message.id}' inside the transaction block.")

    # Once we exit the `session.begin()` block, SQLModel automatically runs a COMMIT query.
    print("Transaction committed successfully! Data is now fully written in Postgres.")

if __name__ == "__main__":
    # Run the async seeding runner
    asyncio.run(seed_data())
