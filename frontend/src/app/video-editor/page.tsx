'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Upload, Video as VideoIcon, Play, Pause, Scissors, Gauge, Sparkles,
  Type, Download, Crop, RefreshCw, Layers, Sliders, Volume2, VolumeX,
  Plus, Check, Film
} from 'lucide-react';

interface VideoFilter {
  id: string;
  name: string;
  icon: string;
  cssFilter: string;
}

interface TextOverlay {
  id: string;
  text: string;
  color: string;
  fontSize: number; // in px
  position: 'top' | 'center' | 'bottom';
  bgBadge: boolean;
}

const SAMPLE_VIDEOS = [
  { id: 'vid-1', name: 'Cyberpunk Drive', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
  { id: 'vid-2', name: 'Nature Forest Flow', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' },
  { id: 'vid-3', name: 'Ocean Waves', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4' },
  { id: 'vid-4', name: 'Tech & Motion', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4' },
];

const CAPCUT_FILTERS: VideoFilter[] = [
  { id: 'none', name: 'Normal', icon: '📹', cssFilter: 'none' },
  { id: 'cyberpunk', name: 'Cyberpunk Glow', icon: '🌆', cssFilter: 'contrast(130%) hue-rotate(180deg) saturate(160%)' },
  { id: 'vhs-80s', name: '80s VHS Retro', icon: '📼', cssFilter: 'sepia(50%) contrast(120%) saturate(140%) hue-rotate(-20deg)' },
  { id: 'golden-hour', name: 'Golden Hour', icon: '🌅', cssFilter: 'brightness(110%) contrast(110%) sepia(30%) saturate(140%)' },
  { id: 'bw-noir', name: 'Dramatic Noir B&W', icon: '🎬', cssFilter: 'grayscale(100%) contrast(160%) brightness(90%)' },
  { id: 'glitch-shift', name: 'Glitch Shift', icon: '⚡', cssFilter: 'invert(15%) contrast(150%) hue-rotate(90deg)' },
];

const ASPECT_RATIOS = [
  { id: '16:9', label: '16:9 YouTube / Desktop', class: 'aspect-video max-w-2xl' },
  { id: '9:16', label: '9:16 TikTok / Reels / Shorts', class: 'aspect-[9/16] max-w-xs' },
  { id: '1:1', label: '1:1 Instagram Post', class: 'aspect-square max-w-md' },
];

export default function VideoEditorPage() {
  const [selectedVideo, setSelectedVideo] = useState<string>(SAMPLE_VIDEOS[0].url);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  
  // CapCut Editing State
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [trimStart, setTrimStart] = useState<number>(0);
  const [trimEnd, setTrimEnd] = useState<number>(0);
  const [activeFilter, setActiveFilter] = useState<VideoFilter>(CAPCUT_FILTERS[0]);
  const [aspectRatio, setAspectRatio] = useState<string>('16:9');
  const [volume, setVolume] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Text Overlays
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([
    { id: 'txt-1', text: '✨ CapCut Studio Edit', color: '#ffffff', fontSize: 24, position: 'top', bgBadge: true }
  ]);
  const [inputText, setInputText] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSelectedVideo(url);
      setIsPlaying(false);
      setCurrentTime(0);
      setTrimStart(0);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration || 0;
      setDuration(dur);
      setTrimEnd(dur);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const time = videoRef.current.currentTime;
    setCurrentTime(time);

    // Enforce Trim Out boundary
    if (trimEnd > 0 && time >= trimEnd) {
      videoRef.current.currentTime = trimStart;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const addTextOverlay = () => {
    if (!inputText.trim()) return;
    const newOverlay: TextOverlay = {
      id: `txt-${Date.now()}`,
      text: inputText,
      color: '#ffffff',
      fontSize: 22,
      position: 'bottom',
      bgBadge: true
    };
    setTextOverlays((prev) => [...prev, newOverlay]);
    setInputText('');
  };

  const removeTextOverlay = (id: string) => {
    setTextOverlays((prev) => prev.filter((t) => t.id !== id));
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;
  };

  const activeAspectObj = ASPECT_RATIOS.find((a) => a.id === aspectRatio) || ASPECT_RATIOS[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 select-none">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-indigo-950 border border-rose-800/40 rounded-3xl p-6 text-white shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Scissors className="w-5 h-5 text-rose-400 animate-pulse" />
            <span className="text-xs uppercase font-bold tracking-widest text-rose-300">NEXUS CapCut Studio</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">CapCut Video Editor</h1>
          <p className="text-xs text-rose-200/90 mt-1 max-w-xl">
            Penyuntingan video interaktif dengan Trim/Cut, Speed Curves, CapCut FX Filters, Aspect Ratio Presets, & Overlay Teks Subtitle.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg transition-all active:scale-95">
            <Upload className="w-4 h-4" />
            <span>Upload Video Baru</span>
            <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Video Studio Canvas Player & Control Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left/Center Player Area (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-center min-h-[480px] shadow-2xl relative">
            
            {/* Top Aspect Ratio Badges */}
            <div className="w-full flex items-center justify-between mb-4 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-300 flex items-center gap-1">
                  <Crop className="w-4 h-4 text-rose-500" /> Rasio Canvas:
                </span>
                {ASPECT_RATIOS.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setAspectRatio(r.id)}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      aspectRatio === r.id ? 'bg-rose-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    {r.id}
                  </button>
                ))}
              </div>

              <span className="font-mono text-xs font-bold text-rose-400">
                Speed: {playbackSpeed}x
              </span>
            </div>

            {/* Video Canvas Container */}
            <div className={`relative w-full overflow-hidden rounded-2xl bg-black border border-slate-800 shadow-2xl flex items-center justify-center ${activeAspectObj.class}`}>
              <video
                ref={videoRef}
                src={selectedVideo}
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
                style={{ filter: activeFilter.cssFilter }}
                className="w-full h-full object-contain"
              />

              {/* Text Overlays Layer */}
              {textOverlays.map((txt) => {
                let posClass = 'top-6';
                if (txt.position === 'center') posClass = 'top-1/2 -translate-y-1/2';
                if (txt.position === 'bottom') posClass = 'bottom-6';

                return (
                  <div
                    key={txt.id}
                    className={`absolute ${posClass} left-1/2 -translate-x-1/2 pointer-events-none z-20 text-center max-w-[90%]`}
                  >
                    <span
                      style={{ color: txt.color, fontSize: `${txt.fontSize}px` }}
                      className={`font-black tracking-wide ${
                        txt.bgBadge
                          ? 'bg-black/75 backdrop-blur-sm px-4 py-1.5 rounded-xl border border-white/20 shadow-2xl'
                          : 'drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]'
                      }`}
                    >
                      {txt.text}
                    </span>
                  </div>
                );
              })}

              {/* Central Play Overlay Button */}
              {!isPlaying && (
                <button
                  onClick={togglePlay}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center group transition-opacity"
                >
                  <div className="w-16 h-16 bg-rose-600 group-hover:bg-rose-500 text-white rounded-full flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-all">
                    <Play className="w-7 h-7 fill-current ml-1" />
                  </div>
                </button>
              )}
            </div>

            {/* Interactive Timeline & Seeker Control Bar */}
            <div className="w-full mt-6 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-slate-300 font-bold">
                <span>{formatTime(currentTime)}</span>
                <span className="text-rose-400">Duration: {formatTime(duration)}</span>
              </div>

              {/* Progress Range Bar */}
              <div className="relative w-full flex items-center">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  step={0.1}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
              </div>

              {/* Transport Controls */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-3">
                  <button
                    onClick={togglePlay}
                    className="p-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-lg transition-all active:scale-95"
                  >
                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                  </button>

                  <button
                    onClick={() => {
                      setIsMuted(!isMuted);
                      if (videoRef.current) videoRef.current.muted = !isMuted;
                    }}
                    className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-xs text-slate-400 mr-2 font-bold">Trim Clip:</span>
                  <button
                    onClick={() => setTrimStart(currentTime)}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-rose-400 rounded-lg text-xs font-bold"
                  >
                    Set Start ({Math.floor(trimStart)}s)
                  </button>
                  <button
                    onClick={() => setTrimEnd(currentTime)}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-rose-400 rounded-lg text-xs font-bold"
                  >
                    Set End ({Math.floor(trimEnd)}s)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sample Video Clips */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Atau Pilih Sampel Video Clips:</p>
            <div className="grid grid-cols-4 gap-3">
              {SAMPLE_VIDEOS.map((vid) => (
                <div
                  key={vid.id}
                  onClick={() => {
                    setSelectedVideo(vid.url);
                    setIsPlaying(false);
                    setCurrentTime(0);
                  }}
                  className={`relative aspect-video rounded-xl overflow-hidden border-2 cursor-pointer transition-all bg-slate-900 group ${
                    selectedVideo === vid.url ? 'border-rose-600 ring-2 ring-rose-500/20' : 'border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors">
                    <Film className="w-6 h-6 text-white/80" />
                  </div>
                  <span className="absolute bottom-1 left-1 right-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded truncate">
                    {vid.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Editing Suite Panel (1 Col) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-6 shadow-sm">
          
          {/* SECTION 1: SPEED CONTROL */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-rose-500" />
              <span>Speed Curve & Playback</span>
            </h3>
            <div className="grid grid-cols-5 gap-1.5 p-1 bg-slate-100 rounded-xl">
              {[0.25, 0.5, 1.0, 1.5, 2.0].map((s) => (
                <button
                  key={s}
                  onClick={() => handleSpeedChange(s)}
                  className={`py-1.5 text-xs font-mono font-bold rounded-lg transition-all ${
                    playbackSpeed === s ? 'bg-rose-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 2: CAPCUT FX FILTERS */}
          <div className="space-y-3 border-t border-slate-100 pt-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-rose-500" />
              <span>CapCut FX Filters & Aesthetic LUTs</span>
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {CAPCUT_FILTERS.map((f) => {
                const isActive = activeFilter.id === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setActiveFilter(f)}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between gap-2 transition-all ${
                      isActive
                        ? 'bg-rose-50 border-rose-600 text-rose-700 font-bold shadow-md'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-base">{f.icon}</span>
                      <span className="text-xs font-bold truncate">{f.name}</span>
                    </div>
                    {isActive && <Check className="w-4 h-4 text-rose-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 3: TEXT & SUBTITLE OVERLAYS */}
          <div className="space-y-3 border-t border-slate-100 pt-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Type className="w-4 h-4 text-rose-500" />
              <span>Tambah Teks & Subtitle Overlay</span>
            </h3>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Tulis subjudul / teks..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTextOverlay()}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-rose-500"
              />
              <button
                onClick={addTextOverlay}
                className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-md"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah</span>
              </button>
            </div>

            {/* Existing Overlays List */}
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {textOverlays.map((t) => (
                <div key={t.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 truncate max-w-[180px]">{t.text}</span>
                  <button
                    onClick={() => removeTextOverlay(t.id)}
                    className="text-slate-400 hover:text-rose-600 text-xs font-bold"
                  >
                    Hapus
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
