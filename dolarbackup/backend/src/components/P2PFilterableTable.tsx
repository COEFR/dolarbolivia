import React, { useState } from 'react';
import { PlatformRate } from '@/types/rates';
import { Search, Filter, ShieldCheck, ExternalLink, ArrowUpDown } from 'lucide-react';

interface P2PFilterableTableProps {
  platforms: PlatformRate[];
}

export const P2PFilterableTable: React.FC<P2PFilterableTableProps> = ({ platforms }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [minAmountFilter, setMinAmountFilter] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'sellRate' | 'buyRate' | 'spread'>('sellRate');

  // Extract all payment methods
  const allMethods = Array.from(
    new Set(platforms.flatMap((p) => p.paymentMethods))
  );

  const filteredPlatforms = platforms
    .filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesMethod = selectedMethod === 'all' || p.paymentMethods.includes(selectedMethod);
      const matchesAmount = p.minAmountBOB <= (minAmountFilter || 999999);
      return matchesSearch && matchesMethod && matchesAmount;
    })
    .sort((a, b) => {
      if (sortBy === 'sellRate') return a.sellRate - b.sellRate; // Lowest sell rate first
      if (sortBy === 'buyRate') return b.buyRate - a.buyRate;   // Highest buy rate first
      return a.spread - b.spread;                              // Tightest spread first
    });

  return (
    <div className="banknote-card rounded-2xl p-6 sm:p-8 border border-[#C9A24B]/30 mb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#C9A24B]/20">
        <div>
          <span className="text-xs font-mono-num uppercase tracking-wider text-[#C9A24B]">
            FILTROS DE BÚSQUEDA P2P
          </span>
          <h3 className="font-serif-heading text-2xl font-bold text-[#F1EDE1]">
            Directorio Interactivo de Casas de Cambio P2P
          </h3>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 bg-[#0D1E16] px-3 py-1.5 rounded-lg border border-[#C9A24B]/30 text-xs font-mono-num">
          <ArrowUpDown size={14} className="text-[#C9A24B]" />
          <span className="text-[#F1EDE1]/60">Ordenar por:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-transparent text-[#C9A24B] outline-none font-bold cursor-pointer"
          >
            <option value="sellRate">Menor Precio Venta (Pagas menos)</option>
            <option value="buyRate">Mayor Precio Compra (Recibes más)</option>
            <option value="spread">Menor Spread (Mejor margen)</option>
          </select>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 font-mono-num text-xs">
        {/* Search input */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C9A24B]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre..."
            className="w-full bg-[#0D1E16] border border-[#C9A24B]/30 rounded-lg pl-9 pr-3 py-2 text-[#F1EDE1] outline-none focus:border-[#C9A24B]"
          />
        </div>

        {/* Payment method filter */}
        <div className="flex items-center gap-2 bg-[#0D1E16] border border-[#C9A24B]/30 rounded-lg px-3 py-2">
          <Filter size={16} className="text-[#C9A24B]" />
          <select
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="w-full bg-transparent text-[#F1EDE1] outline-none cursor-pointer"
          >
            <option value="all">Todos los bancos / QR</option>
            {allMethods.map((m) => (
              <option key={m} value={m} className="bg-[#0D1E16] text-[#F1EDE1]">
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Max min amount BOB filter */}
        <div className="flex items-center gap-2 bg-[#0D1E16] border border-[#C9A24B]/30 rounded-lg px-3 py-2">
          <span className="text-[#C9A24B] font-bold">Mín. BOB:</span>
          <input
            type="number"
            value={minAmountFilter || ''}
            onChange={(e) => setMinAmountFilter(parseInt(e.target.value) || 0)}
            placeholder="Ej. 100"
            className="w-full bg-transparent text-[#F1EDE1] outline-none"
          />
        </div>
      </div>

      {/* Results Count */}
      <div className="text-xs font-mono-num text-[#F1EDE1]/60 mb-4 flex justify-between items-center">
        <span>Mostrando {filteredPlatforms.length} de {platforms.length} plataformas P2P</span>
        {(searchTerm || selectedMethod !== 'all' || minAmountFilter > 0) && (
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedMethod('all');
              setMinAmountFilter(0);
            }}
            className="text-[#C9A24B] underline"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono-num text-sm border-collapse">
          <thead>
            <tr className="border-b border-[#C9A24B]/30 text-xs text-[#C9A24B] uppercase tracking-wider">
              <th className="py-3 px-4">Plataforma</th>
              <th className="py-3 px-4">Tipo</th>
              <th className="py-3 px-4">Compra P2P</th>
              <th className="py-3 px-4">Venta P2P</th>
              <th className="py-3 px-4">Mínimo (BOB)</th>
              <th className="py-3 px-4">Confianza</th>
              <th className="py-3 px-4">Bancos Aceptados</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C9A24B]/10">
            {filteredPlatforms.map((platform) => (
              <tr key={platform.id} className="hover:bg-[#152E21]/80 transition-colors">
                <td className="py-4 px-4 font-bold text-[#F1EDE1] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  {platform.name}
                </td>
                <td className="py-4 px-4 text-xs text-[#F1EDE1]/70">{platform.type}</td>
                <td className="py-4 px-4 font-bold text-[#C9A24B] text-base">
                  {platform.buyRate.toFixed(2)} <span className="text-xs text-[#F1EDE1]/50 font-normal">BOB</span>
                </td>
                <td className="py-4 px-4 font-bold text-[#F1EDE1] text-base">
                  {platform.sellRate.toFixed(2)} <span className="text-xs text-[#F1EDE1]/50 font-normal">BOB</span>
                </td>
                <td className="py-4 px-4 text-xs text-[#F1EDE1]/80">
                  {platform.minAmountBOB} BOB
                </td>
                <td className="py-4 px-4">
                  <span className="inline-flex items-center gap-1 text-xs bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-700/50">
                    <ShieldCheck size={12} /> {platform.trustScore}
                  </span>
                </td>
                <td className="py-4 px-4 text-xs text-[#F1EDE1]/70 max-w-xs">
                  <div className="flex flex-wrap gap-1">
                    {platform.paymentMethods.map((m) => (
                      <span key={m} className="bg-[#0D1E16] text-[#C9A24B] px-1.5 py-0.5 rounded text-[10px] border border-[#C9A24B]/20">
                        {m}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};