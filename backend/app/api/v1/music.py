from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.music import AudioTrackCreate, AudioTrackResponse, PlaylistCreate, PlaylistResponse
from app.repositories.music_repo import MusicRepository
from app.api.deps import get_current_user, get_active_workspace_id
from app.models.user import User

router = APIRouter()


@router.get("/tracks", response_model=List[AudioTrackResponse])
async def list_tracks(
    workspace_id: str = Depends(get_active_workspace_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    repo = MusicRepository(db)
    tracks = await repo.list_tracks(workspace_id=workspace_id)
    if not tracks:
        # Provide demo tracks if workspace has no uploaded tracks yet
        demo_tracks = [
            AudioTrackResponse(
                id="demo-1",
                workspace_id=workspace_id,
                owner_id=current_user.id,
                title="Deep Coding Flow",
                artist="NEXUS Audio Studio",
                album="Focus Essentials",
                duration_seconds=180,
                audio_url="https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=ambient-piano-amp-strings-10711.mp3",
                cover_art_url="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80",
                source_type="demo",
                is_favorite=True,
                created_at="2026-09-18T00:00:00Z"
            ),
            AudioTrackResponse(
                id="demo-2",
                workspace_id=workspace_id,
                owner_id=current_user.id,
                title="Chill Lofi Beats",
                artist="Aesthetic Waves",
                album="Late Night Chill",
                duration_seconds=210,
                audio_url="https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73187.mp3?filename=lofi-study-112191.mp3",
                cover_art_url="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80",
                source_type="demo",
                is_favorite=False,
                created_at="2026-09-18T00:00:00Z"
            ),
            AudioTrackResponse(
                id="demo-3",
                workspace_id=workspace_id,
                owner_id=current_user.id,
                title="Cyberpunk Synthwave",
                artist="Neon Horizon",
                album="Retro Future",
                duration_seconds=240,
                audio_url="https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=synthwave-80s-110045.mp3",
                cover_art_url="https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=400&q=80",
                source_type="demo",
                is_favorite=True,
                created_at="2026-09-18T00:00:00Z"
            )
        ]
        return demo_tracks
    return tracks


@router.post("/tracks", response_model=AudioTrackResponse, status_code=status.HTTP_201_CREATED)
async def create_track(
    track_in: AudioTrackCreate,
    workspace_id: str = Depends(get_active_workspace_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    repo = MusicRepository(db)
    return await repo.create_track(workspace_id=workspace_id, owner_id=current_user.id, data=track_in)


@router.get("/playlists", response_model=List[PlaylistResponse])
async def list_playlists(
    workspace_id: str = Depends(get_active_workspace_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    repo = MusicRepository(db)
    playlists = await repo.list_playlists(workspace_id=workspace_id)
    if not playlists:
        demo_playlists = [
            PlaylistResponse(
                id="pl-1",
                workspace_id=workspace_id,
                owner_id=current_user.id,
                name="Coding Focus Playlist",
                description="Ambient and Lofi tracks for maximum productivity.",
                cover_art_url="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80",
                tracks=[],
                created_at="2026-09-18T00:00:00Z"
            ),
            PlaylistResponse(
                id="pl-2",
                workspace_id=workspace_id,
                owner_id=current_user.id,
                name="Relax & Chill Session",
                description="Calm acoustics and background melodies.",
                cover_art_url="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80",
                tracks=[],
                created_at="2026-09-18T00:00:00Z"
            )
        ]
        return demo_playlists
    return playlists


@router.post("/playlists", response_model=PlaylistResponse, status_code=status.HTTP_201_CREATED)
async def create_playlist(
    playlist_in: PlaylistCreate,
    workspace_id: str = Depends(get_active_workspace_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    repo = MusicRepository(db)
    return await repo.create_playlist(workspace_id=workspace_id, owner_id=current_user.id, data=playlist_in)
