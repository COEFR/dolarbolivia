import React from 'react';
import { CityRate } from '@/types/rates';
import { MapPin, TrendingUp, DollarSign } from 'lucide-react';

interface RegionalRatesGridProps {
  cityRates: CityRate[];
}

export const RegionalRatesGrid: React.FC<RegionalRatesGridProps> = ({ cityRates }) => {
  return (
    <div className="banknote-card rounded-2xl p-6 sm:p-8 border border-[#C9A24B]/30 mb-12 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#C9A24B]/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-[#C9A24B]/20 text-[#C9A24B] flex items-center justify-center border border-[#C9A24B]/40">
            <MapPin size={22} />
          </div>
          <div>
            <span className="text-xs font-mono-num uppercase tracking-wider text-[#C9A24B] block font-bold">
              COTIZACIÓN POR DEPARTAMENTO
            </span>
            <h3 className="font-serif-heading text-2xl font-bold text-[#F1EDE1]">
              Dólar Físico en Efectivo por Ciudades
            </h3>
            <p className="text-xs text-[#F1EDE1]/60">
              Cotizaciones referenciales estimadas en las principales plazas comerciales y casas de cambio físicas
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cityRates.map((city) => (
          <div
            key={city.code}
            className="bg-[#0D1E16] p-5 rounded-xl border border-[#C9A24B]/20 hover:border-[#C9A24B] transition-all font-mono-num space-y-3"
          >
            <div className="flex items-center justify-between border-b border-[#C9A24B]/10 pb-2">
              <span className="font-bold text-[#F1EDE1] text-sm flex items-center gap-1.5">
                <span>{city.flag}</span> {city.city}
              </span>
              <span className="text-[10px] bg-[#C9A24B]/10 text-[#C9A24B] px-2 py-0.5 rounded border border-[#C9A24B]/30 font-bold flex items-center gap-1">
                <TrendingUp size={10} /> {city.trend}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[#152E21] p-2.5 rounded border border-[#C9A24B]/20">
                <span className="text-[#F1EDE1]/60 block mb-0.5 text-[10px]">VENTA EFECTIVO</span>
                <span className="text-base font-extrabold text-[#C9A24B]">{city.sellCash.toFixed(2)}</span>
                <span className="text-[10px] text-[#F1EDE1]/50 ml-1">BOB</span>
              </div>

              <div className="bg-[#152E21] p-2.5 rounded border border-[#C9A24B]/20">
                <span className="text-[#F1EDE1]/60 block mb-0.5 text-[10px]">COMPRA EFECTIVO</span>
                <span className="text-base font-extrabold text-[#F1EDE1]">{city.buyCash.toFixed(2)}</span>
                <span className="text-[10px] text-[#F1EDE1]/50 ml-1">BOB</span>
              </div>
            </div>

            <div className="text-[10px] text-[#F1EDE1]/60 pt-1">
              <strong>Puntos habituales:</strong> {city.popularPlaces.join(', ')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};