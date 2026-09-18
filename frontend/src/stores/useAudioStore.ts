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

export const popularMandarinTracks: Track[] = [
  {
    id: 'm-1',
    title: '晴天 (Sunny Day)',
    artist: '周杰伦 (Jay Chou)',
    album: '叶惠美 (Ye Hui Mei)',
    duration_seconds: 269,
    audio_url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=ambient-piano-amp-strings-10711.mp3',
    cover_art_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'm-2',
    title: '以后别做朋友 (Let\'s Not Be Friends Anymore)',
    artist: '周兴哲 (Eric Chou)',
    album: '学着爱 (My Way to Love)',
    duration_seconds: 258,
    audio_url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73187.mp3?filename=lofi-study-112191.mp3',
    cover_art_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'm-3',
    title: '光年之外 (Light Years Away)',
    artist: '邓紫棋 (G.E.M.)',
    album: 'Passengers OST',
    duration_seconds: 235,
    audio_url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=synthwave-80s-110045.mp3',
    cover_art_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'm-4',
    title: '告白气球 (Love Confession)',
    artist: '周杰伦 (Jay Chou)',
    album: '周杰伦的床边故事',
    duration_seconds: 215,
    audio_url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=ambient-piano-amp-strings-10711.mp3',
    cover_art_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'm-5',
    title: '修炼爱情 (Practice Love)',
    artist: '林俊杰 (JJ Lin)',
    album: '因你而在 (Stories Untold)',
    duration_seconds: 280,
    audio_url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73187.mp3?filename=lofi-study-112191.mp3',
    cover_art_url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'm-6',
    title: '小幸運 (A Little Happiness)',
    artist: '田馥甄 (Hebe Tien)',
    album: '我的少女時代 OST',
    duration_seconds: 265,
    audio_url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=synthwave-80s-110045.mp3',
    cover_art_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'm-7',
    title: '爱很简单 (I Love You)',
    artist: '陶喆 (David Tao)',
    album: '陶喆同名专辑',
    duration_seconds: 270,
    audio_url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=ambient-piano-amp-strings-10711.mp3',
    cover_art_url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'm-8',
    title: '月亮代表我的心 (The Moon Represents My Heart)',
    artist: '邓丽君 (Teresa Teng)',
    album: '经典金曲传奇',
    duration_seconds: 210,
    audio_url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73187.mp3?filename=lofi-study-112191.mp3',
    cover_art_url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=400&q=80',
  },
];

export const useAudioStore = create<AudioStoreState>((set, get) => ({
  currentTrack: popularMandarinTracks[0],
  isPlaying: false,
  volume: 0.8,
  currentTime: 0,
  duration: popularMandarinTracks[0].duration_seconds,
  queue: popularMandarinTracks,
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
