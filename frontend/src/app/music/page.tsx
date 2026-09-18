'use client';

import React, { useState, useEffect } from 'react';
import { useAudioStore, popularMandarinTracks, Track } from '@/stores/useAudioStore';
import { apiRequest } from '@/lib/api-client';
import { Play, Pause, Music, Heart, Plus, Search, ListMusic, Sparkles, Radio } from 'lucide-react';

export default function MusicStudioPage() {
  const { currentTrack, isPlaying, playTrack, togglePlay, queue, setQueue } = useAudioStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [tracksList, setTracksList] = useState<Track[]>(popularMandarinTracks);

  // Fetch Mandarin tracks from DB
  const fetchMandarinTracks = async () => {
    try {
      const data = await apiRequest<Track[]>('/music/tracks');
      if (Array.isArray(data) && data.length > 0) {
        setTracksList(data);
        setQueue(data, 0);
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchMandarinTracks();
  }, []);

  const filteredTracks = tracksList.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.album && t.album.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const featuredAlbums = [
    { title: '晴天 (Sunny Day)', artist: '周杰伦 Jay Chou', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80', trackIdx: 0 },
    { title: '以后别做朋友', artist: '周兴哲 Eric Chou', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80', trackIdx: 1 },
    { title: '光年之外', artist: '邓紫棋 G.E.M.', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80', trackIdx: 2 },
    { title: '告白气球', artist: '周杰伦 Jay Chou', cover: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80', trackIdx: 3 },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Studio Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 border border-purple-800/40 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Radio className="w-5 h-5 text-purple-400 animate-pulse" />
            <span className="text-xs uppercase font-bold tracking-widest text-purple-300">NEXUS Mandarin Music Hub</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">华语流行歌曲 (Popular Mandarin Songs)</h1>
          <p className="text-xs text-purple-200 mt-1 max-w-xl">
            Koleksi lagu-lagu Mandarin populer (Jay Chou, Eric Chou, G.E.M. 邓紫棋, JJ Lin, Teresa Teng) yang tersimpan secara persisten di Database.
          </p>
        </div>

        <div className="relative flex-1 max-w-xs w-full">
          <Search className="w-4 h-4 text-purple-300 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari lagu Mandarin / penyanyi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-purple-900/50 border border-purple-700/50 rounded-xl text-xs text-white placeholder-purple-300 focus:outline-none focus:border-purple-400"
          />
        </div>
      </div>

      {/* Featured Mandarin Albums Grid */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pilihan Hits Mandarin Populer</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {featuredAlbums.map((album, i) => (
            <div
              key={i}
              onClick={() => {
                if (tracksList[album.trackIdx]) {
                  playTrack(tracksList[album.trackIdx]);
                }
              }}
              className="bg-white border border-slate-200 rounded-2xl p-3 hover:border-purple-500 hover:shadow-xl transition-all group cursor-pointer"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-slate-900">
                <img src={album.cover} alt={album.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform" />
                <button
                  className="absolute bottom-2 right-2 w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </button>
              </div>
              <h3 className="text-xs font-bold text-slate-900 truncate">{album.title}</h3>
              <p className="text-[11px] text-slate-500 truncate">{album.artist}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tracks Library Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <ListMusic className="w-4 h-4 text-purple-600" />
            <span>Daftar Lagu Mandarin Populer di Database ({filteredTracks.length} Lagu)</span>
          </h2>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 shadow-xs">
          {filteredTracks.map((t, idx) => {
            const isCurrent = currentTrack?.id === t.id;
            return (
              <div
                key={t.id || idx}
                onClick={() => playTrack(t)}
                className={`flex items-center justify-between p-3.5 cursor-pointer transition-colors ${
                  isCurrent ? 'bg-purple-50/70 font-semibold' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-400 w-5 text-center font-bold">{idx + 1}</span>
                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                    <img src={t.cover_art_url} alt={t.title} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className={`text-xs ${isCurrent ? 'text-purple-700 font-bold' : 'text-slate-900 font-bold'}`}>{t.title}</p>
                    <p className="text-[11px] text-slate-500">{t.artist} • <span className="italic">{t.album}</span></p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="px-2.5 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded-full border border-purple-200">
                    Mandarin Pop
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {Math.floor(t.duration_seconds / 60)}:{(t.duration_seconds % 60).toString().padStart(2, '0')}
                  </span>
                  <button className="text-slate-400 hover:text-purple-600 transition-colors">
                    <Heart className="w-4 h-4 fill-current text-purple-600" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
