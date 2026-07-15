import { useState } from 'react';
import { Play, Pause, Heart, Download, Trash2, Clock, Plus, Trash } from 'lucide-react';
import { Track, Playlist } from '../types';

interface TrackListProps {
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  isOfflineMode: boolean;
  downloadedTrackIds: string[];
  likedTrackIds: string[];
  downloadingTrackIds: string[];
  playlists: Playlist[];
  playlistIdContext?: string | null;
  onPlayTrack: (track: Track) => void;
  onToggleLike: (trackId: string) => void;
  onToggleDownload: (trackId: string) => void;
  onAddToPlaylist: (trackId: string, playlistId: string) => void;
  onRemoveFromPlaylist?: (trackId: string, playlistId: string) => void;
}

export default function TrackList({
  tracks,
  currentTrack,
  isPlaying,
  isOfflineMode,
  downloadedTrackIds,
  likedTrackIds,
  downloadingTrackIds,
  playlists,
  playlistIdContext,
  onPlayTrack,
  onToggleLike,
  onToggleDownload,
  onAddToPlaylist,
  onRemoveFromPlaylist,
}: TrackListProps) {
  const [activeMenuTrackId, setActiveMenuTrackId] = useState<string | null>(null);

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div id="tracks-table-container" className="w-full text-left overflow-x-auto">
      <table id="tracks-table" className="w-full min-w-[600px] border-collapse select-none">
        <thead>
          <tr className="border-b border-white/10 text-gray-400 text-xs uppercase tracking-wider font-semibold" id="tracks-table-header">
            <th className="py-3 px-4 text-center w-12">#</th>
            <th className="py-3 px-4">Title</th>
            <th className="py-3 px-4">Album</th>
            <th className="py-3 px-4 hidden md:table-cell">Genre</th>
            <th className="py-3 px-4 text-center w-24">Actions</th>
            <th className="py-3 px-4 text-right w-16">
              <Clock className="w-4 h-4 ml-auto" />
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {tracks.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-12 text-center text-gray-500 text-sm" id="tracks-table-empty">
                {isOfflineMode
                  ? "No downloaded tracks match your filter. Only downloaded tracks work offline!"
                  : "No songs found in this library."}
              </td>
            </tr>
          ) : (
            tracks.map((track, idx) => {
              const isSelected = currentTrack?.id === track.id;
              const isLiked = likedTrackIds.includes(track.id);
              const isDownloaded = downloadedTrackIds.includes(track.id);
              const isDownloading = downloadingTrackIds.includes(track.id);
              const isTrackOfflineDisabled = isOfflineMode && !isDownloaded;

              return (
                <tr
                  key={track.id}
                  id={`track-row-${track.id}`}
                  className={`group hover:bg-white/10 transition duration-150 align-middle ${
                    isSelected ? 'bg-white/5' : ''
                  } ${isTrackOfflineDisabled ? 'opacity-40 hover:bg-transparent pointer-events-none' : ''}`}
                >
                  {/* Play / Index Button */}
                  <td className="py-3 px-4 text-center align-middle relative">
                    <span className="text-gray-400 group-hover:hidden font-medium text-sm">
                      {isSelected && isPlaying ? (
                        <span className="flex justify-center items-end gap-0.5 h-3 w-3 mx-auto">
                          <span className="bg-[#1db954] w-[2.5px] animate-[bounce_0.8s_infinite_100ms] h-full" />
                          <span className="bg-[#1db954] w-[2.5px] animate-[bounce_0.8s_infinite_300ms] h-full" />
                          <span className="bg-[#1db954] w-[2.5px] animate-[bounce_0.8s_infinite_500ms] h-full" />
                        </span>
                      ) : (
                        idx + 1
                      )}
                    </span>
                    <button
                      id={`play-btn-${track.id}`}
                      onClick={() => !isTrackOfflineDisabled && onPlayTrack(track)}
                      className="hidden group-hover:flex items-center justify-center mx-auto text-white p-1 rounded-full hover:scale-105 transition cursor-pointer"
                    >
                      {isSelected && isPlaying ? (
                        <Pause className="w-4 h-4 text-[#1db954] fill-current" />
                      ) : (
                        <Play className="w-4 h-4 text-white fill-current" />
                      )}
                    </button>
                  </td>

                  {/* Title & Artist */}
                  <td className="py-3 px-4 align-middle">
                    <div className="flex items-center gap-3">
                      <img
                        src={track.coverUrl}
                        alt={track.title}
                        className="w-10 h-10 rounded-md object-cover shadow-sm bg-neutral-800"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <p
                          className={`text-sm font-semibold truncate ${
                            isSelected ? 'text-[#1db954]' : 'text-white'
                          }`}
                        >
                          {track.title}
                        </p>
                        <p className="text-xs text-gray-400 truncate hover:underline cursor-pointer">
                          {track.artist}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Album */}
                  <td className="py-3 px-4 align-middle">
                    <span className="text-gray-400 text-sm truncate block max-w-[200px]">
                      {track.album}
                    </span>
                  </td>

                  {/* Genre */}
                  <td className="py-3 px-4 align-middle hidden md:table-cell">
                    <span className="text-xs font-medium text-gray-500 bg-white/5 border border-white/5 rounded-full px-2.5 py-0.5">
                      {track.genre}
                    </span>
                  </td>

                  {/* Likes, Offline downloads & Playlist menus */}
                  <td className="py-3 px-4 align-middle">
                    <div className="flex items-center justify-center gap-3 relative">
                      {/* Like button */}
                      <button
                        id={`like-btn-${track.id}`}
                        onClick={() => onToggleLike(track.id)}
                        className={`transition cursor-pointer p-1 rounded-full hover:bg-white/10 ${
                          isLiked ? 'text-[#1db954]' : 'text-gray-400 hover:text-white'
                        }`}
                        title={isLiked ? 'Unlike' : 'Like'}
                      >
                        <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                      </button>

                      {/* Download button */}
                      <button
                        id={`download-btn-${track.id}`}
                        onClick={() => onToggleDownload(track.id)}
                        className={`transition cursor-pointer p-1 rounded-full hover:bg-white/10 relative ${
                          isDownloaded
                            ? 'text-emerald-500'
                            : isDownloading
                            ? 'text-amber-500 animate-pulse'
                            : 'text-gray-400 hover:text-white'
                        }`}
                        title={
                          isDownloaded
                            ? 'Remove offline download'
                            : isDownloading
                            ? 'Downloading...'
                            : 'Download for offline play'
                        }
                      >
                        {isDownloading ? (
                          <span className="relative flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 flex items-center justify-center text-[8px] font-black text-black">↓</span>
                          </span>
                        ) : isDownloaded ? (
                          <Download className="w-4 h-4 fill-current" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                      </button>

                      {/* Add to playlist popover anchor */}
                      <div className="relative">
                        <button
                          id={`playlist-add-popover-${track.id}`}
                          onClick={() =>
                            setActiveMenuTrackId(
                              activeMenuTrackId === track.id ? null : track.id
                            )
                          }
                          className="text-gray-400 hover:text-white hover:bg-white/10 p-1 rounded-full transition cursor-pointer"
                          title="Add to Playlist / Options"
                        >
                          <Plus className="w-4 h-4" />
                        </button>

                        {/* Popover Menu */}
                        {activeMenuTrackId === track.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setActiveMenuTrackId(null)}
                            />
                            <div
                              id={`playlist-dropdown-${track.id}`}
                              className="absolute right-0 mt-2 w-48 bg-[#282828] border border-white/10 rounded-md shadow-2xl py-1 z-20 text-xs text-white"
                            >
                              <div className="px-3 py-1.5 border-b border-white/5 text-gray-400 font-semibold uppercase tracking-wider text-[10px]">
                                Add to Playlist
                              </div>
                              {playlists.filter((pl) => pl.isCustom).length === 0 ? (
                                <div className="px-3 py-2 text-gray-500 italic">
                                  No custom playlists. Create one in sidebar!
                                </div>
                              ) : (
                                playlists
                                  .filter((pl) => pl.isCustom)
                                  .map((pl) => {
                                    const alreadyIn = pl.trackIds.includes(track.id);
                                    return (
                                      <button
                                        key={pl.id}
                                        id={`add-to-pl-${pl.id}`}
                                        disabled={alreadyIn}
                                        onClick={() => {
                                          onAddToPlaylist(track.id, pl.id);
                                          setActiveMenuTrackId(null);
                                        }}
                                        className={`w-full text-left px-3 py-2 transition hover:bg-white/10 flex items-center justify-between cursor-pointer ${
                                          alreadyIn ? 'opacity-50 text-gray-500 cursor-not-allowed' : ''
                                        }`}
                                      >
                                        <span className="truncate">{pl.name}</span>
                                        {alreadyIn && <span className="text-[10px] text-emerald-500">Added</span>}
                                      </button>
                                    );
                                  })
                              )}

                              {playlistIdContext && onRemoveFromPlaylist && (
                                <button
                                  id={`remove-from-context-pl`}
                                  onClick={() => {
                                    onRemoveFromPlaylist(track.id, playlistIdContext);
                                    setActiveMenuTrackId(null);
                                  }}
                                  className="w-full text-left px-3 py-2 transition hover:bg-red-500/10 text-red-400 font-semibold border-t border-white/5 flex items-center gap-1.5 cursor-pointer mt-1"
                                >
                                  <Trash className="w-3.5 h-3.5" />
                                  Remove from playlist
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Duration */}
                  <td className="py-3 px-4 text-right text-gray-400 text-sm align-middle font-mono">
                    {formatDuration(track.duration)}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
