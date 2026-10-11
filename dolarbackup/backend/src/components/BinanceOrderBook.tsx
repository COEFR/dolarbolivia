import React, { useState } from 'react';
import { BinanceAd } from '@/types/rates';
import { ExternalLink, ShieldCheck, Zap, UserCheck } from 'lucide-react';

interface BinanceOrderBookProps {
  ads: BinanceAd[];
}

export const BinanceOrderBook: React.FC<BinanceOrderBookProps> = ({ ads }) => {
  const [activeTab, setActiveTab] = useState<'SELL' | 'BUY'>('SELL');

  const filteredAds = ads.filter((ad) => ad.tradeType === activeTab);

  return (
    <div className="banknote-card rounded-2xl p-6 sm:p-8 border border-[#C9A24B]/30 mb-12 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#C9A24B]/20">
        <div>
          <span className="text-xs font-mono-num uppercase tracking-wider text-[#C9A24B] flex items-center gap-1.5">
            <Zap size={14} /> BINANCE P2P EN VIVO
          </span>
          <h3 className="font-serif-heading text-2xl font-bold text-[#F1EDE1]">
            Anuncios Activos en Tiempo Real (USDT/BOB)
          </h3>
          <p className="text-xs text-[#F1EDE1]/60">
            Libro de órdenes público consultado directamente desde la API de Binance P2P
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1 bg-[#0D1E16] p-1.5 rounded-lg border border-[#C9A24B]/30 font-mono-num text-xs">
          <button
            onClick={() => setActiveTab('SELL')}
            className={`px-4 py-1.5 rounded-md transition-all font-bold ${
              activeTab === 'SELL'
                ? 'bg-[#C9A24B] text-[#10241A] shadow'
                : 'text-[#F1EDE1]/70 hover:text-white'
            }`}
          >
            Venta (Comprar USDT)
          </button>
          <button
            onClick={() => setActiveTab('BUY')}
            className={`px-4 py-1.5 rounded-md transition-all font-bold ${
              activeTab === 'BUY'
                ? 'bg-[#3E6D8E] text-white shadow'
                : 'text-[#F1EDE1]/70 hover:text-white'
            }`}
          >
            Compra (Vender USDT)
          </button>
        </div>
      </div>

      {/* Ads List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAds.map((ad) => (
          <div
            key={ad.id}
            className="bg-[#0D1E16] p-4 rounded-xl border border-[#C9A24B]/20 flex flex-col justify-between hover:border-[#C9A24B]/60 transition-all font-mono-num space-y-3"
          >
            <div className="flex items-center justify-between border-b border-[#C9A24B]/10 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#152E21] border border-[#C9A24B] text-[#C9A24B] flex items-center justify-center text-xs font-bold">
                  {ad.merchantName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="font-bold text-[#F1EDE1] text-sm block">{ad.merchantName}</span>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <UserCheck size={10} /> {ad.completedOrders} órdenes | {ad.finishRate}%
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xl font-extrabold text-[#C9A24B] block">
                  {ad.price.toFixed(2)} <span className="text-xs text-[#F1EDE1]/60 font-normal">BOB</span>
                </span>
                <span className="text-[10px] text-[#F1EDE1]/50 uppercase">Por 1 USDT</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-[#F1EDE1]/70">
              <span><strong>Límites:</strong> {ad.minAmount} - {ad.maxAmount.toLocaleString()} BOB</span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#C9A24B]/10 text-[11px]">
              <div className="flex flex-wrap gap-1">
                {ad.methods.slice(0, 3).map((m) => (
                  <span
                    key={m}
                    className="bg-[#152E21] text-[#C9A24B] px-2 py-0.5 rounded border border-[#C9A24B]/20"
                  >
                    {m}
                  </span>
                ))}
              </div>

              <a
                href="https://p2p.binance.com/es/trade/all-payments/USDT?fiat=BOB"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#C9A24B] hover:underline font-bold"
              >
                Binance <ExternalLink size={12} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};