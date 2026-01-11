
import React, { useState, useEffect, useRef } from 'react';
import { GeminiService } from './services/geminiService';
import { Wallpaper, AspectRatio, Quality, DeviceType } from './types';
import { Icons } from './constants';
import { WallpaperModal } from './components/WallpaperModal';
import { SettingsSheet } from './components/SettingsSheet';

const FAV_KEY = 'vibepaper-favorites-v1';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<Wallpaper[]>([]);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("9:16");
  const [quality, setQuality] = useState<Quality>("High");
  const [deviceType, setDeviceType] = useState<DeviceType>("Mobile");
  const [favorites, setFavorites] = useState<Wallpaper[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [referenceWallpaper, setReferenceWallpaper] = useState<Wallpaper | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resultsEndRef = useRef<HTMLDivElement>(null);

  // Load favorites
  useEffect(() => {
    const saved = localStorage.getItem(FAV_KEY);
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse favorites", e);
      }
    }
  }, []);

  // Save favorites
  useEffect(() => {
    localStorage.setItem(FAV_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (wp: Wallpaper) => {
    setFavorites(prev => {
      const isFav = prev.find(f => f.id === wp.id);
      if (isFav) {
        return prev.filter(f => f.id !== wp.id);
      } else {
        return [...prev, { ...wp, isFavorite: true }];
      }
    });
  };

  const generateVariations = async (customPrompt?: string, ref?: Wallpaper | null) => {
    const activePrompt = customPrompt || prompt;
    if (!activePrompt.trim()) return;

    setError(null);
    setIsGenerating(true);
    setResults([]);
    setShowFavorites(false);
    
    try {
      const generationPromises = Array(4).fill(null).map(async (_, idx) => {
        const variationSeed = !ref ? ` variant ${idx + 1}` : '';
        
        let currentAR: AspectRatio = aspectRatio;
        if (deviceType === 'Mobile') currentAR = '9:16';
        if (deviceType === 'Desktop') currentAR = '16:9';
        if (deviceType === 'Mixed') {
          currentAR = idx < 2 ? '9:16' : '16:9';
        }

        const base64 = await GeminiService.generateWallpaper(
          activePrompt + variationSeed, 
          { aspectRatio: currentAR, quality },
          ref?.base64
        );

        return {
          id: `${Date.now()}-${idx}`,
          url: `data:image/png;base64,${base64}`,
          prompt: activePrompt,
          base64: base64,
        };
      });

      const newWallpapers = await Promise.all(generationPromises);
      setResults(newWallpapers);
      
      setTimeout(() => {
        resultsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      console.error(err);
      setError("Something went wrong. Please check your connection and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRemix = (wallpaper: Wallpaper) => {
    setReferenceWallpaper(wallpaper);
    setPrompt(wallpaper.prompt);
    generateVariations(wallpaper.prompt, wallpaper);
  };

  const currentDisplayList = showFavorites ? favorites : results;
  const selectedWallpaper = selectedIndex !== null ? currentDisplayList[selectedIndex] : null;

  return (
    <div className="min-h-screen flex flex-col max-w-xl mx-auto bg-zinc-950 pb-32">
      <header className="sticky top-0 z-40 glass p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Icons.Sparkles />
          </div>
          <div onClick={() => setShowFavorites(false)} className="cursor-pointer">
            <h1 className="text-xl font-outfit font-extrabold tracking-tight">VibePaper</h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
              {showFavorites ? 'My Collection' : 'Free AI Generation'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowFavorites(!showFavorites)}
            className={`p-2.5 rounded-xl transition-colors ${showFavorites ? 'bg-red-500/20 text-red-500' : 'bg-zinc-800/50 text-zinc-400'}`}
          >
            <Icons.Heart filled={showFavorites} />
          </button>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2.5 bg-zinc-800/50 rounded-xl text-zinc-400 hover:text-white transition-colors"
          >
            <Icons.Settings />
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 space-y-6">
        {!showFavorites && (
          <section className="space-y-4">
            <div className="relative group">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your desired vibe..."
                className="w-full h-32 bg-zinc-900/50 rounded-2xl p-4 text-lg font-medium border border-zinc-800 focus:border-white/20 focus:outline-none focus:ring-4 focus:ring-white/5 transition-all resize-none placeholder:text-zinc-600"
              />
              
              {referenceWallpaper && (
                <div className="absolute top-2 right-2 flex items-center gap-2 bg-zinc-800/90 rounded-lg p-1 pr-3 border border-zinc-700 animate-in fade-in zoom-in duration-200">
                  <img src={referenceWallpaper.url} className="w-8 h-8 rounded object-cover" alt="ref" />
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">Remix Mode</span>
                  <button onClick={() => setReferenceWallpaper(null)} className="ml-1 text-zinc-500 hover:text-white">
                    <Icons.X />
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">
                {error}
              </div>
            )}

            <button
              onClick={() => generateVariations()}
              disabled={isGenerating || !prompt.trim()}
              className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-xl ${
                isGenerating || !prompt.trim()
                  ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                  : 'bg-white text-zinc-950 active:scale-[0.98] shadow-white/5'
              }`}
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-zinc-400 border-t-zinc-950 rounded-full animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Icons.Sparkles />
                  <span>Generate Wallpapers</span>
                </>
              )}
            </button>
          </section>
        )}

        <section className="space-y-4">
          {showFavorites && favorites.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-500 space-y-4">
              <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center">
                 <Icons.Heart />
              </div>
              <p className="font-medium">No favorites yet</p>
              <button 
                onClick={() => setShowFavorites(false)}
                className="text-blue-500 text-sm font-bold"
              >
                Go create some vibes
              </button>
            </div>
          )}

          {isGenerating && results.length === 0 && (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div 
                  key={i} 
                  className="shimmer rounded-2xl border border-zinc-800/50" 
                  style={{ aspectRatio: deviceType === 'Desktop' ? '16 / 9' : '9 / 16' }}
                />
              ))}
            </div>
          )}

          {currentDisplayList.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {currentDisplayList.map((wp, idx) => {
                let gridAR = aspectRatio.replace(':', ' / ');
                if (deviceType === 'Mobile') gridAR = '9 / 16';
                if (deviceType === 'Desktop') gridAR = '16 / 9';
                
                return (
                  <div 
                    key={wp.id}
                    onClick={() => setSelectedIndex(idx)}
                    className="relative rounded-2xl overflow-hidden group border border-white/5 active:scale-95 transition-all cursor-pointer shadow-lg shadow-black/40"
                    style={{ aspectRatio: gridAR }}
                  >
                    <img 
                      src={wp.url} 
                      alt={wp.prompt} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className={`p-1.5 rounded-full ${favorites.find(f => f.id === wp.id) ? 'bg-red-500 text-white' : 'bg-black/50 text-white'}`}>
                        <Icons.Heart filled={!!favorites.find(f => f.id === wp.id)} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
        
        <div ref={resultsEndRef} />
      </main>

      {selectedWallpaper && selectedIndex !== null && (
        <WallpaperModal 
          wallpaper={selectedWallpaper}
          aspectRatio={deviceType === 'Desktop' ? '16:9' : (deviceType === 'Mobile' ? '9:16' : aspectRatio)}
          isFavorite={!!favorites.find(f => f.id === selectedWallpaper.id)}
          onClose={() => setSelectedIndex(null)}
          onRemix={handleRemix}
          onToggleFavorite={toggleFavorite}
          onNext={() => setSelectedIndex(prev => prev !== null ? Math.min(prev + 1, currentDisplayList.length - 1) : null)}
          onPrev={() => setSelectedIndex(prev => prev !== null ? Math.max(prev - 1, 0) : null)}
          hasNext={selectedIndex < currentDisplayList.length - 1}
          hasPrev={selectedIndex > 0}
        />
      )}

      <SettingsSheet 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        aspectRatio={aspectRatio}
        quality={quality}
        deviceType={deviceType}
        onSetAspectRatio={setAspectRatio}
        onSetQuality={setQuality}
        onSetDeviceType={setDeviceType}
      />
    </div>
  );
};

export default App;
