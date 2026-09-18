import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.user import User
from app.models.workspace import Workspace
from app.models.music import AudioTrack
from app.models.finance import Transaction, Budget, SavingsGoal
from app.core.security import get_password_hash

logger = logging.getLogger(__name__)


async def seed_initial_data(db: AsyncSession):
    # 1. Seed Default User 'jelvis'
    user_res = await db.execute(select(User).where(User.username == "jelvis"))
    jelvis_user = user_res.scalars().first()

    if not jelvis_user:
        logger.info("Seeding user 'jelvis' into database...")
        jelvis_user = User(
            email="jelvis@bcas.co.id",
            username="jelvis",
            hashed_password=get_password_hash("Buddhabca5"),
            full_name="Jelvis — BCAS Workspace",
            is_active=True,
            is_superuser=True,
        )
        db.add(jelvis_user)
        await db.commit()
        await db.refresh(jelvis_user)

    # 2. Seed Default Workspace for jelvis
    ws_res = await db.execute(select(Workspace).where(Workspace.created_by == jelvis_user.id))
    default_ws = ws_res.scalars().first()
    if not default_ws:
        default_ws = Workspace(
            name="Jelvis BCAS Main Workspace",
            slug="bcas-main",
            created_by=jelvis_user.id,
        )
        db.add(default_ws)
        await db.commit()
        await db.refresh(default_ws)

    # 3. Seed Open Source & Popular Trending Songs into audio_tracks
    open_source_trending_songs = [
        {
            "title": "Die With A Smile",
            "artist": "Lady Gaga & Bruno Mars",
            "album": "Die With A Smile - Single",
            "duration_seconds": 251,
            "audio_url": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/bf/d4/0e/bfd40ea4-8e12-3252-8789-f53855ff431b/mzaf_10022467140885232976.plus.aac.p.m4a",
            "cover_art_url": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/c3/84/c4/c384c478-f716-e52a-9e79-5e9334c4b220/24UMGIM89626.rgb.jpg/600x600bb.jpg",
            "source_type": "trending_hits",
        },
        {
            "title": "Birds of a Feather",
            "artist": "Billie Eilish",
            "album": "HIT ME HARD AND SOFT",
            "duration_seconds": 198,
            "audio_url": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/6c/4a/07/6c4a0705-ebcf-5a75-b9f4-27921a221f76/mzaf_6138676239169651586.plus.aac.p.m4a",
            "cover_art_url": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/71/39/33/71393390-33fa-0d70-a35c-f4b6a9e1e8bc/24UMGIM36506.rgb.jpg/600x600bb.jpg",
            "source_type": "trending_hits",
        },
        {
            "title": "Espresso",
            "artist": "Sabrina Carpenter",
            "album": "Short n' Sweet",
            "duration_seconds": 175,
            "audio_url": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/05/22/02/052202bb-81c1-4b10-660c-267926e2e519/mzaf_8407425126830590807.plus.aac.p.m4a",
            "cover_art_url": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/c4/86/e1/c486e115-ff34-5858-a400-f9ff20311f6c/24UMGIM50882.rgb.jpg/600x600bb.jpg",
            "source_type": "trending_hits",
        },
        {
            "title": "Cruel Summer",
            "artist": "Taylor Swift",
            "album": "Lover",
            "duration_seconds": 178,
            "audio_url": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/09/b3/ee/09b3ee38-d621-c4d9-83c9-95a28bf2cfa1/mzaf_16155609427772836267.plus.aac.p.m4a",
            "cover_art_url": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/e5/2a/b2/e52ab27e-e17f-02ef-e836-e8d1c9ef0079/19UMGIM53909.rgb.jpg/600x600bb.jpg",
            "source_type": "trending_hits",
        },
        {
            "title": "Synthesis & Lofi Coding",
            "artist": "Audius Open Protocol",
            "album": "Electronic & Chill",
            "duration_seconds": 240,
            "audio_url": "https://api.audius.co/v1/tracks/y6wExE/stream?app_name=NEXUS_MUSIC",
            "cover_art_url": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80",
            "source_type": "audius_opensource",
        },
        {
            "title": "Cyberpunk Neon Drive",
            "artist": "Open Music Creators",
            "album": "Retro Synthwave",
            "duration_seconds": 210,
            "audio_url": "https://api.audius.co/v1/tracks/D7a3e/stream?app_name=NEXUS_MUSIC",
            "cover_art_url": "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=400&q=80",
            "source_type": "audius_opensource",
        },
    ]

    tracks_res = await db.execute(select(AudioTrack).where(AudioTrack.workspace_id == default_ws.id))
    existing_tracks = tracks_res.scalars().all()

    if not existing_tracks:
        logger.info("Seeding open source and trending tracks into database...")
        for s in open_source_trending_songs:
            track = AudioTrack(
                workspace_id=default_ws.id,
                owner_id=jelvis_user.id,
                title=s["title"],
                artist=s["artist"],
                album=s["album"],
                duration_seconds=s["duration_seconds"],
                audio_url=s["audio_url"],
                cover_art_url=s["cover_art_url"],
                source_type=s["source_type"],
                is_favorite=True,
            )
            db.add(track)
        await db.commit()

    # 4. Seed Initial Financial Transactions & Budgets
    tx_res = await db.execute(select(Transaction).where(Transaction.workspace_id == default_ws.id))
    existing_txs = tx_res.scalars().all()

    if not existing_txs:
        logger.info("Seeding initial financial transactions into database...")
        demo_txs = [
            {"type": "income", "amount": 15000000.0, "category": "Gaji Utama", "description": "Gaji Bulanan PT BCAS", "account": "BCA"},
            {"type": "income", "amount": 3500000.0, "category": "Freelance & Consulting", "description": "Proyek Development Tools", "account": "Mandiri"},
            {"type": "expense", "amount": 2500000.0, "category": "Tagihan & Utilitas", "description": "Listrik PLN, WiFi Indihome, Sewa Server", "account": "BCA"},
            {"type": "expense", "amount": 3200000.0, "category": "Makanan & Minuman", "description": "Belanja Bulanan & Makan Harian", "account": "Mandiri"},
            {"type": "expense", "amount": 1200000.0, "category": "Transportasi", "description": "Bensin, Tol, & Servis Rutin", "account": "Cash"},
            {"type": "expense", "amount": 1800000.0, "category": "Belanja & Lifestyle", "description": "Beli Perlengkapan Meja Kerja", "account": "E-Wallet"},
            {"type": "expense", "amount": 750000.0, "category": "Hiburan & Langganan", "description": "Langganan Cloud, Spotify, & Cinema", "account": "Kartu Kredit"},
        ]
        for t in demo_txs:
            tx = Transaction(
                workspace_id=default_ws.id,
                owner_id=jelvis_user.id,
                type=t["type"],
                amount=t["amount"],
                category=t["category"],
                description=t["description"],
                account=t["account"],
            )
            db.add(tx)
        
        # Seed Budget limits
        demo_budgets = [
            {"category": "Makanan & Minuman", "monthly_limit": 4000000.0},
            {"category": "Transportasi", "monthly_limit": 2000000.0},
            {"category": "Belanja & Lifestyle", "monthly_limit": 2500000.0},
            {"category": "Hiburan & Langganan", "monthly_limit": 1000000.0},
        ]
        for b in demo_budgets:
            bg = Budget(
                workspace_id=default_ws.id,
                category=b["category"],
                monthly_limit=b["monthly_limit"],
            )
            db.add(bg)

        # Seed Savings Goals
        demo_goals = [
            {"target_name": "Dana Darurat 6 Bulan", "target_amount": 50000000.0, "current_amount": 32000000.0, "target_date": "2026-12-31"},
            {"target_name": "Beli Laptop Mac Studio", "target_amount": 35000000.0, "current_amount": 21000000.0, "target_date": "2026-11-15"},
        ]
        for g in demo_goals:
            sg = SavingsGoal(
                workspace_id=default_ws.id,
                target_name=g["target_name"],
                target_amount=g["target_amount"],
                current_amount=g["current_amount"],
                target_date=g["target_date"],
            )
            db.add(sg)

        await db.commit()

