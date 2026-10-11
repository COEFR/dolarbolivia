import React from 'react';
import { Volume2, VolumeX, Pause, Play, RotateCcw } from 'lucide-react';
import { GameStats } from '@/types/mario';

interface GameHUDProps {
  stats: GameStats;
  isMuted: boolean;
  isPaused: boolean;
  onToggleMute: () => void;
  onTogglePause: () => void;
  onReset: () => void;
  onOpenEditor: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  stats,
  isMuted,
  isPaused,
  onToggleMute,
  onTogglePause,
  onReset,
  onOpenEditor,
}) => {
  return (
    <div className="w-full bg-black border-b-4 border-yellow-500 text-white font-mono px-4 py-2 flex flex-wrap justify-between items-center shadow-lg select-none">
      <div className="flex gap-6 items-center text-sm md:text-base tracking-widest">
        <div>
          <div className="text-red-500 font-bold text-xs">MARIO</div>
          <div className="text-yellow-300 font-bold">{String(stats.score).padStart(6, '0')}</div>
        </div>
        <div>
          <div className="text-yellow-400 font-bold text-xs">MONEDAS</div>
          <div className="text-amber-200 font-bold">🪙 x{String(stats.coins).padStart(2, '0')}</div>
        </div>
        <div>
          <div className="text-blue-400 font-bold text-xs">MUNDO</div>
          <div className="font-bold text-white">{stats.world}</div>
        </div>
        <div>
          <div className="text-green-400 font-bold text-xs">TIEMPO</div>
          <div className="font-bold text-white">{stats.time}</div>
        </div>
        <div>
          <div className="text-rose-400 font-bold text-xs">VIDAS</div>
          <div className="font-bold text-rose-300">❤️ x{stats.lives}</div>
        </div>
      </div>

      <div className="flex gap-2 items-center mt-2 sm:mt-0">
        <button
          onClick={onOpenEditor}
          className="bg-purple-700 hover:bg-purple-600 active:scale-95 text-xs font-bold text-white px-3 py-1.5 rounded border border-purple-400 transition-all flex items-center gap-1"
          title="Crear Nivel"
        >
          🛠️ Editor
        </button>

        <button
          onClick={onTogglePause}
          className="bg-zinc-800 hover:bg-zinc-700 p-2 rounded text-yellow-400 border border-zinc-600 transition-all"
          title={isPaused ? 'Reanudar' : 'Pausar'}
        >
          {isPaused ? <Play size={18} /> : <Pause size={18} />}
        </button>

        <button
          onClick={onReset}
          className="bg-zinc-800 hover:bg-zinc-700 p-2 rounded text-red-400 border border-zinc-600 transition-all"
          title="Reiniciar Nivel"
        >
          <RotateCcw size={18} />
        </button>

        <button
          onClick={onToggleMute}
          className="bg-zinc-800 hover:bg-zinc-700 p-2 rounded text-green-400 border border-zinc-600 transition-all"
          title={isMuted ? 'Activar Sonido' : 'Silenciar'}
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </div>
    </div>
  );
};