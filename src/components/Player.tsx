import { useState, useEffect, ChangeEvent } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Shuffle,
  Repeat,
  Volume2,
  VolumeX,
  ListMusic,
  Maximize2,
  Mic2,
  Heart,
  Download,
  Moon,
} from 'lucide-react';
import { Track } from '../types';
import Visualizer from './Visualizer';

interface PlayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  onSeek: (time: number) => void;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  shuffle: boolean;
  onToggleShuffle: () => void;
  repeat: 'none' | 'all' | 'one';
  onToggleRepeat: () => void;
  playbackRate: number;
  onPlaybackRateChange: (rate: number) => void;
  isLyricsOpen: boolean;
  setIsLyricsOpen: (open: boolean) => void;
  isQueueOpen: boolean;
  setIsQueueOpen: (open: boolean) => void;
  likedTrackIds: string[];
  onToggleLike: (trackId: string) => void;
  downloadedTrackIds: string[];
  onToggleDownload: (trackId: string) => void;
  analyser: AnalyserNode | null;
}

export default function Player({
  currentTrack,
  isPlaying,
  progress,
  duration,
  onSeek,
  onPlayPause,
  onNext,
  onPrev,
  volume,
  onVolumeChange,
  isMuted,
  onToggleMute,
  shuffle,
  onToggleShuffle,
  repeat,
  onToggleRepeat,
  playbackRate,
  onPlaybackRateChange,
  isLyricsOpen,
  setIsLyricsOpen,
  isQueueOpen,
  setIsQueueOpen,
  likedTrackIds,
  onToggleLike,
  downloadedTrackIds,
  onToggleDownload,
  analyser,
}: PlayerProps) {
  const [showSpeedDropdown, setShowSpeedDropdown] = useState(false);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number | null>(null);
  const [showSleepDropdown, setShowSleepDropdown] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('');

  useEffect(() => {
    if (sleepTimerRemaining === null) return;

    if (sleepTimerRemaining <= 0) {
      if (isPlaying) {
        onPlayPause();
      }
      setSleepTimerRemaining(null);
      return;
    }

    const interval = setInterval(() => {
      setSleepTimerRemaining((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sleepTimerRemaining, isPlaying, onPlayPause]);

  const formatSleepTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleProgressChange = (e: ChangeEvent<HTMLInputElement>) => {
    onSeek(parseFloat(e.target.value));
  };

  const handleVolumeSlider = (e: ChangeEvent<HTMLInputElement>) => {
    onVolumeChange(parseFloat(e.target.value));
  };

  const isLiked = currentTrack ? likedTrackIds.includes(currentTrack.id) : false;
  const isDownloaded = currentTrack ? downloadedTrackIds.includes(currentTrack.id) : false;

  const speedOptions = [1, 1.25, 1.5, 2];

  return (
    <div
      id="bottom-player-bar"
      className="bg-[#000000] border-t border-[#1a1a1a] h-24 px-6 flex items-center justify-between select-none"
    >
      {/* Left: Active Track Info */}
      <div id="player-track-info" className="flex items-center gap-4 w-1/4 min-w-[180px]">
        {currentTrack ? (
          <>
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className="w-14 h-14 rounded-md object-cover flex-shrink-0 shadow-lg bg-neutral-800"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-white truncate hover:underline cursor-pointer" id="player-track-title">
                {currentTrack.title}
              </p>
              <p className="text-xs text-gray-400 truncate hover:underline cursor-pointer" id="player-track-artist">
                {currentTrack.artist}
              </p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {/* Like current track */}
              <button
                id="player-like-btn"
                onClick={() => onToggleLike(currentTrack.id)}
                className={`p-1 hover:bg-white/5 rounded-full transition cursor-pointer ${
                  isLiked ? 'text-[#1DB954]' : 'text-gray-400 hover:text-white'
                }`}
                title={isLiked ? 'Remove from Liked Songs' : 'Save to Liked Songs'}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              </button>
              {/* Download current track */}
              <button
                id="player-download-btn"
                onClick={() => onToggleDownload(currentTrack.id)}
                className={`p-1 hover:bg-white/5 rounded-full transition cursor-pointer ${
                  isDownloaded ? 'text-[#1DB954]' : 'text-gray-400 hover:text-white'
                }`}
                title={isDownloaded ? 'Downloaded Offline' : 'Download Offline'}
              >
                <Download className={`w-4 h-4 ${isDownloaded ? 'fill-current' : ''}`} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-neutral-800 rounded-md flex items-center justify-center border border-white/5">
              <ListMusic className="w-6 h-6 text-gray-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 italic">No track selected</p>
              <p className="text-xs text-gray-600">Select a song to start</p>
            </div>
          </div>
        )}
      </div>

      {/* Center: Playback Controls */}
      <div id="player-controls-container" className="flex flex-col items-center gap-2 max-w-xl w-2/5">
        <div id="playback-buttons" className="flex items-center gap-5">
          {/* Shuffle Toggle */}
          <button
            id="player-shuffle-btn"
            onClick={onToggleShuffle}
            className={`p-1 hover:scale-105 transition cursor-pointer ${
              shuffle ? 'text-[#1db954]' : 'text-gray-400 hover:text-white'
            }`}
            title="Shuffle"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          {/* Previous Track */}
          <button
            id="player-prev-btn"
            onClick={onPrev}
            disabled={!currentTrack}
            className="text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 p-1 transition cursor-pointer"
            title="Previous"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          {/* Play / Pause Toggle */}
          <button
            id="player-play-pause-btn"
            onClick={onPlayPause}
            disabled={!currentTrack}
            className="bg-white text-black p-2.5 rounded-full hover:scale-105 active:scale-95 transition disabled:opacity-30 disabled:hover:scale-100 flex items-center justify-center shadow-lg cursor-pointer"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current text-black" />
            ) : (
              <Play className="w-5 h-5 fill-current text-black translate-x-[1px]" />
            )}
          </button>

          {/* Next Track */}
          <button
            id="player-next-btn"
            onClick={onNext}
            disabled={!currentTrack}
            className="text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 p-1 transition cursor-pointer"
            title="Next"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>

          {/* Repeat Toggle */}
          <button
            id="player-repeat-btn"
            onClick={onToggleRepeat}
            className={`p-1 hover:scale-105 transition relative cursor-pointer ${
              repeat !== 'none' ? 'text-[#1db954]' : 'text-gray-400 hover:text-white'
            }`}
            title={`Repeat: ${repeat}`}
          >
            <Repeat className="w-4 h-4" />
            {repeat === 'one' && (
              <span className="absolute top-0 right-0 bg-[#1db954] text-black font-black text-[7px] w-2.5 h-2.5 rounded-full flex items-center justify-center border border-[#181818]">
                1
              </span>
            )}
          </button>
        </div>

        {/* Progress Timeline Slider */}
        <div id="playback-timeline" className="flex items-center gap-2 w-full">
          <span className="text-[10px] text-gray-400 font-mono w-8 text-right">
            {formatTime(progress)}
          </span>
          <input
            id="playback-range"
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={progress}
            onChange={handleProgressChange}
            disabled={!currentTrack}
            className="flex-1 accent-[#1DB954] bg-[#333] h-1 rounded-full cursor-pointer hover:accent-[#1DB954]/80 disabled:opacity-50"
          />
          <span className="text-[10px] text-gray-400 font-mono w-8 text-left">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Right: Audio Volume, Speed, Visualizer & Panels */}
      <div id="player-utilities" className="flex items-center justify-end gap-3.5 w-1/4 min-w-[200px]">
        {/* Sleep Timer Toggle */}
        <div className="relative">
          <button
            id="sleep-timer-btn"
            onClick={() => setShowSleepDropdown(!showSleepDropdown)}
            className={`p-1.5 hover:bg-white/5 rounded-full transition cursor-pointer flex items-center gap-1 ${
              sleepTimerRemaining !== null ? 'text-[#1DB954]' : 'text-gray-400 hover:text-white'
            }`}
            title="Sleep Timer"
          >
            <Moon className="w-4 h-4 animate-[pulse_6s_infinite]" />
            {sleepTimerRemaining !== null && (
              <span className="text-[10px] font-black font-mono">
                {formatSleepTime(sleepTimerRemaining)}
              </span>
            )}
          </button>
          {showSleepDropdown && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowSleepDropdown(false)} />
              <div className="absolute bottom-12 right-0 bg-[#121212] border border-white/10 rounded-2xl shadow-2xl p-4 z-40 text-xs text-white min-w-[200px] flex flex-col gap-3">
                <div className="font-black text-xs uppercase tracking-wider text-[#1DB954] border-b border-white/5 pb-2">
                  Sleep Timer
                </div>
                
                {/* Timer options */}
                <div className="flex flex-col gap-1">
                  {[
                    { label: '5 minutes', value: 5 * 60 },
                    { label: '10 minutes', value: 10 * 60 },
                    { label: '15 minutes', value: 15 * 60 },
                    { label: '30 minutes', value: 30 * 60 },
                    { label: '45 minutes', value: 45 * 60 },
                    { label: '60 minutes', value: 60 * 60 },
                  ].map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => {
                        setSleepTimerRemaining(preset.value);
                        setShowSleepDropdown(false);
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-white/5 transition text-gray-300 hover:text-white flex justify-between items-center"
                    >
                      <span>{preset.label}</span>
                      {sleepTimerRemaining === preset.value && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1DB954]" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Custom Input */}
                <div className="border-t border-white/5 pt-2 flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Custom Minutes</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={1}
                      max={1440}
                      value={customMinutes}
                      onChange={(e) => setCustomMinutes(e.target.value)}
                      placeholder="Min"
                      className="w-full bg-[#2a2a2a] rounded-lg px-2 py-1 text-white border border-white/5 focus:outline-none focus:border-[#1DB954] font-bold text-center"
                    />
                    <button
                      onClick={() => {
                        const mins = parseInt(customMinutes);
                        if (!isNaN(mins) && mins > 0) {
                          setSleepTimerRemaining(mins * 60);
                          setCustomMinutes('');
                          setShowSleepDropdown(false);
                        }
                      }}
                      className="bg-[#1DB954] text-black font-black px-3 py-1 rounded-lg hover:scale-105 active:scale-95 transition"
                    >
                      Set
                    </button>
                  </div>
                </div>

                {sleepTimerRemaining !== null && (
                  <button
                    onClick={() => {
                      setSleepTimerRemaining(null);
                      setShowSleepDropdown(false);
                    }}
                    className="mt-1 w-full text-center bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10 font-bold py-1.5 rounded-lg transition"
                  >
                    Turn Off Timer
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Playback speed toggle */}
        <div className="relative">
          <button
            id="speed-dropdown-btn"
            onClick={() => setShowSpeedDropdown(!showSpeedDropdown)}
            className="text-xs bg-[#2a2a2a] hover:bg-[#3a3a3a] border border-white/5 px-2 py-1 rounded text-gray-300 font-semibold transition cursor-pointer"
            title="Playback Speed"
          >
            {playbackRate}x
          </button>
          {showSpeedDropdown && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowSpeedDropdown(false)} />
              <div className="absolute bottom-10 right-0 bg-[#282828] border border-white/10 rounded shadow-2xl py-1 z-40 text-xs text-white">
                {speedOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      onPlaybackRateChange(opt);
                      setShowSpeedDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-1.5 hover:bg-white/10 ${
                      playbackRate === opt ? 'text-[#1db954] font-bold' : ''
                    }`}
                  >
                    {opt === 1 ? 'Normal (1x)' : `${opt}x`}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Mini Audio Visualizer embedded in Right rail */}
        <div className="w-16 h-8 overflow-hidden rounded opacity-85 hidden sm:block">
          <Visualizer
            analyser={analyser}
            isPlaying={isPlaying}
            genre={currentTrack?.genre || 'Pop'}
          />
        </div>

        {/* Syncing Lyrics Toggle */}
        <button
          id="player-lyrics-toggle"
          onClick={() => setIsLyricsOpen(!isLyricsOpen)}
          disabled={!currentTrack}
          className={`p-1.5 hover:bg-white/5 rounded-full transition disabled:opacity-30 cursor-pointer ${
            isLyricsOpen ? 'text-[#1db954]' : 'text-gray-400 hover:text-white'
          }`}
          title="Synced Lyrics"
        >
          <Mic2 className="w-4 h-4" />
        </button>

        {/* Queue panel toggle */}
        <button
          id="player-queue-toggle"
          onClick={() => setIsQueueOpen(!isQueueOpen)}
          className={`p-1.5 hover:bg-white/5 rounded-full transition cursor-pointer ${
            isQueueOpen ? 'text-[#1db954]' : 'text-gray-400 hover:text-white'
          }`}
          title="Play Queue"
        >
          <ListMusic className="w-4 h-4" />
        </button>

        {/* Volume Level Controls */}
        <div id="volume-control-box" className="flex items-center gap-2 group max-w-[110px] flex-1">
          <button
            id="player-mute-toggle"
            onClick={onToggleMute}
            className="text-gray-400 hover:text-white p-1 rounded-full transition cursor-pointer"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-red-400" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <input
            id="volume-slider"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeSlider}
            className="w-full accent-[#1DB954] bg-[#333] h-1 rounded-full cursor-pointer hover:accent-[#1DB954]/80"
          />
        </div>
      </div>
    </div>
  );
}
