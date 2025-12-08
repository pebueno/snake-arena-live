import asyncio
import uuid
import random
from datetime import datetime
from app.database import AsyncSessionLocal, init_db, engine
from app.models import User, LeaderboardEntry, ActivePlayer, GameMode
from sqlalchemy import select

async def seed_data():
    print("Creating tables...")
    await init_db()

    async with AsyncSessionLocal() as session:
        print("Checking for existing data...")
        result = await session.execute(select(User))
        if result.scalars().first():
            print("Data already exists. Skipping seed.")
            return

        print("Seeding users...")
        users_data = [
            ("SnakeMaster", "snake@example.com", "password"),
            ("PixelPython", "pixel@example.com", "password"),
            ("NeonNibbler", "neon@example.com", "password"),
            ("RetroReptile", "retro@example.com", "password"),
            ("ArcadeAce", "arcade@example.com", "password"),
        ]

        users = {}
        for username, email, password in users_data:
            user = User(
                id=str(uuid.uuid4()),
                username=username,
                email=email,
                password_hash=password, # In real app, hash this!
                created_at=datetime.utcnow()
            )
            session.add(user)
            users[username] = user
        
        # Flush to get user IDs if needed (though we generated UUIDs manually)
        # But we need to add them to session to establish relationships if we were adding via relationship
        
        print("Seeding leaderboard...")
        for user in users.values():
            # Walls mode
            session.add(LeaderboardEntry(
                id=str(uuid.uuid4()),
                user_id=user.id,
                username=user.username,
                score=random.randint(500, 3000),
                mode=GameMode.WALLS,
                played_at=datetime.utcnow()
            ))
            
            # Pass-through mode
            session.add(LeaderboardEntry(
                id=str(uuid.uuid4()),
                user_id=user.id,
                username=user.username,
                score=random.randint(500, 3000),
                mode=GameMode.PASS_THROUGH,
                played_at=datetime.utcnow()
            ))

        print("Seeding active players...")
        active_usernames = ["NeonNibbler", "RetroReptile"]
        for username in active_usernames:
            user = users.get(username)
            if user:
                session.add(ActivePlayer(
                    id=user.id,
                    username=user.username,
                    current_score=random.randint(100, 1000),
                    mode=random.choice(list(GameMode)),
                    started_at=datetime.utcnow()
                ))

        await session.commit()
        print("Seeding complete!")

async def main():
    await seed_data()
    # Close the engine
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
