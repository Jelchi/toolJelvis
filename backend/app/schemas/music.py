from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from datetime import datetime


class AudioTrackBase(BaseModel):
    title: str
    artist: str = "Unknown Artist"
    album: Optional[str] = None
    duration_seconds: int = 0
    audio_url: str
    cover_art_url: Optional[str] = None
    source_type: str = "user_upload"
    is_favorite: bool = False


class AudioTrackCreate(AudioTrackBase):
    pass


class AudioTrackResponse(AudioTrackBase):
    id: str
    workspace_id: str
    owner_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PlaylistBase(BaseModel):
    name: str
    description: Optional[str] = None
    cover_art_url: Optional[str] = None


class PlaylistCreate(PlaylistBase):
    pass


class PlaylistResponse(PlaylistBase):
    id: str
    workspace_id: str
    owner_id: str
    tracks: List[AudioTrackResponse] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
