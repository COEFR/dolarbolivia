import React from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, Zap } from 'lucide-react';

interface TouchControlsProps {
  onInputDown: (key: string) => void;
  onInputUp: (key: string) => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({ onInputDown, onInputUp }) => {
  const createTouchHandlers = (key: string) => ({
    onTouchStart: (e: React.TouchEvent) => {
      e.preventDefault();
      onInputDown(key);
    },
    onTouchEnd: (e: React.TouchEvent) => {
      e.preventDefault();
      onInputUp(key);
    },
    onMouseDown: (e: React.MouseEvent) => {
      e.preventDefault();
      onInputDown(key);
    },
    onMouseUp: (e: React.MouseEvent) => {
      e.preventDefault();
      onInputUp(key);
    },
    onMouseLeave: (e: React.MouseEvent) => {
      e.preventDefault();
      onInputUp(key);
    },
  });

  return (
    <div className="w-full max-w-4xl flex justify-between items-center px-4 py-2 select-none touch-none">
      {/* D-Pad Left/Right */}
      <div className="flex gap-3">
        <button
          {...createTouchHandlers('ArrowLeft')}
          className="w-16 h-16 bg-slate-800/80 hover:bg-slate-700 active:bg-red-600 text-white rounded-full flex items-center justify-center border-2 border-slate-500 shadow-lg active:scale-95 transition-all"
          aria-label="Mover Izquierda"
        >
          <ArrowLeft size={32} />
        </button>
        <button
          {...createTouchHandlers('ArrowRight')}
          className="w-16 h-16 bg-slate-800/80 hover:bg-slate-700 active:bg-red-600 text-white rounded-full flex items-center justify-center border-2 border-slate-500 shadow-lg active:scale-95 transition-all"
          aria-label="Mover Derecha"
        >
          <ArrowRight size={32} />
        </button>
      </div>

      {/* Action Buttons B & A */}
      <div className="flex gap-4 items-center">
        <button
          {...createTouchHandlers('KeyZ')}
          className="w-14 h-14 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-bold rounded-full flex flex-col items-center justify-center border-2 border-red-300 shadow-lg active:scale-95 transition-all text-xs"
          aria-label="Correr o Disparar"
        >
          <Zap size={20} />
          <span>B</span>
        </button>
        <button
          {...createTouchHandlers('Space')}
          className="w-16 h-16 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-white font-bold rounded-full flex flex-col items-center justify-center border-2 border-amber-200 shadow-lg active:scale-95 transition-all"
          aria-label="Saltar"
        >
          <ArrowUp size={28} />
          <span className="text-xs">A</span>
        </button>
      </div>
    </div>
  );
};