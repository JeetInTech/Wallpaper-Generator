
import React, { useEffect } from 'react';
import { Wallpaper, AspectRatio } from '../types';
import { Icons } from '../constants';

interface WallpaperModalProps {
  wallpaper: Wallpaper;
  aspectRatio: AspectRatio;
  onClose: () => void;
  onRemix: (wallpaper: Wallpaper) => void;
  onToggleFavorite: (wallpaper: Wallpaper) => void;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext: boolean;
  hasPrev: boolean;
  isFavorite: boolean;
}

export const WallpaperModal: React.FC<WallpaperModalProps> = ({ 
  wallpaper, 
  onClose, 
  onRemix,
  onToggleFavorite,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
  isFavorite,
  aspectRatio 
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && onNext && hasNext) onNext();
      if (e.key === 'ArrowLeft' && onPrev && hasPrev) onPrev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext, onPrev, hasNext, hasPrev, onClose]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = wallpaper.url;
    link.download = `vibepaper-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getAspectRatioStyle = () => {
    const [w, h] = aspectRatio.split(':').map(Number);
    return { aspectRatio: `${w} / ${h}` };
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-zinc-950/98 backdrop-blur-md animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex justify-between items-center p-4">
        <div className="flex flex-col">
          <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Preview</span>
          <span className="text-sm font-medium text-white truncate max-w-[200px]">{wallpaper.prompt}</span>
        </div>
        <div className="flex items-center gap-2">
           <button 
            onClick={() => onToggleFavorite(wallpaper)}
            className={`p-2.5 rounded-full transition-all ${isFavorite ? 'bg-red-500/20 text-red-500' : 'bg-zinc-800/50 text-zinc-400'}`}
          >
            <Icons.Heart filled={isFavorite} />
          </button>
          <button 
            onClick={onClose}
            className="p-2.5 bg-zinc-800/50 rounded-full text-zinc-400 active:scale-90 transition-transform"
          >
            <Icons.X />
          </button>
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 relative flex items-center justify-center p-4 overflow-hidden">
        {/* Navigation Arrows (Sides) */}
        {hasPrev && (
          <button 
            onClick={(e) => { e.stopPropagation(); onPrev?.(); }}
            className="absolute left-4 z-10 p-3 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-sm transition-all active:scale-90"
          >
            <Icons.ChevronLeft />
          </button>
        )}
        
        {hasNext && (
          <button 
            onClick={(e) => { e.stopPropagation(); onNext?.(); }}
            className="absolute right-4 z-10 p-3 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-sm transition-all active:scale-90"
          >
            <Icons.ChevronRight />
          </button>
        )}

        <img 
          src={wallpaper.url} 
          alt={wallpaper.prompt}
          className="max-h-full max-w-full shadow-2xl rounded-2xl object-contain ring-1 ring-white/10 transition-all duration-300"
          style={getAspectRatioStyle()}
        />
      </div>

      {/* Actions Footer */}
      <div className="p-6 grid grid-cols-2 gap-4 bg-zinc-950/50">
        <button
          onClick={() => {
            onRemix(wallpaper);
            onClose();
          }}
          className="flex items-center justify-center gap-2 py-4 bg-zinc-800 text-white rounded-2xl font-semibold active:scale-95 transition-transform"
        >
          <Icons.Refresh />
          <span>Remix</span>
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center justify-center gap-2 py-4 bg-white text-zinc-950 rounded-2xl font-semibold active:scale-95 transition-transform shadow-xl shadow-white/10"
        >
          <Icons.Download />
          <span>Download</span>
        </button>
      </div>
    </div>
  );
};
