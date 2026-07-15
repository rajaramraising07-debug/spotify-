export interface LyricLine {
  time: number; // in seconds
  text: string;
}

export interface SynthConfig {
  tempo: number;
  melody: number[]; // scale notes
  synthType: 'sine' | 'square' | 'triangle' | 'sawtooth';
  drumBeat: 'dance' | 'chill' | 'rock' | 'none';
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  coverUrl: string;
  audioUrl: string;
  genre: string;
  lyrics: LyricLine[];
  synthConfig?: SynthConfig;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  coverUrl: string;
  trackIds: string[];
  isCustom: boolean; // True if created by user
  createdAt: number;
}
