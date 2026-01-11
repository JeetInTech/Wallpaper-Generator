
import React from 'react';
import { ASPECT_RATIOS, QUALITY_OPTIONS, DEVICE_OPTIONS, Icons } from '../constants';
import { AspectRatio, Quality, DeviceType } from '../types';

interface SettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  aspectRatio: AspectRatio;
  quality: Quality;
  deviceType: DeviceType;
  onSetAspectRatio: (val: AspectRatio) => void;
  onSetQuality: (val: Quality) => void;
  onSetDeviceType: (val: DeviceType) => void;
}

export const SettingsSheet: React.FC<SettingsSheetProps> = ({
  isOpen,
  onClose,
  aspectRatio,
  quality,
  deviceType,
  onSetAspectRatio,
  onSetQuality,
  onSetDeviceType
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-zinc-900 rounded-t-3xl sm:rounded-3xl p-6 pb-12 sm:pb-6 animate-in slide-in-from-bottom duration-300 border-t border-zinc-800 shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="w-12 h-1.5 bg-zinc-800 rounded-full mx-auto mb-6 sm:hidden" />
        
        <h2 className="text-xl font-bold font-outfit mb-6">Generation Settings</h2>
        
        <div className="space-y-8">
          {/* Device Selection */}
          <div>
            <label className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-3 block">Target Device</label>
            <div className="grid grid-cols-3 gap-2">
              {DEVICE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => onSetDeviceType(opt.value as DeviceType)}
                  className={`flex flex-col items-center gap-2 py-3 rounded-xl border transition-all ${
                    deviceType === opt.value 
                      ? 'bg-white text-zinc-950 border-white shadow-lg' 
                      : 'bg-zinc-800/50 text-zinc-400 border-zinc-800'
                  }`}
                >
                  {opt.icon === 'Smartphone' && <Icons.Smartphone />}
                  {opt.icon === 'Monitor' && <Icons.Monitor />}
                  {opt.icon === 'Layers' && <Icons.Layers />}
                  <span className="text-xs font-bold">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio (Only show if not in fixed device mode) */}
          {deviceType === 'Mixed' && (
            <div>
              <label className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-3 block">Base Aspect Ratio</label>
              <div className="grid grid-cols-5 gap-2">
                {ASPECT_RATIOS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => onSetAspectRatio(opt.value)}
                    className={`py-2.5 rounded-lg text-xs font-bold transition-all border ${
                      aspectRatio === opt.value 
                        ? 'bg-blue-600 border-blue-500 text-white' 
                        : 'bg-zinc-800 text-zinc-400 border-zinc-800'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quality Options */}
          <div>
            <label className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-3 block">Visual Quality</label>
            <div className="space-y-2">
              {QUALITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => onSetQuality(opt.value as Quality)}
                  className={`w-full flex items-center justify-between px-4 py-4 rounded-xl text-sm font-medium transition-all border ${
                    quality === opt.value 
                      ? 'bg-zinc-100 border-white text-zinc-950 shadow-lg' 
                      : 'bg-zinc-800 border-zinc-800 text-zinc-400'
                  }`}
                >
                  <div className="text-left">
                    <div className="font-bold">{opt.label}</div>
                    <div className={`text-[10px] ${quality === opt.value ? 'text-zinc-600' : 'text-zinc-500'}`}>{opt.description}</div>
                  </div>
                  {quality === opt.value && <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-8 w-full py-4 bg-white text-zinc-950 font-bold rounded-2xl active:scale-95 transition-transform shadow-xl shadow-white/5"
        >
          Apply Changes
        </button>
      </div>
    </div>
  );
};
