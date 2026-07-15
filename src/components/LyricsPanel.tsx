import { useEffect, useRef } from 'react';
import { Track } from '../types';
import { Music } from 'lucide-react';

interface LyricsPanelProps {
  track: Track | null;
  currentTime: number;
}

export default function LyricsPanel({ track, currentTime }: LyricsPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Find the active lyric index based on the current playback progress
  const activeIndex = track
    ? track.lyrics.findIndex((line, index) => {
        const nextLine = track.lyrics[index + 1];
        return currentTime >= line.time && (!nextLine || currentTime < nextLine.time);
      })
    : -1;

  useEffect(() => {
    if (activeIndex === -1 || !containerRef.current) return;

    const activeElement = containerRef.current.querySelector(`[data-lyric-idx="${activeIndex}"]`);
    if (activeElement) {
      activeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeIndex]);

  if (!track) {
    return (
      <div id="lyrics-empty" className="h-full flex flex-col items-center justify-center text-center p-8 bg-neutral-900/50">
        <Music className="w-12 h-12 text-gray-600 mb-4 animate-bounce" />
        <h3 className="text-lg font-bold text-gray-400">No Song Selected</h3>
        <p className="text-sm text-gray-500 mt-1">Play a track to see synced lyrics in real-time.</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      id="lyrics-scroller"
      className="h-full w-full overflow-y-auto px-6 py-24 flex flex-col gap-8 custom-scrollbar bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-900"
    >
      <div className="max-w-xl mx-auto w-full flex flex-col gap-6 select-none pb-24">
        {/* Track info header */}
        <div id="lyrics-track-header" className="flex items-center gap-4 mb-8 pb-6 border-b border-white/5">
          <img
            src={track.coverUrl}
            alt={track.title}
            className="w-16 h-16 rounded-md object-cover shadow-2xl"
            referrerPolicy="no-referrer"
          />
          <div>
            <h2 className="text-2xl font-black text-white leading-tight">{track.title}</h2>
            <p className="text-sm font-semibold text-[#1db954]">{track.artist}</p>
          </div>
        </div>

        {/* Syncing Lyrics Blocks */}
        {track.lyrics.length === 0 ? (
          <div className="text-center text-gray-500 py-12 italic text-lg" id="no-lyrics-msg">
            Instrumental track. No lyrics available.
          </div>
        ) : (
          track.lyrics.map((line, idx) => {
            const isActive = idx === activeIndex;
            const isPassed = idx < activeIndex;

            return (
              <p
                key={idx}
                data-lyric-idx={idx}
                className={`text-2xl md:text-3xl font-black tracking-tight transition-all duration-300 origin-left ${
                  isActive
                    ? 'text-white scale-105 filter drop-shadow-[0_4px_12px_rgba(255,255,255,0.15)] opacity-100'
                    : isPassed
                    ? 'text-white/40 hover:text-white/70 opacity-60'
                    : 'text-white/20 hover:text-white/55'
                } cursor-pointer hover:scale-[1.01]`}
                onClick={() => {
                  // Standard clicking of lyrics allows jumping to that audio part!
                  const audio = document.getElementById('main-audio-element') as HTMLAudioElement;
                  if (audio) {
                    audio.currentTime = line.time;
                  }
                }}
              >
                {line.text}
              </p>
            );
          })
        )}
      </div>
    </div>
  );
}
