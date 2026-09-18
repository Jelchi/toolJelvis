from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.music import AudioTrack, Playlist, PlaylistTrack
from app.schemas.music import AudioTrackCreate, PlaylistCreate


class MusicRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_track(self, workspace_id: str, owner_id: str, data: AudioTrackCreate) -> AudioTrack:
        track = AudioTrack(
            workspace_id=workspace_id,
            owner_id=owner_id,
            title=data.title,
            artist=data.artist,
            album=data.album,
            duration_seconds=data.duration_seconds,
            audio_url=data.audio_url,
            cover_art_url=data.cover_art_url,
            source_type=data.source_type,
            is_favorite=data.is_favorite,
        )
        self.db.add(track)
        await self.db.commit()
        await self.db.refresh(track)
        return track

    async def list_tracks(self, workspace_id: str) -> List[AudioTrack]:
        result = await self.db.execute(
            select(AudioTrack).where(AudioTrack.workspace_id == workspace_id).order_by(AudioTrack.created_at.desc())
        )
        return list(result.scalars().all())

    async def create_playlist(self, workspace_id: str, owner_id: str, data: PlaylistCreate) -> Playlist:
        playlist = Playlist(
            workspace_id=workspace_id,
            owner_id=owner_id,
            name=data.name,
            description=data.description,
            cover_art_url=data.cover_art_url,
        )
        self.db.add(playlist)
        await self.db.commit()
        await self.db.refresh(playlist)
        return playlist

    async def list_playlists(self, workspace_id: str) -> List[Playlist]:
        result = await self.db.execute(
            select(Playlist).where(Playlist.workspace_id == workspace_id).order_by(Playlist.created_at.desc())
        )
        return list(result.scalars().all())
