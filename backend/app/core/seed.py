import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.user import User
from app.models.workspace import Workspace
from app.models.music import AudioTrack
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

    # 3. Seed Popular Mandarin Songs into audio_tracks
    mandarin_songs = [
        {
            "title": "晴天 (Sunny Day)",
            "artist": "周杰伦 (Jay Chou)",
            "album": "叶惠美 (Ye Hui Mei)",
            "duration_seconds": 269,
            "audio_url": "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=ambient-piano-amp-strings-10711.mp3",
            "cover_art_url": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80",
        },
        {
            "title": "以后别做朋友 (Let's Not Be Friends Anymore)",
            "artist": "周兴哲 (Eric Chou)",
            "album": "学着爱 (My Way to Love)",
            "duration_seconds": 258,
            "audio_url": "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73187.mp3?filename=lofi-study-112191.mp3",
            "cover_art_url": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80",
        },
        {
            "title": "光年之外 (Light Years Away)",
            "artist": "邓紫棋 (G.E.M.)",
            "album": " Passengers OST",
            "duration_seconds": 235,
            "audio_url": "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=synthwave-80s-110045.mp3",
            "cover_art_url": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80",
        },
        {
            "title": "告白气球 (Love Confession)",
            "artist": "周杰伦 (Jay Chou)",
            "album": "周杰伦的床边故事",
            "duration_seconds": 215,
            "audio_url": "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=ambient-piano-amp-strings-10711.mp3",
            "cover_art_url": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80",
        },
        {
            "title": "修炼爱情 (Practice Love)",
            "artist": "林俊杰 (JJ Lin)",
            "album": "因你而在 (Stories Untold)",
            "duration_seconds": 280,
            "audio_url": "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73187.mp3?filename=lofi-study-112191.mp3",
            "cover_art_url": "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=400&q=80",
        },
        {
            "title": "小幸運 (A Little Happiness)",
            "artist": "田馥甄 (Hebe Tien)",
            "album": "我的少女時代 OST",
            "duration_seconds": 265,
            "audio_url": "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=synthwave-80s-110045.mp3",
            "cover_art_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=400&q=80",
        },
        {
            "title": "爱很简单 (I Love You)",
            "artist": "陶喆 (David Tao)",
            "album": "陶喆同名专辑",
            "duration_seconds": 270,
            "audio_url": "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=ambient-piano-amp-strings-10711.mp3",
            "cover_art_url": "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=400&q=80",
        },
        {
            "title": "月亮代表我的心 (The Moon Represents My Heart)",
            "artist": "邓丽君 (Teresa Teng)",
            "album": "经典金曲传奇",
            "duration_seconds": 210,
            "audio_url": "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73187.mp3?filename=lofi-study-112191.mp3",
            "cover_art_url": "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=400&q=80",
        },
    ]

    tracks_res = await db.execute(select(AudioTrack).where(AudioTrack.workspace_id == default_ws.id))
    existing_tracks = tracks_res.scalars().all()

    if not existing_tracks:
        logger.info("Seeding popular Mandarin tracks into database...")
        for s in mandarin_songs:
            track = AudioTrack(
                workspace_id=default_ws.id,
                owner_id=jelvis_user.id,
                title=s["title"],
                artist=s["artist"],
                album=s["album"],
                duration_seconds=s["duration_seconds"],
                audio_url=s["audio_url"],
                cover_art_url=s["cover_art_url"],
                source_type="popular_mandarin",
                is_favorite=True,
            )
            db.add(track)
        await db.commit()
