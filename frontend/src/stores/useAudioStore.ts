import { create } from 'zustand';

export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration_seconds: number;
  audio_url: string;
  cover_art_url?: string;
}

interface AudioStoreState {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number; // 0 to 1
  currentTime: number;
  duration: number;
  queue: Track[];
  queueIndex: number;
  
  // Actions
  playTrack: (track: Track) => void;
  togglePlay: () => void;
  setVolume: (vol: number) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (dur: number) => void;
  nextTrack: () => void;
  previousTrack: () => void;
  setQueue: (tracks: Track[], initialIndex?: number) => void;
}

export const popularTrendingTracks: Track[] = [
  {
    id: 'tr-1',
    title: 'Die With A Smile',
    artist: 'Lady Gaga & Bruno Mars',
    album: 'Die With A Smile - Single',
    duration_seconds: 251,
    audio_url: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/bf/d4/0e/bfd40ea4-8e12-3252-8789-f53855ff431b/mzaf_10022467140885232976.plus.aac.p.m4a',
    cover_art_url: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/c3/84/c4/c384c478-f716-e52a-9e79-5e9334c4b220/24UMGIM89626.rgb.jpg/600x600bb.jpg',
  },
  {
    id: 'tr-2',
    title: 'Birds of a Feather',
    artist: 'Billie Eilish',
    album: 'HIT ME HARD AND SOFT',
    duration_seconds: 198,
    audio_url: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/6c/4a/07/6c4a0705-ebcf-5a75-b9f4-27921a221f76/mzaf_6138676239169651586.plus.aac.p.m4a',
    cover_art_url: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/71/39/33/71393390-33fa-0d70-a35c-f4b6a9e1e8bc/24UMGIM36506.rgb.jpg/600x600bb.jpg',
  },
  {
    id: 'tr-3',
    title: 'Espresso',
    artist: 'Sabrina Carpenter',
    album: "Short n' Sweet",
    duration_seconds: 175,
    audio_url: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/05/22/02/052202bb-81c1-4b10-660c-267926e2e519/mzaf_8407425126830590807.plus.aac.p.m4a',
    cover_art_url: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/c4/86/e1/c486e115-ff34-5858-a400-f9ff20311f6c/24UMGIM50882.rgb.jpg/600x600bb.jpg',
  },
  {
    id: 'tr-4',
    title: 'Cruel Summer',
    artist: 'Taylor Swift',
    album: 'Lover',
    duration_seconds: 178,
    audio_url: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/09/b3/ee/09b3ee38-d621-c4d9-83c9-95a28bf2cfa1/mzaf_16155609427772836267.plus.aac.p.m4a',
    cover_art_url: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/e5/2a/b2/e52ab27e-e17f-02ef-e836-e8d1c9ef0079/19UMGIM53909.rgb.jpg/600x600bb.jpg',
  },
  {
    id: 'tr-5',
    title: 'Synthesis & Lofi Coding',
    artist: 'Audius Open Protocol',
    album: 'Electronic & Chill',
    duration_seconds: 240,
    audio_url: 'https://api.audius.co/v1/tracks/y6wExE/stream?app_name=NEXUS_MUSIC',
    cover_art_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'tr-6',
    title: 'Cyberpunk Neon Drive',
    artist: 'Open Music Creators',
    album: 'Retro Synthwave',
    duration_seconds: 210,
    audio_url: 'https://api.audius.co/v1/tracks/D7a3e/stream?app_name=NEXUS_MUSIC',
    cover_art_url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=400&q=80',
  }
];

export const useAudioStore = create<AudioStoreState>((set, get) => ({
  currentTrack: popularTrendingTracks[0],
  isPlaying: false,
  volume: 0.8,
  currentTime: 0,
  duration: popularTrendingTracks[0].duration_seconds,
  queue: popularTrendingTracks,
  queueIndex: 0,

  playTrack: (track: Track) => {
    set({ currentTrack: track, isPlaying: true, currentTime: 0 });
  },

  togglePlay: () => {
    set((state) => ({ isPlaying: !state.isPlaying }));
  },

  setVolume: (vol: number) => {
    set({ volume: Math.max(0, Math.min(1, vol)) });
  },

  setCurrentTime: (time: number) => {
    set({ currentTime: time });
  },

  setDuration: (dur: number) => {
    set({ duration: dur });
  },

  nextTrack: () => {
    const { queue, queueIndex } = get();
    if (queue.length === 0) return;
    const nextIdx = (queueIndex + 1) % queue.length;
    set({
      queueIndex: nextIdx,
      currentTrack: queue[nextIdx],
      isPlaying: true,
      currentTime: 0
    });
  },

  previousTrack: () => {
    const { queue, queueIndex } = get();
    if (queue.length === 0) return;
    const prevIdx = (queueIndex - 1 + queue.length) % queue.length;
    set({
      queueIndex: prevIdx,
      currentTrack: queue[prevIdx],
      isPlaying: true,
      currentTime: 0
    });
  },

  setQueue: (tracks: Track[], initialIndex = 0) => {
    set({
      queue: tracks,
      queueIndex: initialIndex,
      currentTrack: tracks[initialIndex] || null,
      isPlaying: true,
      currentTime: 0
    });
  }
}));

