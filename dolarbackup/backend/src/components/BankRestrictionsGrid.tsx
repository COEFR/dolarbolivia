import React, { useState } from 'react';
import { getBankRestrictions, BankRestriction } from '@/services/ratesService';
import { Shield, AlertTriangle, XCircle, ExternalLink } from 'lucide-react';

const STATUS_MAP = {
  none: { icon: Shield, label: 'Sin restricciones', color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/30' },
  moderate: { icon: AlertTriangle, label: 'Moderadas', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30' },
  severe: { icon: XCircle, label: 'Muy limitado', color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30' },
};

const BankRestrictionsGrid: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'none' | 'moderate' | 'severe'>('all');
  const banks = getBankRestrictions();
  const filtered = filter === 'all' ? banks : banks.filter(b => b.restriction === filter);

  return (
    <section className="py-8">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">🏦</span>
        <h2 className="text-2xl font-serif text-[#F1EDE1]">Límites y Restricciones en Bolivia</h2>
      </div>
      <p className="text-[#C9A24B]/60 text-sm mb-4">
        Información actualizada sobre límites de compra con tarjetas de débito · Jul 2026
      </p>

      <div className="flex gap-2 mb-6 flex-wrap">
        {([
          { key: 'all', label: 'Todos' },
          { key: 'none', label: 'Sin restricciones' },
          { key: 'moderate', label: 'Con restricciones' },
          { key: 'severe', label: 'Muy limitado' },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              filter === key
                ? 'bg-[#C9A24B] text-[#10241A]'
                : 'bg-[#10241A] border border-[#C9A24B]/30 text-[#C9A24B]/70 hover:border-[#C9A24B]/60'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((bank) => {
          const status = STATUS_MAP[bank.restriction];
          const Icon = status.icon;
          return (
            <div
              key={bank.code}
              className={`p-4 rounded-xl border ${status.border} ${status.bg} hover:scale-[1.02] transition-transform`}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-serif text-[#F1EDE1] text-sm font-semibold">{bank.name}</h3>
                <Icon className={`w-4 h-4 ${status.color}`} />
              </div>
              <div className="flex items-center gap-2 text-xs text-[#C9A24B]/60 mb-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${status.color} ${status.bg}`}>
                  {status.label}
                </span>
                <span>Límite: ${bank.monthlyLimitUSD.toLocaleString()}/mes</span>
              </div>
              <p className="text-xs text-[#F1EDE1]/50">{bank.notes}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default BankRestrictionsGrid;
