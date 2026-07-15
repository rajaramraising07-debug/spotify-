import { useState, useEffect, useRef } from 'react';
import {
  Search,
  Heart,
  Download,
  Music,
  ChevronLeft,
  ChevronRight,
  Wifi,
  WifiOff,
  Plus,
  Play,
  Pause,
  X,
  Volume2,
  AlertTriangle,
  RotateCcw,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { Track, Playlist } from './types';
import { TRACKS } from './data/tracks';
import { initDB, saveTrackOffline, getOfflineTrackBlob, deleteOfflineTrackBlob, getAllOfflineTrackIds } from './db';
import { WebAudioSynth } from './utils/synth';

import Sidebar from './components/Sidebar';
import Player from './components/Player';
import TrackList from './components/TrackList';
import LyricsPanel from './components/LyricsPanel';

// Default system playlists
const DEFAULT_PLAYLISTS: Playlist[] = [
  {
    id: 'pl-retro',
    name: 'Retro Future Beats',
    description: 'Neon synths, pumping drums, and high-tech adventures.',
    coverUrl: 'https://images.unsplash.com/photo-1515462277126-270d878326e5?w=400&auto=format&fit=crop&q=60',
    trackIds: ['track-1', 'track-4', 'track-6'],
    isCustom: false,
    createdAt: Date.now() - 100000
  },
  {
    id: 'pl-tamil',
    name: 'Tamil Hits & Folk Beats',
    description: 'Iconic Kollywood hits, energetic rhythms, and soul-stirring melodies from A.R. Rahman, Anirudh, and more.',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=60',
    trackIds: ['track-tamil-1', 'track-tamil-2', 'track-tamil-3', 'track-tamil-4', 'track-tamil-5'],
    isCustom: false,
    createdAt: Date.now() - 75000
  },
  {
    id: 'pl-chill',
    name: 'Chill Study Coffee',
    description: 'Smooth lo-fi, cozy cafes, and soft ambient soundscapes.',
    coverUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&auto=format&fit=crop&q=60',
    trackIds: ['track-2', 'track-3', 'track-5'],
    isCustom: false,
    createdAt: Date.now() - 50000
  }
];

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

export default function App() {
  // Core Track & Playback State
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<'none' | 'all' | 'one'>('none');
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Lists & Library States
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [likedTrackIds, setLikedTrackIds] = useState<string[]>([]);
  const [downloadedTrackIds, setDownloadedTrackIds] = useState<string[]>([]);
  const [downloadingTrackIds, setDownloadingTrackIds] = useState<string[]>([]);
  const [queue, setQueue] = useState<Track[]>([]);
  const [activeQueueIndex, setActiveQueueIndex] = useState(-1);

  // View States
  const [currentView, setCurrentView] = useState<'home' | 'search' | 'playlist' | 'liked' | 'downloads'>('home');
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);

  // Search & Filtering States
  const [searchTerm, setSearchTerm] = useState('');
  const [searchGenreFilter, setSearchGenreFilter] = useState('');

  // Toast System State
  const [toasts, setToasts] = useState<Toast[]>([]);

  // DOM Ref Handles
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthRef = useRef<WebAudioSynth | null>(null);
  const [isSynthPlaying, setIsSynthPlaying] = useState(false);

  // Mount logic: Load from LocalStorage & IndexedDB
  useEffect(() => {
    // 1. Initialise Audio Element
    const audio = new Audio();
    audioRef.current = audio;

    // 2. Initialise Synth
    synthRef.current = new WebAudioSynth();

    // 3. Sync Liked Tracks
    const localLikes = localStorage.getItem('spotify_liked_tracks');
    if (localLikes) {
      setLikedTrackIds(JSON.parse(localLikes));
    }

    // 4. Sync Playlists
    const localPlaylists = localStorage.getItem('spotify_custom_playlists');
    if (localPlaylists) {
      setPlaylists([...DEFAULT_PLAYLISTS, ...JSON.parse(localPlaylists)]);
    } else {
      setPlaylists(DEFAULT_PLAYLISTS);
    }

    // 5. Sync Offline Tracks from IndexedDB
    const syncOfflineTracks = async () => {
      try {
        await initDB();
        const ids = await getAllOfflineTrackIds();
        setDownloadedTrackIds(ids);
      } catch (err) {
        console.error("IndexedDB error during startup sync:", err);
      }
    };
    syncOfflineTracks();

    // 6. Handle Online status listener
    const handleStatusChange = () => {
      if (!navigator.onLine) {
        setIsOfflineMode(true);
        addToast("Network connection lost. Switched to offline mode.", "error");
      } else {
        addToast("Network connection restored.", "success");
      }
    };
    window.addEventListener('offline', handleStatusChange);
    window.addEventListener('online', handleStatusChange);

    return () => {
      audio.pause();
      audioRef.current = null;
      if (synthRef.current) {
        synthRef.current.stop();
      }
      window.removeEventListener('offline', handleStatusChange);
      window.removeEventListener('online', handleStatusChange);
    };
  }, []);

  // Audio Progress & Event Listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      if (!isSynthPlaying) {
        setProgress(audio.currentTime);
      }
    };

    const onLoadedMetadata = () => {
      if (!isSynthPlaying) {
        setDuration(audio.duration || 0);
      }
    };

    const onEnded = () => {
      handleNextTrack();
    };

    const onError = (e: any) => {
      console.warn("Audio playback streaming error, shifting to procedural synthesizer mode:", e);
      triggerSynthPlayback();
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, [queue, activeQueueIndex, repeat, shuffle, isSynthPlaying]);

  // Sync Volume to Audio and Synth
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = isMuted ? 0 : volume;
    }
    if (synthRef.current) {
      synthRef.current.setVolume(isMuted ? 0 : volume);
    }
  }, [volume, isMuted]);

  // Sync Speed/Playback Rate
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Toast adder helper
  const addToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = Date.now().toString() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Trigger faked procedural Web Audio Synth playback for complete offline or CORS problems
  const triggerSynthPlayback = () => {
    if (!currentTrack || !synthRef.current) return;
    setIsSynthPlaying(true);
    
    // Stop standard audio
    if (audioRef.current) {
      audioRef.current.pause();
    }

    // Set duration to configured track duration
    setDuration(currentTrack.duration);
    setProgress(0);

    const synthConfig = currentTrack.synthConfig || {
      tempo: 100,
      melody: [60, 62, 64, 67, 69],
      synthType: 'sine' as OscillatorType,
      drumBeat: 'chill' as const
    };

    addToast(`Playing "${currentTrack.title}" in high-fidelity synthesized offline mode`, "success");

    let synthProgress = 0;
    // Tick progress manually based on tempo
    const interval = 1000 / (synthConfig.tempo / 60);

    synthRef.current.start({
      tempo: synthConfig.tempo,
      melody: synthConfig.melody,
      synthType: synthConfig.synthType as OscillatorType,
      drumBeat: synthConfig.drumBeat,
      onBeat: () => {
        setProgress((prev) => {
          if (prev >= currentTrack.duration) {
            handleNextTrack();
            return 0;
          }
          return prev + 0.5; // increment progress
        });
      }
    });
    setIsPlaying(true);
  };

  // Playback Control Handlers
  const handlePlayPause = () => {
    if (!currentTrack) return;

    if (isPlaying) {
      if (isSynthPlaying && synthRef.current) {
        synthRef.current.stop();
      } else if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    } else {
      if (isSynthPlaying && synthRef.current) {
        // restart synth
        triggerSynthPlayback();
      } else if (audioRef.current) {
        audioRef.current.play().catch(() => {
          triggerSynthPlayback();
        });
        setIsPlaying(true);
      }
    }
  };

  const handlePlayTrack = async (track: Track, tracksContext: Track[] = TRACKS) => {
    // Load playlist/context into queue
    const targetTracks = tracksContext.filter(t => {
      if (isOfflineMode) return downloadedTrackIds.includes(t.id);
      return true;
    });

    const targetIdx = targetTracks.findIndex((t) => t.id === track.id);
    setQueue(targetTracks);
    setActiveQueueIndex(targetIdx !== -1 ? targetIdx : 0);
    setCurrentTrack(track);

    // Stop current synthesis if running
    if (synthRef.current) {
      synthRef.current.stop();
    }
    setIsSynthPlaying(false);

    // Play the song
    try {
      if (isOfflineMode) {
        // Read file bytes from IndexedDB directly
        const blob = await getOfflineTrackBlob(track.id);
        if (blob) {
          const offlineUrl = URL.createObjectURL(blob);
          if (audioRef.current) {
            audioRef.current.src = offlineUrl;
            audioRef.current.play().catch(() => triggerSynthPlayback());
            setIsPlaying(true);
          }
        } else {
          addToast("This track is not downloaded for offline use. Playing synthetic version.", "info");
          triggerSynthPlayback();
        }
      } else {
        // Normal online play
        if (audioRef.current) {
          audioRef.current.src = track.audioUrl;
          audioRef.current.load();
          audioRef.current.play().catch((err) => {
            console.warn("Playback error, triggering synthesizer:", err);
            triggerSynthPlayback();
          });
          setIsPlaying(true);
        }
      }
    } catch (e) {
      triggerSynthPlayback();
    }
  };

  const handleNextTrack = () => {
    if (queue.length === 0) return;

    let nextIdx = activeQueueIndex;
    if (repeat === 'one') {
      // Repeat the single track
      if (audioRef.current && !isSynthPlaying) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
        setProgress(0);
        return;
      } else {
        setProgress(0);
        return;
      }
    }

    if (shuffle) {
      nextIdx = Math.floor(Math.random() * queue.length);
    } else {
      nextIdx = activeQueueIndex + 1;
      if (nextIdx >= queue.length) {
        if (repeat === 'all') {
          nextIdx = 0;
        } else {
          setIsPlaying(false);
          if (synthRef.current) synthRef.current.stop();
          return;
        }
      }
    }

    setActiveQueueIndex(nextIdx);
    const nextTrack = queue[nextIdx];
    handlePlayTrack(nextTrack, queue);
  };

  const handlePrevTrack = () => {
    if (!audioRef.current || queue.length === 0) return;

    if (progress > 3) {
      if (isSynthPlaying) {
        setProgress(0);
      } else {
        audioRef.current.currentTime = 0;
        setProgress(0);
      }
      return;
    }

    let prevIdx = activeQueueIndex - 1;
    if (prevIdx < 0) {
      if (repeat === 'all') {
        prevIdx = queue.length - 1;
      } else {
        prevIdx = 0; // clamp to start
      }
    }

    setActiveQueueIndex(prevIdx);
    const prevTrack = queue[prevIdx];
    handlePlayTrack(prevTrack, queue);
  };

  const handleSeek = (time: number) => {
    if (isSynthPlaying) {
      setProgress(time);
    } else if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  };

  // Toggle Like Action
  const handleToggleLike = (trackId: string) => {
    const isLiked = likedTrackIds.includes(trackId);
    let updated: string[];

    if (isLiked) {
      updated = likedTrackIds.filter((id) => id !== trackId);
      addToast("Removed from Liked Songs", "info");
    } else {
      updated = [...likedTrackIds, trackId];
      addToast("Saved to Liked Songs", "success");
    }

    setLikedTrackIds(updated);
    localStorage.setItem('spotify_liked_tracks', JSON.stringify(updated));
  };

  // Toggle Offline Downloading Action
  const handleToggleDownload = async (trackId: string) => {
    const track = TRACKS.find((t) => t.id === trackId);
    if (!track) return;

    const isDownloaded = downloadedTrackIds.includes(trackId);

    if (isDownloaded) {
      // Remove offline download
      try {
        await deleteOfflineTrackBlob(trackId);
        const updated = downloadedTrackIds.filter((id) => id !== trackId);
        setDownloadedTrackIds(updated);
        addToast(`Removed offline download for "${track.title}"`, "info");
      } catch (err) {
        addToast("Failed to remove offline download", "error");
      }
    } else {
      // Begin download pipeline
      setDownloadingTrackIds((prev) => [...prev, trackId]);
      addToast(`Downloading "${track.title}" for offline play...`, "info");

      try {
        const res = await fetch(track.audioUrl);
        if (!res.ok) throw new Error("CORS or network blockage");
        const blob = await res.blob();

        await saveTrackOffline(trackId, blob);
        setDownloadedTrackIds((prev) => [...prev, trackId]);
        addToast(`"${track.title}" downloaded and stored in Offline Library.`, "success");
      } catch (e) {
        console.warn("Failed standard download due to CORS or network. Caching procedural offline metadata...", e);
        // Fallback: create a mock offline blob to ensure user can still click and trigger synthesis offline!
        try {
          const silentBlob = new Blob([new Uint8Array(100)], { type: 'audio/mp3' });
          await saveTrackOffline(trackId, silentBlob);
          setDownloadedTrackIds((prev) => [...prev, trackId]);
          addToast(`"${track.title}" added to Offline Library (Hi-Fi Synthesizer mode enabled).`, "success");
        } catch (err) {
          addToast("Could not download file. Offline database is full.", "error");
        }
      } finally {
        setDownloadingTrackIds((prev) => prev.filter((id) => id !== trackId));
      }
    }
  };

  // Custom Playlist Management
  const handleCreatePlaylist = (name: string, description: string) => {
    const newPlaylist: Playlist = {
      id: 'pl-custom-' + Date.now(),
      name,
      description,
      coverUrl: 'https://images.unsplash.com/photo-1487180142328-0c4e37023af5?w=400&auto=format&fit=crop&q=60',
      trackIds: [],
      isCustom: true,
      createdAt: Date.now()
    };

    const customOnly = playlists.filter((pl) => pl.isCustom);
    const updatedCustom = [...customOnly, newPlaylist];
    localStorage.setItem('spotify_custom_playlists', JSON.stringify(updatedCustom));

    setPlaylists([...DEFAULT_PLAYLISTS, ...updatedCustom]);
    addToast(`Playlist "${name}" created!`, "success");
  };

  const handleDeletePlaylist = (id: string) => {
    const customOnly = playlists.filter((pl) => pl.isCustom && pl.id !== id);
    localStorage.setItem('spotify_custom_playlists', JSON.stringify(customOnly));

    setPlaylists([...DEFAULT_PLAYLISTS, ...customOnly]);
    addToast("Playlist deleted successfully", "info");
  };

  const handleAddToPlaylist = (trackId: string, playlistId: string) => {
    const plist = playlists.find((p) => p.id === playlistId);
    if (!plist) return;

    if (plist.trackIds.includes(trackId)) {
      addToast("Song already in playlist", "info");
      return;
    }

    const updatedPlaylists = playlists.map((pl) => {
      if (pl.id === playlistId) {
        return { ...pl, trackIds: [...pl.trackIds, trackId] };
      }
      return pl;
    });

    setPlaylists(updatedPlaylists);

    // Save custom ones to localStorage
    const customOnly = updatedPlaylists.filter((pl) => pl.isCustom);
    localStorage.setItem('spotify_custom_playlists', JSON.stringify(customOnly));

    addToast(`Added song to "${plist.name}"`, "success");
  };

  const handleRemoveFromPlaylist = (trackId: string, playlistId: string) => {
    const plist = playlists.find((p) => p.id === playlistId);
    if (!plist) return;

    const updatedPlaylists = playlists.map((pl) => {
      if (pl.id === playlistId) {
        return { ...pl, trackIds: pl.trackIds.filter((id) => id !== trackId) };
      }
      return pl;
    });

    setPlaylists(updatedPlaylists);

    const customOnly = updatedPlaylists.filter((pl) => pl.isCustom);
    localStorage.setItem('spotify_custom_playlists', JSON.stringify(customOnly));

    addToast(`Removed song from "${plist.name}"`, "info");
  };

  // Toggle Offline Simulation Mode
  const handleToggleOfflineMode = (offline: boolean) => {
    setIsOfflineMode(offline);
    if (offline) {
      addToast("Simulated offline mode activated. Non-downloaded tracks are disabled.", "info");
      // If current track is not downloaded, stop playing it
      if (currentTrack && !downloadedTrackIds.includes(currentTrack.id)) {
        if (audioRef.current) audioRef.current.pause();
        if (synthRef.current) synthRef.current.stop();
        setIsPlaying(false);
      }
    } else {
      addToast("Online mode restored. All songs unlocked.", "success");
    }
  };

  // Filter Tracks Based on Search and Offline State
  const getFilteredTracks = () => {
    let result = TRACKS;

    // Filter downloaded only if offline mode
    if (isOfflineMode) {
      result = result.filter((t) => downloadedTrackIds.includes(t.id));
    }

    // Apply Real-time Text Search Filter
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(term) ||
          t.artist.toLowerCase().includes(term) ||
          t.album.toLowerCase().includes(term) ||
          t.genre.toLowerCase().includes(term)
      );
    }

    // Apply Genre bubble filters
    if (searchGenreFilter !== '') {
      result = result.filter((t) => t.genre.toLowerCase() === searchGenreFilter.toLowerCase());
    }

    return result;
  };

  // Greeting Message based on local time
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good morning';
    if (hours < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Active view content renderer
  const renderMainContent = () => {
    const filteredTracks = getFilteredTracks();
    const greetings = getGreeting();

    if (currentView === 'home') {
      return (
        <div id="home-view" className="space-y-10 select-none">
          {/* Welcome Greeting Banner */}
          <div className="mb-10">
            <h1 className="text-6xl sm:text-8xl md:text-[100px] font-black leading-[0.85] tracking-tighter uppercase mb-4 text-white">
              {greetings}
            </h1>
            <p className="text-xl text-gray-400 font-medium">Welcome back to your high-fidelity client audio station.</p>
          </div>

          {/* Quick Access Grid */}
          <div className="space-y-4">
            <h2 className="text-xs font-black uppercase tracking-widest text-[#1DB954]">Quick Action Centers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="home-quick-actions">
              <div
                onClick={() => { setCurrentView('downloads'); }}
                className="bg-[#181818] hover:bg-[#282828] transition-colors rounded-2xl p-6 flex items-center justify-between cursor-pointer border border-[#1a1a1a] hover:border-[#1DB954]/30 shadow-2xl"
              >
                <div>
                  <h3 className="font-black text-white text-lg">Offline Downloads</h3>
                  <p className="text-xs text-gray-400 mt-1">{downloadedTrackIds.length} tracks ready offline</p>
                </div>
                <div className="w-12 h-12 bg-emerald-500/10 text-[#1DB954] rounded-full flex items-center justify-center font-black text-lg">
                  {downloadedTrackIds.length}
                </div>
              </div>

              <div
                onClick={() => { setCurrentView('liked'); }}
                className="bg-[#181818] hover:bg-[#282828] transition-colors rounded-2xl p-6 flex items-center justify-between cursor-pointer border border-[#1a1a1a] hover:border-[#1DB954]/30 shadow-2xl"
              >
                <div>
                  <h3 className="font-black text-white text-lg">Liked Songs</h3>
                  <p className="text-xs text-gray-400 mt-1">{likedTrackIds.length} favorite songs</p>
                </div>
                <div className="w-12 h-12 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center font-black text-lg">
                  {likedTrackIds.length}
                </div>
              </div>

              <div
                onClick={() => { setCurrentView('search'); }}
                className="bg-[#181818] hover:bg-[#282828] transition-colors rounded-2xl p-6 flex items-center justify-between cursor-pointer border border-[#1a1a1a] hover:border-[#1DB954]/30 shadow-2xl"
              >
                <div>
                  <h3 className="font-black text-white text-lg">Music Finder</h3>
                  <p className="text-xs text-gray-400 mt-1">Search through {TRACKS.length} tracks</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center text-lg">
                  🔍
                </div>
              </div>
            </div>
          </div>

          {/* Curated Preloaded Playlists */}
          <div className="space-y-4">
            <h2 className="text-xs font-black uppercase tracking-widest text-[#1DB954]">Curated Vibe Mixes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="home-vibe-mixes">
              {playlists.slice(0, 3).map((pl) => (
                <div
                  key={pl.id}
                  onClick={() => {
                    setCurrentView('playlist');
                    setActivePlaylistId(pl.id);
                  }}
                  className="bg-[#181818] hover:bg-[#282828] transition-colors rounded-2xl p-6 flex gap-6 cursor-pointer border border-[#1a1a1a] hover:border-[#1DB954]/30 shadow-2xl group"
                >
                  <img src={pl.coverUrl} alt={pl.name} className="w-24 h-24 rounded-xl object-cover shadow-2xl flex-shrink-0 bg-neutral-800" referrerPolicy="no-referrer" />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h3 className="font-black text-white text-xl group-hover:text-[#1DB954] transition truncate">{pl.name}</h3>
                      <p className="text-sm text-gray-400 mt-1 line-clamp-2 leading-relaxed">{pl.description}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] bg-white/5 border border-white/5 text-gray-400 px-2.5 py-1 rounded-full font-black uppercase tracking-wider">
                        {pl.trackIds.length} tracks
                      </span>
                      <button className="bg-[#1DB954] text-black w-10 h-10 rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition duration-300">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Full catalog recommendation table */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-widest text-[#1DB954]">Full Curated Catalog</h2>
              {isOfflineMode && (
                <span className="text-xs text-amber-500 font-bold bg-amber-500/10 rounded-full px-3 py-1 animate-pulse flex items-center gap-1">
                  <WifiOff className="w-3.5 h-3.5" /> Offline Filtering On
                </span>
              )}
            </div>
            <div className="bg-[#121212]/50 border border-white/5 rounded-2xl p-6">
              <TrackList
                tracks={isOfflineMode ? TRACKS.filter(t => downloadedTrackIds.includes(t.id)) : TRACKS}
                currentTrack={currentTrack}
                isPlaying={isPlaying}
                isOfflineMode={isOfflineMode}
                downloadedTrackIds={downloadedTrackIds}
                likedTrackIds={likedTrackIds}
                downloadingTrackIds={downloadingTrackIds}
                playlists={playlists}
                onPlayTrack={(t) => handlePlayTrack(t, TRACKS)}
                onToggleLike={handleToggleLike}
                onToggleDownload={handleToggleDownload}
                onAddToPlaylist={handleAddToPlaylist}
              />
            </div>
          </div>
        </div>
      );
    }

    if (currentView === 'search') {
      const genres = ['Synthwave', 'Lo-Fi', 'Acoustic / Chill', 'Cyberpunk / Techno', 'Ambient / Space', 'Deep House', 'Kollywood / Tamil'];
      return (
        <div id="search-view" className="space-y-10">
          <div className="mb-10 select-none">
            <h1 className="text-6xl sm:text-8xl md:text-[100px] font-black leading-[0.85] tracking-tighter uppercase mb-4 text-white">
              Search
            </h1>
            <p className="text-xl text-gray-400 font-medium">Explore real-time filtering across artists, genres, or albums.</p>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-4 w-5 h-5 text-gray-400" id="search-box-icon" />
            <input
              id="search-input-field"
              type="text"
              autoFocus
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for artists, songs, or podcasts"
              className="w-full bg-[#242424] rounded-full py-3.5 px-12 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#1DB954] placeholder-neutral-500 font-bold"
            />
            {searchTerm && (
              <button
                id="search-clear-btn"
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-4 text-gray-400 hover:text-white p-0.5 rounded-full hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Genre Bubbles */}
          <div id="genre-search-bubbles" className="flex flex-wrap items-center gap-2">
            <button
              id="genre-filter-all"
              onClick={() => setSearchGenreFilter('')}
              className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider cursor-pointer transition ${
                searchGenreFilter === ''
                  ? 'bg-[#1DB954] text-black'
                  : 'bg-[#181818] border border-[#1a1a1a] text-gray-300 hover:bg-[#282828]'
              }`}
            >
              All Genres
            </button>
            {genres.map((g) => (
              <button
                key={g}
                id={`genre-filter-${g.replace(/\s+/g, '-')}`}
                onClick={() => setSearchGenreFilter(g)}
                className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider cursor-pointer transition ${
                  searchGenreFilter === g
                    ? 'bg-[#1DB954] text-black'
                    : 'bg-[#181818] border border-[#1a1a1a] text-gray-300 hover:bg-[#282828]'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          {/* Search Result Tracks */}
          <div className="space-y-4">
            <h2 className="text-xs font-black uppercase tracking-widest text-[#1DB954]">
              {searchGenreFilter ? `${searchGenreFilter} Tracks` : searchTerm ? 'Search Results' : 'Explore Curated Catalog'}
            </h2>
            <div className="bg-[#121212]/50 border border-white/5 rounded-2xl p-6">
              <TrackList
                tracks={filteredTracks}
                currentTrack={currentTrack}
                isPlaying={isPlaying}
                isOfflineMode={isOfflineMode}
                downloadedTrackIds={downloadedTrackIds}
                likedTrackIds={likedTrackIds}
                downloadingTrackIds={downloadingTrackIds}
                playlists={playlists}
                onPlayTrack={(t) => handlePlayTrack(t, filteredTracks)}
                onToggleLike={handleToggleLike}
                onToggleDownload={handleToggleDownload}
                onAddToPlaylist={handleAddToPlaylist}
              />
            </div>
          </div>
        </div>
      );
    }

    if (currentView === 'liked') {
      const likedTracks = TRACKS.filter((t) => likedTrackIds.includes(t.id));
      const tracksToDisplay = isOfflineMode ? likedTracks.filter(t => downloadedTrackIds.includes(t.id)) : likedTracks;

      return (
        <div id="liked-songs-view" className="space-y-10">
          <div id="liked-hero" className="flex flex-col md:flex-row gap-8 items-start md:items-end mb-10 select-none">
            <div className="w-40 h-40 bg-gradient-to-br from-[#1DB954] to-neutral-900 rounded-2xl flex items-center justify-center shadow-2xl flex-shrink-0 border border-[#1a1a1a]">
              <Heart className="w-20 h-20 text-white fill-current animate-[pulse_3s_infinite]" />
            </div>
            <div className="flex-1">
              <span className="text-xs font-black uppercase tracking-widest text-[#1DB954]">Personal Collection</span>
              <h1 className="text-6xl sm:text-8xl md:text-[100px] font-black leading-[0.85] tracking-tighter uppercase mb-4 text-white">Liked</h1>
              <p className="text-xl text-gray-400 font-medium leading-relaxed">Your absolute favorites, stored securely on device.</p>
              <div className="flex items-center gap-3 mt-6 text-sm font-black uppercase tracking-widest text-gray-300">
                <span>{tracksToDisplay.length} songs</span>
                {tracksToDisplay.length > 0 && (
                  <>
                    <span className="h-1.5 w-1.5 bg-[#1DB954] rounded-full" />
                    <button
                      onClick={() => handlePlayTrack(tracksToDisplay[0], tracksToDisplay)}
                      className="text-[#1DB954] hover:underline flex items-center gap-1 cursor-pointer font-black"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" /> Play collection
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="bg-[#121212]/50 border border-white/5 rounded-2xl p-6">
            <TrackList
              tracks={tracksToDisplay}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              isOfflineMode={isOfflineMode}
              downloadedTrackIds={downloadedTrackIds}
              likedTrackIds={likedTrackIds}
              downloadingTrackIds={downloadingTrackIds}
              playlists={playlists}
              onPlayTrack={(t) => handlePlayTrack(t, tracksToDisplay)}
              onToggleLike={handleToggleLike}
              onToggleDownload={handleToggleDownload}
              onAddToPlaylist={handleAddToPlaylist}
            />
          </div>
        </div>
      );
    }

    if (currentView === 'downloads') {
      const downloadedTracks = TRACKS.filter((t) => downloadedTrackIds.includes(t.id));
      const estimateSavings = (downloadedTracks.length * 8.4).toFixed(1); // average 8.4MB per track

      return (
        <div id="downloads-view" className="space-y-10">
          <div id="downloads-hero" className="flex flex-col md:flex-row gap-8 items-start md:items-end mb-10 select-none">
            <div className="w-40 h-40 bg-gradient-to-br from-[#1DB954] to-neutral-900 rounded-2xl flex items-center justify-center shadow-2xl border border-[#1a1a1a] flex-shrink-0">
              <Download className="w-20 h-20 text-white" />
            </div>
            <div className="flex-1">
              <span className="text-xs font-black uppercase tracking-widest text-[#1DB954]">IndexedDB Offline Store</span>
              <h1 className="text-6xl sm:text-8xl md:text-[100px] font-black leading-[0.85] tracking-tighter uppercase mb-4 text-white">Offline</h1>
              <p className="text-xl text-gray-400 font-medium leading-relaxed">
                Songs cached directly inside your browser storage. Playable with zero network consumption.
              </p>
              <div className="flex items-center gap-3 mt-6 text-sm font-black uppercase tracking-widest text-gray-300">
                <span className="text-[#1DB954]">{downloadedTracks.length} songs downloaded</span>
                <span className="h-1.5 w-1.5 bg-[#1DB954] rounded-full" />
                <span>Est. Space: ~{estimateSavings} MB</span>
              </div>
            </div>
          </div>

          <div className="bg-[#121212]/50 border border-white/5 rounded-2xl p-6">
            <TrackList
              tracks={downloadedTracks}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              isOfflineMode={isOfflineMode}
              downloadedTrackIds={downloadedTrackIds}
              likedTrackIds={likedTrackIds}
              downloadingTrackIds={downloadingTrackIds}
              playlists={playlists}
              onPlayTrack={(t) => handlePlayTrack(t, downloadedTracks)}
              onToggleLike={handleToggleLike}
              onToggleDownload={handleToggleDownload}
              onAddToPlaylist={handleAddToPlaylist}
            />
          </div>
        </div>
      );
    }

    if (currentView === 'playlist') {
      const plist = playlists.find((p) => p.id === activePlaylistId);
      if (!plist) return <div className="p-12 text-center text-gray-500 font-bold">Playlist not found.</div>;

      // Filter track list for active playlist
      const plistTracks = TRACKS.filter((t) => plist.trackIds.includes(t.id));
      const tracksToDisplay = isOfflineMode ? plistTracks.filter(t => downloadedTrackIds.includes(t.id)) : plistTracks;

      return (
        <div id="playlist-detail-view" className="space-y-10">
          {/* Playlist Detail Header */}
          <div id="playlist-hero" className="flex flex-col md:flex-row gap-8 items-start md:items-end mb-10 select-none">
            <div className="w-40 h-40 bg-gradient-to-br from-[#1DB954] to-neutral-900 rounded-2xl flex items-center justify-center shadow-2xl overflow-hidden flex-shrink-0 border border-[#1a1a1a]">
              {plist.coverUrl ? (
                <img src={plist.coverUrl} alt={plist.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <Music className="w-20 h-20 text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-black uppercase tracking-widest text-[#1DB954]">
                {plist.isCustom ? 'Custom Playlist' : 'System Playlist'}
              </span>
              <h1 className="text-6xl sm:text-8xl md:text-[100px] font-black leading-[0.85] tracking-tighter uppercase mb-4 text-white truncate">{plist.name}</h1>
              <p className="text-xl text-gray-400 font-medium leading-relaxed">
                {plist.description || 'No description provided.'}
              </p>
              <div className="flex items-center gap-3 mt-6 text-sm font-black uppercase tracking-widest text-gray-300">
                <span>{tracksToDisplay.length} songs</span>
                {tracksToDisplay.length > 0 && (
                  <>
                    <span className="h-1.5 w-1.5 bg-[#1DB954] rounded-full" />
                    <button
                      onClick={() => handlePlayTrack(tracksToDisplay[0], tracksToDisplay)}
                      className="text-[#1DB954] hover:underline flex items-center gap-1 cursor-pointer font-black"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" /> Play playlist
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="bg-[#121212]/50 border border-white/5 rounded-2xl p-6">
            <TrackList
              tracks={tracksToDisplay}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              isOfflineMode={isOfflineMode}
              downloadedTrackIds={downloadedTrackIds}
              likedTrackIds={likedTrackIds}
              downloadingTrackIds={downloadingTrackIds}
              playlists={playlists}
              playlistIdContext={plist.id}
              onPlayTrack={(t) => handlePlayTrack(t, tracksToDisplay)}
              onToggleLike={handleToggleLike}
              onToggleDownload={handleToggleDownload}
              onAddToPlaylist={handleAddToPlaylist}
              onRemoveFromPlaylist={handleRemoveFromPlaylist}
            />
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div id="spotify-app-container" className="flex flex-col h-screen w-screen bg-[#000000] text-white font-sans overflow-hidden">
      {/* Top and Center Content Layout */}
      <div id="main-layout-split" className="flex flex-1 min-h-0 w-full">
        {/* Navigation Sidebar */}
        <Sidebar
          currentView={currentView}
          setCurrentView={(v) => {
            setCurrentView(v);
            setIsLyricsOpen(false);
          }}
          playlists={playlists}
          activePlaylistId={activePlaylistId}
          setActivePlaylistId={setActivePlaylistId}
          onCreatePlaylist={handleCreatePlaylist}
          onDeletePlaylist={handleDeletePlaylist}
          isOfflineMode={isOfflineMode}
          setIsOfflineMode={handleToggleOfflineMode}
          likedSongsCount={likedTrackIds.length}
          downloadedSongsCount={downloadedTrackIds.length}
        />

        {/* Center Main Stage view OR Synced Lyrics pane */}
        <div id="main-scrollable-stage" className="flex-1 flex flex-col min-w-0 bg-[#000000]">
          {/* Sticky Header Action bar */}
          <header id="main-header" className="h-20 bg-transparent px-10 flex items-center justify-between z-10 flex-shrink-0">
            <div id="header-navigation-triggers" className="flex items-center gap-2">
              <button
                onClick={() => setCurrentView('home')}
                className="p-2 bg-[#242424] rounded-full text-gray-400 hover:text-white transition disabled:opacity-40 cursor-pointer"
                title="Back to Home"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentView('search')}
                className="p-2 bg-[#242424] rounded-full text-gray-400 hover:text-white transition disabled:opacity-40 cursor-pointer"
                title="Go to Search"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Offline Simulation / Sync Details Banner */}
            <div id="header-status" className="flex items-center gap-3">
              {isOfflineMode ? (
                <span className="text-xs text-amber-500 font-bold bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full flex items-center gap-1.5 animate-pulse">
                  <WifiOff className="w-3.5 h-3.5" /> offline
                </span>
              ) : (
                <span className="text-xs text-[#1DB954] font-bold bg-[#1DB954]/10 border border-[#1DB954]/20 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5" /> online
                </span>
              )}

              {/* User Avatar tag */}
              <div className="flex items-center gap-2 bg-[#242424] border border-white/5 rounded-full pl-2 pr-3 py-1 text-xs font-semibold cursor-pointer select-none">
                <div className="w-6 h-6 bg-white text-black font-black rounded-full flex items-center justify-center text-xs">
                  JD
                </div>
                <span className="text-gray-300 truncate max-w-[100px]">Rajaram</span>
              </div>
            </div>
          </header>

          {/* Subview or Synced Lyrics */}
          <div id="stage-viewport" className="flex-1 overflow-y-auto px-10 pb-10 custom-scrollbar bg-gradient-to-b from-[#1a1a1a] to-[#000000] relative">
            {isLyricsOpen ? (
              <LyricsPanel track={currentTrack} currentTime={progress} />
            ) : (
              renderMainContent()
            )}
          </div>
        </div>

        {/* Right slide-in Queue Panel */}
        <AnimatePresence>
          {isQueueOpen && (
            <motion.div
              id="right-queue-drawer"
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              className="w-80 bg-[#121212] border-l border-white/5 p-4 flex flex-col h-full z-20 shadow-2xl overflow-hidden"
            >
              <div id="queue-header" className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
                <h3 className="font-bold text-white flex items-center gap-2 text-sm uppercase tracking-wider">
                  Play Queue ({queue.length})
                </h3>
                <button
                  onClick={() => setIsQueueOpen(false)}
                  className="text-gray-400 hover:text-white hover:bg-white/5 p-1 rounded-full cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Queue Lists Scroll */}
              <div id="queue-scroller" className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-1">
                {/* Active song */}
                {currentTrack && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-500">Currently Playing</p>
                    <div className="flex items-center gap-3 p-2 bg-[#282828] rounded-md border border-white/5">
                      <img src={currentTrack.coverUrl} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-[#1db954] truncate">{currentTrack.title}</p>
                        <p className="text-[10px] text-gray-400 truncate">{currentTrack.artist}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Upcoming */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500">Next Up</p>
                  {queue.length <= 1 ? (
                    <p className="text-xs text-gray-600 italic px-2 py-4">Queue is empty. Select a playlist or album to queue songs!</p>
                  ) : (
                    <div className="space-y-1">
                      {queue.map((track, idx) => {
                        if (idx === activeQueueIndex) return null;
                        return (
                          <div
                            key={`${track.id}-${idx}`}
                            onClick={() => handlePlayTrack(track, queue)}
                            className="flex items-center gap-3 p-1.5 hover:bg-white/5 rounded transition cursor-pointer group text-left"
                          >
                            <img src={track.coverUrl} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium text-white truncate group-hover:text-[#1db954] transition">{track.title}</p>
                              <p className="text-[10px] text-gray-400 truncate">{track.artist}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              
              {queue.length > 0 && (
                <button
                  id="clear-queue-btn"
                  onClick={() => {
                    setQueue([]);
                    setActiveQueueIndex(-1);
                    addToast("Queue cleared", "info");
                  }}
                  className="mt-4 w-full bg-[#282828] hover:bg-[#323232] transition rounded py-2 text-xs font-bold text-gray-300 border border-white/5 cursor-pointer"
                >
                  Clear Queue
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Playback Control Bar */}
      <Player
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        progress={progress}
        duration={duration}
        onSeek={handleSeek}
        onPlayPause={handlePlayPause}
        onNext={handleNextTrack}
        onPrev={handlePrevTrack}
        volume={volume}
        onVolumeChange={setVolume}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(!isMuted)}
        shuffle={shuffle}
        onToggleShuffle={() => {
          setShuffle(!shuffle);
          addToast(shuffle ? "Shuffle off" : "Shuffle on", "info");
        }}
        repeat={repeat}
        onToggleRepeat={() => {
          const nextRepeat = repeat === 'none' ? 'all' : repeat === 'all' ? 'one' : 'none';
          setRepeat(nextRepeat);
          addToast(`Repeat: ${nextRepeat}`, "info");
        }}
        playbackRate={playbackRate}
        onPlaybackRateChange={setPlaybackRate}
        isLyricsOpen={isLyricsOpen}
        setIsLyricsOpen={setIsLyricsOpen}
        isQueueOpen={isQueueOpen}
        setIsQueueOpen={setIsQueueOpen}
        likedTrackIds={likedTrackIds}
        onToggleLike={handleToggleLike}
        downloadedTrackIds={downloadedTrackIds}
        onToggleDownload={handleToggleDownload}
        analyser={null} // Passing null as we are utilizing synced procedural waveforms for cross-origin audio stability
      />

      {/* Real-time Overlay Notification Toast Deck */}
      <div id="toast-deck" className="fixed bottom-28 right-6 flex flex-col gap-2 z-50 pointer-events-none max-w-sm">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ y: 50, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.9 }}
              className={`p-3.5 rounded-lg shadow-2xl text-xs font-semibold text-white pointer-events-auto flex items-center gap-2.5 border ${
                toast.type === 'success'
                  ? 'bg-emerald-950/90 border-emerald-500/30'
                  : toast.type === 'error'
                  ? 'bg-red-950/90 border-red-500/30'
                  : 'bg-neutral-900/95 border-white/10'
              }`}
            >
              <div className="flex-1 leading-relaxed">
                {toast.message}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
