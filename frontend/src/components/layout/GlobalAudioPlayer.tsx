'use client';

import React, { useEffect, useRef } from 'react';
import { useAudioStore } from '@/stores/useAudioStore';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, ListMusic, Music } from 'lucide-react';

export const GlobalAudioPlayer: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const {
    currentTrack,
    isPlaying,
    volume,
    currentTime,
    duration,
    togglePlay,
    setVolume,
    setCurrentTime,
    setDuration,
    nextTrack,
    previousTrack,
  } = useAudioStore();

  // Sync audio element with store state
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrack]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  if (!currentTrack) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-surface border-t border-border px-4 flex items-center justify-between z-50 shadow-2xl transition-all">
      <audio
        ref={audioRef}
        src={currentTrack.audio_url}
        onTimeUpdate={() => {
          if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) setDuration(audioRef.current.duration);
        }}
        onEnded={nextTrack}
        onError={() => {
          console.warn('Audio stream error, skipping to next track:', currentTrack.title);
          nextTrack();
        }}
      />

      {/* Track Info */}
      <div className="flex items-center gap-3 w-1/4">
        {currentTrack.cover_art_url ? (
          <img
            src={currentTrack.cover_art_url}
            alt={currentTrack.title}
            className="w-10 h-10 rounded-md object-cover border border-border shadow-sm"
          />
        ) : (
          <div className="w-10 h-10 bg-accent-500/20 text-accent-500 rounded-md flex items-center justify-center">
            <Music className="w-5 h-5" />
          </div>
        )}
        <div className="truncate">
          <p className="text-sm font-semibold text-primaryText truncate">{currentTrack.title}</p>
          <p className="text-xs text-secondaryText truncate">{currentTrack.artist}</p>
        </div>
      </div>

      {/* Controls & Progress Bar */}
      <div className="flex flex-col items-center gap-1 w-2/4 max-w-xl">
        <div className="flex items-center gap-4">
          <button
            onClick={previousTrack}
            className="p-1.5 text-secondaryText hover:text-primaryText transition-colors"
            title="Previous"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={togglePlay}
            className="p-2.5 bg-accent-500 text-white rounded-full hover:bg-accent-600 transition-all shadow-md active:scale-95"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>
          <button
            onClick={nextTrack}
            className="p-1.5 text-secondaryText hover:text-primaryText transition-colors"
            title="Next"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        <div className="w-full flex items-center gap-2 text-xs text-secondaryText">
          <span>{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 bg-border rounded-lg appearance-none cursor-pointer accent-accent-500"
          />
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume & Queue Controls */}
      <div className="flex items-center justify-end gap-3 w-1/4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setVolume(volume === 0 ? 0.8 : 0)}
            className="text-secondaryText hover:text-primaryText"
          >
            {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-20 h-1 bg-border rounded-lg appearance-none cursor-pointer accent-accent-500"
          />
        </div>
        <button className="p-1.5 text-secondaryText hover:text-primaryText" title="Queue">
          <ListMusic className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
