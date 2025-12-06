from typing import List, Optional, Dict
from datetime import datetime
import uuid
from .models import User, UserCreate, LeaderboardEntry, ActivePlayer, GameMode

class MockDB:
    def __init__(self):
        self.users: Dict[str, User] = {}
        self.users_by_email: Dict[str, User] = {}
        self.passwords: Dict[str, str] = {} # Store passwords separately
        self.leaderboard: List[LeaderboardEntry] = []
        self.active_players: List[ActivePlayer] = []
        
        # Seed data
        self._seed()

    def _seed(self):
        # Seed users
        users_data = [
            ("SnakeMaster", "snake@example.com", "password"),
            ("PixelPython", "pixel@example.com", "password"),
            ("NeonNibbler", "neon@example.com", "password"),
            ("RetroReptile", "retro@example.com", "password"),
            ("ArcadeAce", "arcade@example.com", "password"),
        ]

        for username, email, password in users_data:
            user_id = str(uuid.uuid4())
            user = User(
                id=user_id,
                username=username,
                email=email,
                createdAt=datetime.now()
            )
            self.users[user_id] = user
            self.users_by_email[email] = user
            self.passwords[email] = password
            
            # Seed leaderboard for each user with random scores
            import random
            
            # Walls mode
            self.leaderboard.append(LeaderboardEntry(
                id=str(uuid.uuid4()),
                userId=user_id,
                username=username,
                score=random.randint(500, 3000),
                mode=GameMode.WALLS,
                playedAt=datetime.now()
            ))
            
            # Pass-through mode
            self.leaderboard.append(LeaderboardEntry(
                id=str(uuid.uuid4()),
                userId=user_id,
                username=username,
                score=random.randint(500, 3000),
                mode=GameMode.PASS_THROUGH,
                playedAt=datetime.now()
            ))

        # Seed specific active players
        active_usernames = ["NeonNibbler", "RetroReptile"]
        for username in active_usernames:
             # Find user to reuse ID if possible, or just generate new random active player
             user = next((u for u in self.users.values() if u.username == username), None)
             if user:
                 self.active_players.append(ActivePlayer(
                     id=user.id,
                     username=user.username,
                     currentScore=random.randint(100, 1000),
                     mode=random.choice(list(GameMode)),
                     startedAt=datetime.now()
                 ))

    def create_user(self, user_create: UserCreate) -> User:
        if user_create.email in self.users_by_email:
            raise ValueError("Email already registered")
        
        # Check username uniqueness (simple check)
        for user in self.users.values():
            if user.username == user_create.username:
                raise ValueError("Username already taken")

        user_id = str(uuid.uuid4())
        user = User(
            id=user_id,
            username=user_create.username,
            email=user_create.email,
            createdAt=datetime.now()
        )
        
        self.users[user_id] = user
        self.users_by_email[user.email] = user
        self.passwords[user.email] = user_create.password
        
        return user

    def get_user_by_email(self, email: str) -> Optional[User]:
        return self.users_by_email.get(email)

    def verify_password(self, email: str, password: str) -> bool:
        return self.passwords.get(email) == password

    def get_leaderboard(self, mode: Optional[GameMode] = None, limit: int = 10) -> List[LeaderboardEntry]:
        entries = self.leaderboard
        if mode:
            entries = [e for e in entries if e.mode == mode]
        
        return sorted(entries, key=lambda x: x.score, reverse=True)[:limit]

    def submit_score(self, user_id: str, score: int, mode: GameMode) -> int:
        user = self.users.get(user_id)
        if not user:
            raise ValueError("User not found")

        entry = LeaderboardEntry(
            id=str(uuid.uuid4()),
            userId=user_id,
            username=user.username,
            score=score,
            mode=mode,
            playedAt=datetime.now()
        )
        self.leaderboard.append(entry)
        
        # Calculate rank
        sorted_entries = self.get_leaderboard(mode=mode, limit=1000) # Get all for ranking
        rank = next((i + 1 for i, e in enumerate(sorted_entries) if e.id == entry.id), -1)
        
        return rank

    def get_active_players(self) -> List[ActivePlayer]:
        return self.active_players

    def get_player_by_id(self, player_id: str) -> Optional[ActivePlayer]:
        return next((p for p in self.active_players if p.id == player_id), None)

db = MockDB()
