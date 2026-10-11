import React, { useState } from 'react';
import { LevelData, BlockType, EnemyType } from '@/types/mario';
import { Save, Play, Trash2, ArrowLeft } from 'lucide-react';
import { showSuccess } from '@/utils/toast';

interface LevelEditorProps {
  onPlayCustomLevel: (levelData: LevelData) => void;
  onBack: () => void;
}

export const LevelEditor: React.FC<LevelEditorProps> = ({ onPlayCustomLevel, onBack }) => {
  const [levelWidth, setLevelWidth] = useState<number>(60);
  const [selectedTool, setSelectedTool] = useState<'block' | 'enemy' | 'coin' | 'erase'>('block');
  const [selectedBlockType, setSelectedBlockType] = useState<BlockType>('ground');
  const [selectedEnemyType, setSelectedEnemyType] = useState<EnemyType>('goomba');
  
  // Grid state: 15 rows tall
  const [grid, setGrid] = useState<{ [key: string]: { type: 'block' | 'enemy' | 'coin'; subType: string } }>({});

  const handleTileClick = (x: number, y: number) => {
    const key = `${x}_${y}`;
    const newGrid = { ...grid };

    if (selectedTool === 'erase') {
      delete newGrid[key];
    } else if (selectedTool === 'block') {
      newGrid[key] = { type: 'block', subType: selectedBlockType };
    } else if (selectedTool === 'enemy') {
      newGrid[key] = { type: 'enemy', subType: selectedEnemyType };
    } else if (selectedTool === 'coin') {
      newGrid[key] = { type: 'coin', subType: 'coin' };
    }

    setGrid(newGrid);
  };

  const handleBuildLevel = () => {
    const customBlocks = [];
    const customEnemies = [];
    const customCoins = [];

    // Always create ground at base if empty
    for (const key in grid) {
      const [xStr, yStr] = key.split('_');
      const x = parseInt(xStr, 10);
      const y = parseInt(yStr, 10);
      const cell = grid[key];

      if (cell.type === 'block') {
        customBlocks.push({
          id: `custom_b_${x}_${y}`,
          x,
          y,
          type: cell.subType as BlockType,
          content: cell.subType === 'question' ? 'mushroom' : null,
        });
      } else if (cell.type === 'enemy') {
        customEnemies.push({
          type: cell.subType as EnemyType,
          x,
          y,
        });
      } else if (cell.type === 'coin') {
        customCoins.push({ x, y });
      }
    }

    // Default floor ground line if empty
    if (customBlocks.length === 0) {
      for (let x = 0; x < levelWidth; x++) {
        customBlocks.push({ id: `floor_1_${x}`, x, y: 13, type: 'ground' as BlockType });
        customBlocks.push({ id: `floor_2_${x}`, x, y: 14, type: 'ground' as BlockType });
      }
    }

    const customLevel: LevelData = {
      id: 'custom-1',
      name: 'Nivel Personalizado',
      theme: 'overworld',
      width: levelWidth,
      height: 15,
      blocks: customBlocks,
      enemies: customEnemies,
      coins: customCoins,
      flagX: levelWidth - 5,
      spawnX: 2,
      spawnY: 11,
    };

    showSuccess('¡Nivel creado con éxito! Iniciando juego...');
    onPlayCustomLevel(customLevel);
  };

  const rows = 15;

  return (
    <div className="w-full flex flex-col items-center bg-slate-900 text-white p-4 font-mono min-h-screen">
      {/* Editor Header */}
      <div className="w-full max-w-5xl flex justify-between items-center mb-4 border-b border-slate-700 pb-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded border border-slate-600 text-sm"
        >
          <ArrowLeft size={16} /> Volver
        </button>

        <h2 className="text-xl font-bold text-yellow-400">🛠️ EDITOR DE NIVELES MARIO</h2>

        <button
          onClick={handleBuildLevel}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold px-4 py-2 rounded shadow-lg transition-transform active:scale-95"
        >
          <Play size={18} /> ¡JUGAR NIVEL!
        </button>
      </div>

      {/* Tools Toolbar */}
      <div className="w-full max-w-5xl bg-slate-800 p-3 rounded-lg border border-slate-700 flex flex-wrap gap-4 items-center mb-4 text-xs">
        <div>
          <span className="text-slate-400 block mb-1">HERRAMIENTA:</span>
          <div className="flex gap-1">
            <button
              onClick={() => setSelectedTool('block')}
              className={`px-3 py-1.5 rounded font-bold border ${selectedTool === 'block' ? 'bg-amber-600 border-amber-300' : 'bg-slate-700 border-slate-600'}`}
            >
              Bloques
            </button>
            <button
              onClick={() => setSelectedTool('enemy')}
              className={`px-3 py-1.5 rounded font-bold border ${selectedTool === 'enemy' ? 'bg-red-600 border-red-300' : 'bg-slate-700 border-slate-600'}`}
            >
              Enemigos
            </button>
            <button
              onClick={() => setSelectedTool('coin')}
              className={`px-3 py-1.5 rounded font-bold border ${selectedTool === 'coin' ? 'bg-yellow-500 text-black border-yellow-200' : 'bg-slate-700 border-slate-600'}`}
            >
              Moneda 🪙
            </button>
            <button
              onClick={() => setSelectedTool('erase')}
              className={`px-3 py-1.5 rounded font-bold border ${selectedTool === 'erase' ? 'bg-slate-500 border-white' : 'bg-slate-700 border-slate-600'}`}
            >
              Borrar 🗑️
            </button>
          </div>
        </div>

        {selectedTool === 'block' && (
          <div>
            <span className="text-slate-400 block mb-1">TIPO DE BLOQUE:</span>
            <div className="flex gap-1">
              <button
                onClick={() => setSelectedBlockType('ground')}
                className={`px-2 py-1 rounded border ${selectedBlockType === 'ground' ? 'ring-2 ring-yellow-400' : ''} bg-amber-800 text-white`}
              >
                Suelo
              </button>
              <button
                onClick={() => setSelectedBlockType('brick')}
                className={`px-2 py-1 rounded border ${selectedBlockType === 'brick' ? 'ring-2 ring-yellow-400' : ''} bg-amber-700 text-amber-200`}
              >
                Ladrillo
              </button>
              <button
                onClick={() => setSelectedBlockType('question')}
                className={`px-2 py-1 rounded border ${selectedBlockType === 'question' ? 'ring-2 ring-yellow-400' : ''} bg-yellow-500 text-black font-bold`}
              >
                [?] Bloque
              </button>
              <button
                onClick={() => setSelectedBlockType('hard_block')}
                className={`px-2 py-1 rounded border ${selectedBlockType === 'hard_block' ? 'ring-2 ring-yellow-400' : ''} bg-amber-900 text-white`}
              >
                Bloque Duro
              </button>
            </div>
          </div>
        )}

        {selectedTool === 'enemy' && (
          <div>
            <span className="text-slate-400 block mb-1">ENEMIGO:</span>
            <div className="flex gap-1">
              <button
                onClick={() => setSelectedEnemyType('goomba')}
                className={`px-2 py-1 rounded border ${selectedEnemyType === 'goomba' ? 'ring-2 ring-yellow-400' : ''} bg-amber-900 text-orange-200`}
              >
                🟤 Goomba
              </button>
              <button
                onClick={() => setSelectedEnemyType('koopa')}
                className={`px-2 py-1 rounded border ${selectedEnemyType === 'koopa' ? 'ring-2 ring-yellow-400' : ''} bg-green-700 text-green-200`}
              >
                🐢 Koopa
              </button>
            </div>
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          <label className="text-slate-400">Ancho (baldosas):</label>
          <input
            type="number"
            min="30"
            max="150"
            value={levelWidth}
            onChange={(e) => setLevelWidth(Math.max(30, Math.min(150, parseInt(e.target.value) || 60)))}
            className="w-16 bg-slate-900 border border-slate-600 text-center rounded p-1 text-white"
          />
          <button
            onClick={() => setGrid({})}
            className="bg-red-800 hover:bg-red-700 text-white p-1.5 rounded flex items-center gap-1 ml-2"
            title="Limpiar Rejilla"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Editor Grid Canvas */}
      <div className="w-full max-w-5xl overflow-x-auto bg-sky-300 p-2 rounded-lg border-4 border-slate-700">
        <div
          className="grid gap-0"
          style={{
            gridTemplateColumns: `repeat(${levelWidth}, 32px)`,
            gridTemplateRows: `repeat(${rows}, 32px)`,
            width: `${levelWidth * 32}px`,
          }}
        >
          {Array.from({ length: rows }).map((_, y) =>
            Array.from({ length: levelWidth }).map((_, x) => {
              const key = `${x}_${y}`;
              const cell = grid[key];

              let bgClass = 'border border-sky-400/30 hover:bg-white/20';
              let content = '';

              if (cell) {
                if (cell.type === 'block') {
                  if (cell.subType === 'ground') bgClass = 'bg-amber-800 border-amber-900';
                  else if (cell.subType === 'brick') bgClass = 'bg-amber-700 border-amber-900 text-xs flex items-center justify-center font-bold text-amber-300';
                  else if (cell.subType === 'question') bgClass = 'bg-yellow-400 border-yellow-600 text-xs flex items-center justify-center font-bold text-black';
                  else if (cell.subType === 'hard_block') bgClass = 'bg-amber-950 border-black';
                } else if (cell.type === 'enemy') {
                  content = cell.subType === 'goomba' ? '🟤' : '🐢';
                } else if (cell.type === 'coin') {
                  content = '🪙';
                }
              }

              // Default start position indicator
              const isStart = x === 2 && y === 11;
              const isFlag = x === levelWidth - 5;

              return (
                <div
                  key={key}
                  onClick={() => handleTileClick(x, y)}
                  className={`w-8 h-8 cursor-pointer select-none flex items-center justify-center font-bold text-sm transition-colors relative ${bgClass}`}
                >
                  {content}
                  {cell?.type === 'block' && cell.subType === 'question' && '?'}
                  {cell?.type === 'block' && cell.subType === 'brick' && '#'}
                  {isStart && !cell && (
                    <span className="absolute inset-0 bg-green-500/50 flex items-center justify-center text-[10px] text-white font-bold">
                      START
                    </span>
                  )}
                  {isFlag && !cell && y === 12 && (
                    <span className="absolute inset-0 bg-red-500/50 flex items-center justify-center text-[10px] text-white font-bold">
                      🚩
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};