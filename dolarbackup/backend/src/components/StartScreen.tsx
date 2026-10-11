import React from 'react';
import { ControlsGuideModal } from './ControlsGuideModal';
import { Play, Sparkles, Wrench } from 'lucide-react';

interface StartScreenProps {
  onStartGame: (world: '1-1' | '1-2') => void;
  onOpenEditor: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStartGame, onOpenEditor }) => {
  return (
    <div className="w-full max-w-4xl bg-slate-950 border-4 border-yellow-500 rounded-xl p-8 text-center text-white font-mono flex flex-col items-center justify-center min-h-[480px] shadow-2xl relative overflow-hidden">
      {/* Retro Title Header */}
      <div className="mb-8 select-none">
        <h1 className="text-4xl md:text-6xl font-black text-red-600 drop-shadow-[0_5px_0_rgba(255,255,0,1)] tracking-wider mb-2 animate-bounce">
          SUPER MARIO
        </h1>
        <div className="text-yellow-400 text-lg md:text-2xl font-bold tracking-widest border-y-2 border-yellow-500 py-1 inline-block">
          EDICIÓN WEB BROS
        </div>
      </div>

      {/* Select Level / Start Mode */}
      <div className="flex flex-col gap-4 w-full max-w-xs z-10">
        <button
          onClick={() => onStartGame('1-1')}
          className="w-full bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-bold py-3 px-6 rounded-lg border-2 border-yellow-300 shadow-lg flex items-center justify-center gap-3 text-lg transition-transform hover:scale-105"
        >
          <Play size={20} className="fill-current" /> JUGAR MUNDO 1-1
        </button>

        <button
          onClick={() => onStartGame('1-2')}
          className="w-full bg-blue-700 hover:bg-blue-600 active:bg-blue-800 text-white font-bold py-3 px-6 rounded-lg border-2 border-blue-300 shadow-lg flex items-center justify-center gap-3 text-sm transition-transform hover:scale-105"
        >
          <Sparkles size={18} /> MUNDO 1-2 (Subterráneo)
        </button>

        <button
          onClick={onOpenEditor}
          className="w-full bg-purple-700 hover:bg-purple-600 active:bg-purple-800 text-white font-bold py-3 px-6 rounded-lg border-2 border-purple-300 shadow-lg flex items-center justify-center gap-3 text-sm transition-transform hover:scale-105"
        >
          <Wrench size={18} /> CREAR TU PROPIO NIVEL
        </button>
      </div>

      {/* Guide link */}
      <div className="mt-8 z-10">
        <ControlsGuideModal />
      </div>

      {/* Footer copyright style */}
      <div className="mt-6 text-xs text-slate-500">
        © {new Date().getFullYear()} Dyad Games • Creado con React & Canvas API
      </div>
    </div>
  );
};