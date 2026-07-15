import { useState, FormEvent } from 'react';
import { Home, Search, Library, Plus, Heart, Download, Music, Wifi, WifiOff, Trash2 } from 'lucide-react';
import { Playlist } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: 'home' | 'search' | 'playlist' | 'liked' | 'downloads') => void;
  playlists: Playlist[];
  activePlaylistId: string | null;
  setActivePlaylistId: (id: string | null) => void;
  onCreatePlaylist: (name: string, description: string) => void;
  onDeletePlaylist: (id: string) => void;
  isOfflineMode: boolean;
  setIsOfflineMode: (offline: boolean) => void;
  likedSongsCount: number;
  downloadedSongsCount: number;
}

export default function Sidebar({
  currentView,
  setCurrentView,
  playlists,
  activePlaylistId,
  setActivePlaylistId,
  onCreatePlaylist,
  onDeletePlaylist,
  isOfflineMode,
  setIsOfflineMode,
  likedSongsCount,
  downloadedSongsCount,
}: SidebarProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [playlistDesc, setPlaylistDesc] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!playlistName.trim()) return;
    onCreatePlaylist(playlistName, playlistDesc);
    setPlaylistName('');
    setPlaylistDesc('');
    setShowCreateModal(false);
  };

  return (
    <div id="sidebar" className="w-64 bg-[#000000] h-full flex flex-col p-6 space-y-8 border-r border-[#1a1a1a] select-none">
      {/* Brand Section */}
      <div id="sidebar-logo-container" className="flex items-center space-x-2 px-2 flex-shrink-0">
        <div className="w-8 h-8 bg-[#1DB954] rounded-full flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-black fill-current" id="spotify-svg-logo">
            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.563.387-.857.207-2.377-1.454-5.37-1.783-8.893-.982-.336.076-.67-.135-.746-.472-.076-.336.135-.67.472-.746 3.855-.88 7.15-.494 9.816 1.14.295.18.387.563.208.857zm1.225-2.72c-.227.367-.707.487-1.074.26-2.72-1.672-6.87-2.157-10.08-1.182-.413.125-.847-.11-972-.52-.125-.412.11-.847.52-.972 3.67-1.114 8.24-.57 11.37 1.353.367.226.487.707.26 1.074zm.106-2.827C14.393 8.74 8.588 8.55 5.222 9.57c-.516.156-1.054-.137-1.21-.653-.156-.516.137-1.054.653-1.21 3.86-1.172 10.278-.95 14.33 1.456.465.276.614.877.338 1.34-.276.465-.877.614-1.34.338z" />
          </svg>
        </div>
        <span className="text-2xl font-black tracking-tighter text-white" id="sidebar-brand-name">NEOFLOW</span>
      </div>

      {/* Main Navigation */}
      <nav id="nav-section" className="space-y-4 px-2">
        <button
          id="nav-home-btn"
          onClick={() => {
            setCurrentView('home');
            setActivePlaylistId(null);
          }}
          className={`flex items-center gap-4 text-base font-bold transition duration-200 cursor-pointer w-full text-left ${
            currentView === 'home' && !activePlaylistId ? 'text-[#1DB954]' : 'opacity-60 hover:opacity-100'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </button>
        <button
          id="nav-search-btn"
          onClick={() => {
            setCurrentView('search');
            setActivePlaylistId(null);
          }}
          className={`flex items-center gap-4 text-base font-bold transition duration-200 cursor-pointer w-full text-left ${
            currentView === 'search' ? 'text-[#1DB954]' : 'opacity-60 hover:opacity-100'
          }`}
        >
          <Search className="w-5 h-5" />
          <span>Search</span>
        </button>
      </nav>

      {/* Library Section */}
      <div id="library-section" className="flex-1 flex flex-col min-h-0 space-y-4 pt-4">
        <div id="library-header" className="flex items-center justify-between px-2">
          <button
            onClick={() => setCurrentView('home')}
            className={`flex items-center gap-2 font-bold text-sm transition ${
              currentView === 'playlist' || currentView === 'liked' || currentView === 'downloads' ? 'text-[#1DB954]' : 'opacity-60 hover:opacity-100'
            }`}
            id="library-title-btn"
          >
            <Library className="w-5 h-5" />
            <span>Your Library</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="opacity-60 hover:opacity-100 hover:bg-white/10 p-1 rounded-full transition cursor-pointer"
            title="Create Playlist"
            id="create-playlist-btn"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Liked & Downloaded Tiles */}
        <div id="special-playlists-list" className="flex flex-col gap-2 px-1">
          <button
            id="sidebar-liked-btn"
            onClick={() => {
              setCurrentView('liked');
              setActivePlaylistId(null);
            }}
            className={`flex items-center gap-3 p-2 rounded-xl transition duration-200 text-left w-full cursor-pointer border ${
              currentView === 'liked' ? 'bg-[#181818] border-[#1DB954]/40 text-white' : 'hover:bg-white/5 border-transparent text-gray-300'
            }`}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-400 rounded-lg flex items-center justify-center relative shadow-md">
              <Heart className="w-5 h-5 text-white fill-current" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black truncate text-white">Liked Songs</p>
              <p className="text-xs text-gray-400 truncate">Playlist • {likedSongsCount} songs</p>
            </div>
          </button>

          <button
            id="sidebar-downloads-btn"
            onClick={() => {
              setCurrentView('downloads');
              setActivePlaylistId(null);
            }}
            className={`flex items-center gap-3 p-2 rounded-xl transition duration-200 text-left w-full cursor-pointer border ${
              currentView === 'downloads' ? 'bg-[#181818] border-[#1DB954]/40 text-white' : 'hover:bg-white/5 border-transparent text-gray-300'
            }`}
          >
            <div className="w-10 h-10 bg-[#052e16] rounded-lg flex items-center justify-center relative shadow-md border border-emerald-950">
              <Download className="w-5 h-5 text-[#1DB954]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black truncate text-white">Offline Library</p>
              <p className="text-xs text-gray-400 truncate">
                Downloaded • {downloadedSongsCount} songs
              </p>
            </div>
          </button>
        </div>

        <div className="h-[1px] bg-[#1a1a1a] mx-2" />

        {/* Playlists List */}
        <div id="custom-playlists-scroll" className="flex-1 overflow-y-auto px-1 space-y-1 custom-scrollbar">
          {playlists.length === 0 ? (
            <div className="p-4 text-center text-xs text-gray-500" id="empty-playlists-msg">
              Create your first playlist to get started.
            </div>
          ) : (
            playlists.map((pl) => {
              const isActive = activePlaylistId === pl.id && currentView === 'playlist';
              return (
                <div
                  key={pl.id}
                  id={`playlist-item-${pl.id}`}
                  className={`group flex items-center justify-between p-2 rounded-xl transition duration-200 text-left w-full cursor-pointer border ${
                    isActive ? 'bg-[#181818] border-[#1DB954]/30' : 'hover:bg-white/5 border-transparent'
                  }`}
                  onClick={() => {
                    setCurrentView('playlist');
                    setActivePlaylistId(pl.id);
                  }}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center overflow-hidden shadow-sm">
                      {pl.coverUrl ? (
                        <img src={pl.coverUrl} alt={pl.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <Music className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-black truncate ${isActive ? 'text-[#1DB954]' : 'text-white'}`}>
                        {pl.name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {pl.isCustom ? 'Playlist' : 'System'} • {pl.trackIds.length} songs
                      </p>
                    </div>
                  </div>
                  {pl.isCustom && (
                    <button
                      id={`delete-playlist-${pl.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePlaylist(pl.id);
                        if (activePlaylistId === pl.id) {
                          setCurrentView('home');
                          setActivePlaylistId(null);
                        }
                      }}
                      className="text-gray-500 hover:text-red-400 p-1.5 rounded-full transition opacity-0 group-hover:opacity-100 hover:bg-white/5 cursor-pointer"
                      title="Delete Playlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Connection Mode Module */}
      <div id="connection-status-panel" className="mt-auto pt-4 space-y-4 flex-shrink-0">
        <div className="p-4 bg-[#121212] rounded-xl border border-[#282828] space-y-2">
          <p className="text-xs font-black uppercase tracking-widest text-[#1DB954] mb-1">Offline Status</p>
          <p className="text-sm font-medium">{downloadedSongsCount} Tracks Synced</p>
          <div className="w-full bg-[#333] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#1DB954] h-full" style={{ width: `${Math.min(100, Math.max(12, (downloadedSongsCount / 8) * 100))}%` }}></div>
          </div>
        </div>

        <div id="status-toggle-container" className="flex items-center justify-between px-2">
          <span className="text-sm font-bold text-white">Offline Mode</span>
          <button
            id="offline-toggle-button"
            onClick={() => setIsOfflineMode(!isOfflineMode)}
            className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
              isOfflineMode ? 'bg-[#1DB954]' : 'bg-neutral-600'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-lg transition duration-200 ease-in-out mt-[3px] ${
                isOfflineMode ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Create Playlist Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div
            id="create-playlist-modal-backdrop"
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              id="create-playlist-modal-content"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#282828] rounded-lg p-6 max-w-sm w-full border border-white/10 shadow-2xl"
            >
              <h3 className="text-lg font-bold text-white mb-4" id="modal-title">Create Playlist</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="p-name" className="block text-xs font-medium text-gray-400 mb-1">
                    Playlist Name
                  </label>
                  <input
                    id="p-name"
                    type="text"
                    required
                    value={playlistName}
                    onChange={(e) => setPlaylistName(e.target.value)}
                    placeholder="My Awesome Playlist"
                    className="w-full bg-[#3e3e3e] border border-transparent focus:border-white/20 rounded-md py-2 px-3 text-sm text-white placeholder-gray-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="p-desc" className="block text-xs font-medium text-gray-400 mb-1">
                    Description
                  </label>
                  <textarea
                    id="p-desc"
                    value={playlistDesc}
                    onChange={(e) => setPlaylistDesc(e.target.value)}
                    placeholder="Give your playlist a description."
                    rows={2}
                    className="w-full bg-[#3e3e3e] border border-transparent focus:border-white/20 rounded-md py-2 px-3 text-sm text-white placeholder-gray-500 focus:outline-none resize-none"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    id="cancel-modal-btn"
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-sm text-white font-medium hover:underline cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    id="submit-modal-btn"
                    type="submit"
                    className="px-5 py-2 bg-[#1db954] text-black font-bold rounded-full hover:scale-105 transition active:scale-95 text-sm cursor-pointer"
                  >
                    Create
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
