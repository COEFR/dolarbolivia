import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { HelpCircle, Keyboard, Smartphone } from 'lucide-react';

export const ControlsGuideModal: React.FC = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex items-center gap-1 text-xs text-amber-300 hover:text-amber-200 underline cursor-pointer">
          <HelpCircle size={14} /> ¿Cómo jugar?
        </button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-2 border-yellow-500 text-white font-mono max-w-md">
        <DialogHeader>
          <DialogTitle className="text-yellow-400 text-xl font-bold text-center">
            🎮 CONTROLES DE MARIO BROS
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 my-2 text-sm">
          <div className="border border-slate-700 p-3 rounded bg-slate-800/80">
            <h4 className="flex items-center gap-2 text-yellow-300 font-bold mb-2">
              <Keyboard size={18} /> Teclado (PC)
            </h4>
            <ul className="space-y-1 text-slate-300">
              <li><strong className="text-white">Flechas ← / → o A / D:</strong> Moverse a los lados</li>
              <li><strong className="text-white">Espacio / Flecha ↑ / W:</strong> Saltar</li>
              <li><strong className="text-white">Tecla Z / Shift:</strong> Correr / Lanzar Bola de Fuego</li>
              <li><strong className="text-white">P / Esc:</strong> Pausar juego</li>
            </ul>
          </div>

          <div className="border border-slate-700 p-3 rounded bg-slate-800/80">
            <h4 className="flex items-center gap-2 text-green-400 font-bold mb-2">
              <Smartphone size={18} /> Pantalla Táctil (Móvil)
            </h4>
            <p className="text-slate-300">
              Utiliza el D-Pad virtual en pantalla para moverte, el botón <strong>A</strong> para saltar y el botón <strong>B</strong> para acelerar o disparar.
            </p>
          </div>

          <div className="bg-yellow-950/60 border border-yellow-600 p-3 rounded text-yellow-200 text-xs">
            💡 <strong>Consejo:</strong> Golpea los bloques <span className="bg-amber-500 text-black px-1 rounded font-bold">[?]</span> para obtener champiñones mágicos, flores de fuego y estrellas.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};