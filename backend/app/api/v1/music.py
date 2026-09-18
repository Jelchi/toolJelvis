import asyncio
import json
import urllib.request
import urllib.parse
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.music import AudioTrackBase, AudioTrackCreate, AudioTrackResponse, PlaylistCreate, PlaylistResponse
from app.repositories.music_repo import MusicRepository
from app.api.deps import get_current_user, get_active_workspace_id
from app.models.user import User

router = APIRouter()


def _fetch_itunes_trending() -> List[dict]:
    try:
        url = "https://itunes.apple.com/rss/topsongs/limit=25/json"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            entries = data.get("feed", {}).get("entry", [])
            results = []
            for i, entry in enumerate(entries):
                title = entry.get("im:name", {}).get("label", "Unknown Track")
                artist = entry.get("im:artist", {}).get("label", "Unknown Artist")
                images = entry.get("im:image", [])
                cover = images[-1].get("label") if images else None
                if cover:
                    cover = cover.replace("55x55bb.jpg", "600x600bb.jpg").replace("170x170bb.jpg", "600x600bb.jpg")

                link_list = entry.get("link", [])
                audio_url = None
                if isinstance(link_list, list):
                    for l in link_list:
                        if l.get("attributes", {}).get("type", "").startswith("audio/"):
                            audio_url = l.get("attributes", {}).get("href")
                            break
                elif isinstance(link_list, dict):
                    audio_url = link_list.get("attributes", {}).get("href")

                if audio_url:
                    results.append({
                        "id": f"itunes-chart-{i+1}",
                        "title": title,
                        "artist": artist,
                        "album": "Top Global Hits",
                        "duration_seconds": 30,
                        "audio_url": audio_url,
                        "cover_art_url": cover or "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80",
                        "source_type": "trending_hits",
                        "is_favorite": False,
                    })
            return results
    except Exception:
        return []


def _fetch_audius_trending() -> List[dict]:
    try:
        url = "https://api.audius.co/v1/tracks/trending?app_name=NEXUS_MUSIC"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            tracks = data.get("data", [])
            results = []
            for t in tracks[:25]:
                artwork_dict = t.get("artwork") or {}
                cover = artwork_dict.get("480x480") or artwork_dict.get("150x150")
                track_id = t.get("id")
                if track_id:
                    results.append({
                        "id": f"audius-{track_id}",
                        "title": t.get("title", "Open Source Track"),
                        "artist": t.get("user", {}).get("name", "Open Creator"),
                        "album": t.get("genre", "Open Audio Protocol"),
                        "duration_seconds": t.get("duration", 180),
                        "audio_url": f"https://api.audius.co/v1/tracks/{track_id}/stream?app_name=NEXUS_MUSIC",
                        "cover_art_url": cover or "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80",
                        "source_type": "audius_opensource",
                        "is_favorite": False,
                    })
            return results
    except Exception:
        return []


def _search_live_music(query: str) -> List[dict]:
    results = []
    encoded_q = urllib.parse.quote(query)

    # 1. Search iTunes for trending/popular songs
    try:
        url = f"https://itunes.apple.com/search?term={encoded_q}&entity=song&limit=20"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            for i, item in enumerate(data.get("results", [])):
                preview = item.get("previewUrl")
                if preview:
                    artwork = item.get("artworkUrl100")
                    if artwork:
                        artwork = artwork.replace("100x100bb.jpg", "600x600bb.jpg")
                    results.append({
                        "id": f"search-itunes-{item.get('trackId', i)}",
                        "title": item.get("trackName", "Unknown Track"),
                        "artist": item.get("artistName", "Unknown Artist"),
                        "album": item.get("collectionName", "Single"),
                        "duration_seconds": int(item.get("trackTimeMillis", 30000) / 1000),
                        "audio_url": preview,
                        "cover_art_url": artwork or "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80",
                        "source_type": "trending_hits",
                        "is_favorite": False,
                    })
    except Exception:
        pass

    # 2. Search Audius Open Source Protocol
    try:
        url = f"https://api.audius.co/v1/tracks/search?query={encoded_q}&app_name=NEXUS_MUSIC"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            for t in data.get("data", [])[:15]:
                track_id = t.get("id")
                if track_id:
                    artwork_dict = t.get("artwork") or {}
                    cover = artwork_dict.get("480x480") or artwork_dict.get("150x150")
                    results.append({
                        "id": f"search-audius-{track_id}",
                        "title": t.get("title", "Open Track"),
                        "artist": t.get("user", {}).get("name", "Open Creator"),
                        "album": t.get("genre", "Open Audio"),
                        "duration_seconds": t.get("duration", 180),
                        "audio_url": f"https://api.audius.co/v1/tracks/{track_id}/stream?app_name=NEXUS_MUSIC",
                        "cover_art_url": cover or "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80",
                        "source_type": "audius_opensource",
                        "is_favorite": False,
                    })
    except Exception:
        pass

    return results


@router.get("/trending")
async def get_trending_tracks(
    source: str = Query("all", description="Source filter: all, itunes, audius")
):

    itunes_task = asyncio.to_thread(_fetch_itunes_trending) if source in ("all", "itunes") else None
    audius_task = asyncio.to_thread(_fetch_audius_trending) if source in ("all", "audius") else None

    tasks = [t for t in [itunes_task, audius_task] if t is not None]
    results_list = await asyncio.gather(*tasks, return_exceptions=True)

    combined = []
    for res in results_list:
        if isinstance(res, list):
            combined.extend(res)

    return combined


@router.get("/search")
async def search_tracks(q: str = Query(..., min_length=1)):
    return await asyncio.to_thread(_search_live_music, q)


@router.get("/tracks", response_model=List[AudioTrackResponse])
async def list_tracks(
    workspace_id: str = Depends(get_active_workspace_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    repo = MusicRepository(db)
    tracks = await repo.list_tracks(workspace_id=workspace_id)
    if not tracks:
        demo_tracks = await asyncio.to_thread(_fetch_itunes_trending)
        if not demo_tracks:
            demo_tracks = [
                {
                    "id": "demo-1",
                    "workspace_id": workspace_id,
                    "owner_id": current_user.id,
                    "title": "Die With A Smile",
                    "artist": "Lady Gaga & Bruno Mars",
                    "album": "Die With A Smile - Single",
                    "duration_seconds": 251,
                    "audio_url": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/bf/d4/0e/bfd40ea4-8e12-3252-8789-f53855ff431b/mzaf_10022467140885232976.plus.aac.p.m4a",
                    "cover_art_url": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/c3/84/c4/c384c478-f716-e52a-9e79-5e9334c4b220/24UMGIM89626.rgb.jpg/600x600bb.jpg",
                    "source_type": "trending_hits",
                    "is_favorite": True,
                    "created_at": "2026-09-18T00:00:00Z"
                }
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
                name="Top Global Hits",
                description="Trending chart-toppers around the world.",
                cover_art_url="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80",
                tracks=[],
                created_at="2026-09-18T00:00:00Z"
            ),
            PlaylistResponse(
                id="pl-2",
                workspace_id=workspace_id,
                owner_id=current_user.id,
                name="Open Source Protocol Hits",
                description="Decentralized open-source music from Audius creators.",
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

