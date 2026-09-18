'use client';

import React, { useState, useEffect } from 'react';
import { useAudioStore, popularTrendingTracks, Track } from '@/stores/useAudioStore';
import { apiRequest } from '@/lib/api-client';
import { Play, Pause, Music, Heart, Search, ListMusic, Sparkles, Radio, Flame, Globe, Database, Loader2 } from 'lucide-react';

export default function MusicStudioPage() {
  const { currentTrack, isPlaying, playTrack, togglePlay, setQueue } = useAudioStore();

  const [activeTab, setActiveTab] = useState<'trending' | 'audius' | 'db'>('trending');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  
  const [trendingTracks, setTrendingTracks] = useState<Track[]>(popularTrendingTracks);
  const [audiusTracks, setAudiusTracks] = useState<Track[]>([]);
  const [dbTracks, setDbTracks] = useState<Track[]>([]);
  const [savedTrackIds, setSavedTrackIds] = useState<Set<string>>(new Set());

  // Load initial music feeds
  const loadMusicFeeds = async () => {
    try {
      // 1. Fetch live trending hits
      const trendingData = await apiRequest<Track[]>('/music/trending?source=itunes');
      if (Array.isArray(trendingData) && trendingData.length > 0) {
        setTrendingTracks(trendingData);
      }
    } catch (err) {}

    try {
      // 2. Fetch live Audius open source tracks
      const audiusData = await apiRequest<Track[]>('/music/trending?source=audius');
      if (Array.isArray(audiusData) && audiusData.length > 0) {
        setAudiusTracks(audiusData);
      }
    } catch (err) {}

    try {
      // 3. Fetch user's saved tracks in DB
      const dbData = await apiRequest<Track[]>('/music/tracks');
      if (Array.isArray(dbData)) {
        setDbTracks(dbData);
        setSavedTrackIds(new Set(dbData.map(t => t.audio_url)));
      }
    } catch (err) {}
  };

  useEffect(() => {
    loadMusicFeeds();
  }, []);

  // Live search handler
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await apiRequest<Track[]>(`/music/search?q=${encodeURIComponent(searchQuery)}`);
        if (Array.isArray(res)) {
          setSearchResults(res);
        }
      } catch (err) {
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Save track to DB
  const handleSaveTrackToDb = async (t: Track, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const saved = await apiRequest<Track>('/music/tracks', {
        method: 'POST',
        body: JSON.stringify({
          title: t.title,
          artist: t.artist,
          album: t.album || 'Saved Track',
          duration_seconds: t.duration_seconds || 180,
          audio_url: t.audio_url,
          cover_art_url: t.cover_art_url,
          source_type: (t as any).source_type || 'user_favorite',
          is_favorite: true
        })
      });
      if (saved && saved.id) {
        setSavedTrackIds(prev => new Set([...Array.from(prev), t.audio_url]));
        setDbTracks(prev => [saved, ...prev]);
      }
    } catch (err) {}
  };

  // Determine current active playlist/display list
  const getDisplayTracks = () => {
    if (searchQuery.trim().length > 0) return searchResults;
    if (activeTab === 'trending') return trendingTracks;
    if (activeTab === 'audius') return audiusTracks;
    return dbTracks;
  };

  const currentDisplayList = getDisplayTracks();

  const featuredCards = trendingTracks.slice(0, 4);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Studio Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-purple-900 to-slate-900 border border-purple-800/40 rounded-3xl p-6 md:p-8 text-white shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Radio className="w-5 h-5 text-purple-400 animate-pulse" />
            <span className="text-xs uppercase font-bold tracking-widest text-purple-300">NEXUS Live Open Music Studio</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Open Source & Trending Hits Hub</h1>
          <p className="text-xs md:text-sm text-purple-200/90 mt-2 max-w-2xl leading-relaxed">
            Streaming musik open-source terpopuler (Audius Web3 Protocol) & Tangga Lagu Trending Dunia (iTunes Top Charts) tanpa file lokal.
          </p>
        </div>

        {/* Live Search Bar */}
        <div className="relative flex-1 max-w-md w-full z-10">
          <div className="relative">
            {isSearching ? (
              <Loader2 className="w-4 h-4 text-purple-300 absolute left-3.5 top-3 animate-spin" />
            ) : (
              <Search className="w-4 h-4 text-purple-300 absolute left-3.5 top-3" />
            )}
            <input
              type="text"
              placeholder="Cari lagu trending, artist, atau musik open source..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-purple-900/40 border border-purple-700/50 rounded-2xl text-xs md:text-sm text-white placeholder-purple-300/70 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 backdrop-blur-md transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-purple-300 hover:text-white bg-purple-800/50 px-2 py-0.5 rounded-lg"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Featured Chart Top Cards */}
      {searchQuery.length === 0 && featuredCards.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Trending Hits Teratas Minggu Ini</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {featuredCards.map((track, i) => (
              <div
                key={track.id || i}
                onClick={() => {
                  setQueue(trendingTracks, i);
                  playTrack(track);
                }}
                className="bg-white border border-slate-200/80 rounded-2xl p-3.5 hover:border-purple-500 hover:shadow-xl transition-all group cursor-pointer relative overflow-hidden"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-slate-900 shadow-md">
                  <img
                    src={track.cover_art_url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80'}
                    alt={track.title}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                  <button className="absolute bottom-2.5 right-2.5 w-10 h-10 bg-purple-600 hover:bg-purple-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg transform group-hover:translate-y-0 translate-y-2">
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </button>
                </div>
                <h3 className="text-xs font-bold text-slate-900 truncate">{track.title}</h3>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">{track.artist}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Tab Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setActiveTab('trending'); setSearchQuery(''); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'trending' && !searchQuery
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>🔥 Global Trending Hits</span>
          </button>

          <button
            onClick={() => { setActiveTab('audius'); setSearchQuery(''); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'audius' && !searchQuery
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>🌐 Open Source (Audius Web3)</span>
          </button>

          <button
            onClick={() => { setActiveTab('db'); setSearchQuery(''); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'db' && !searchQuery
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>❤️ Tersimpan di DB ({dbTracks.length})</span>
          </button>
        </div>

        <p className="text-xs text-slate-400 font-medium">
          {searchQuery ? `Hasil Pencarian Live (${searchResults.length})` : `Menampilkan ${currentDisplayList.length} Lagu Stream`}
        </p>
      </div>

      {/* Tracks Library Table */}
      <div className="space-y-3">
        {currentDisplayList.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
            <Music className="w-12 h-12 text-slate-300 mx-auto mb-3 animate-bounce" />
            <p className="text-sm font-semibold">Tidak ada lagu yang ditemukan</p>
            <p className="text-xs text-slate-400 mt-1">Coba kata kunci pencarian lain atau berpindah tab.</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden divide-y divide-slate-100 shadow-sm">
            {currentDisplayList.map((t, idx) => {
              const isCurrent = currentTrack?.audio_url === t.audio_url;
              const isSaved = savedTrackIds.has(t.audio_url);

              return (
                <div
                  key={t.id || idx}
                  onClick={() => {
                    setQueue(currentDisplayList, idx);
                    playTrack(t);
                  }}
                  className={`flex items-center justify-between p-3.5 cursor-pointer transition-all ${
                    isCurrent ? 'bg-purple-50/80 font-semibold border-l-4 border-l-purple-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="text-xs font-mono text-slate-400 w-6 text-center font-bold">{idx + 1}</span>
                    
                    <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-slate-200 bg-slate-900 shrink-0 group">
                      <img
                        src={t.cover_art_url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80'}
                        alt={t.title}
                        className="w-full h-full object-cover"
                      />
                      {isCurrent && isPlaying ? (
                        <div className="absolute inset-0 bg-purple-900/60 flex items-center justify-center">
                          <Radio className="w-5 h-5 text-white animate-pulse" />
                        </div>
                      ) : (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Play className="w-4 h-4 text-white fill-current" />
                        </div>
                      )}
                    </div>

                    <div className="truncate">
                      <p className={`text-xs md:text-sm truncate ${isCurrent ? 'text-purple-700 font-bold' : 'text-slate-900 font-bold'}`}>
                        {t.title}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {t.artist} {t.album ? `• ${t.album}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`hidden sm:inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                      (t as any).source_type === 'audius_opensource'
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {(t as any).source_type === 'audius_opensource' ? 'Open Source' : 'Trending Hits'}
                    </span>

                    <span className="text-xs font-mono text-slate-400 w-10 text-right">
                      {Math.floor((t.duration_seconds || 180) / 60)}:{((t.duration_seconds || 180) % 60).toString().padStart(2, '0')}
                    </span>

                    <button
                      onClick={(e) => handleSaveTrackToDb(t, e)}
                      title={isSaved ? 'Tersimpan di Database' : 'Simpan ke Favorit DB'}
                      className={`p-1.5 rounded-full transition-colors ${
                        isSaved ? 'text-rose-500 hover:text-rose-600' : 'text-slate-300 hover:text-rose-500'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isSaved ? 'fill-current text-rose-500' : ''}`} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

