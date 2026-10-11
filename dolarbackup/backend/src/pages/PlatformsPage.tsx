import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { fetchLiveRates } from '@/services/ratesService';
import { RatesDataResponse, PlatformRate } from '@/types/rates';

const LOGOS: Record<string, string> = {
  'wallbit': 'https://www.google.com/s2/favicons?domain=wallbit.io&sz=128',
  'binance-p2p': 'https://www.google.com/s2/favicons?domain=binance.com&sz=128',
  'bitget-p2p': 'https://www.google.com/s2/favicons?domain=bitget.com&sz=128',
  'bybit-p2p': 'https://www.google.com/s2/favicons?domain=bybit.com&sz=128',
  'saldoar': 'https://www.google.com/s2/favicons?domain=saldoar.com&sz=128',
  'okx-p2p': 'https://www.google.com/s2/favicons?domain=okx.com&sz=128',
  'mexc-p2p': 'https://www.google.com/s2/favicons?domain=mexc.com&sz=128',
};

const NAMES: Record<string, string> = {
  'wallbit': 'Wallbit', 'binance-p2p': 'Binance P2P', 'bitget-p2p': 'Bitget P2P',
  'bybit-p2p': 'Bybit P2P', 'saldoar': 'SaldoAr', 'okx-p2p': 'OKX P2P', 'mexc-p2p': 'MEXC P2P',
};

const ORDER = ['wallbit', 'binance-p2p', 'bitget-p2p', 'bybit-p2p', 'saldoar', 'okx-p2p', 'mexc-p2p'];

const Card = ({ p }: { p: PlatformRate }) => (
  <div className="flex-1 min-w-[180px] max-w-[260px] card-dark p-6 flex flex-col items-center text-center gap-4">
    <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
      {LOGOS[p.id] ? (
        <img src={LOGOS[p.id]} alt={p.name} width={48} height={48} className="object-contain" />
      ) : (
        <span className="text-xl font-bold text-white/20">{p.name[0]}</span>
      )}
    </div>
    <h3 className="text-sm font-semibold text-white/80">{NAMES[p.id] || p.name}</h3>
    <div className="w-full space-y-1.5">
      <div className="flex justify-between text-sm font-mono">
        <span className="text-white/40">Compra</span>
        <span className="text-white font-semibold">Bs {p.buyRate.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-sm font-mono">
        <span className="text-white/40">Venta</span>
        <span className="text-amber-500 font-semibold">Bs {p.sellRate.toFixed(2)}</span>
      </div>
    </div>
  </div>
);

const PlatformsPage: React.FC = () => {
  const [data, setData] = useState<RatesDataResponse | null>(null);

  useEffect(() => { fetchLiveRates().then(setData); }, []);

  const platforms = data?.platforms || [];
  const ordered = ORDER.map(id => platforms.find(p => p.id === id)).filter(Boolean) as PlatformRate[];

  return (
    <div className="min-h-screen bg-[#050505] bg-grid bg-grain flex flex-col">
      <Navbar lastChecked={data?.lastChecked} />

      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '3rem 1.5rem', width: '100%', flex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div className="text-sm font-bold text-blue-400/70 uppercase tracking-[0.15em] mb-2">
            <span className="text-blue-400/40">//</span> plataformas p2p
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Otras Plataformas</h1>
          <p className="text-sm text-white/30">Cotizaciones USDT/BOB en tiempo real</p>
        </div>

        {ordered.length > 0 ? (
          <div className="space-y-4">
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem' }}>
              {ordered.slice(0, 4).map(p => <Card key={p.id} p={p} />)}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem' }}>
              {ordered.slice(4, 7).map(p => <Card key={p.id} p={p} />)}
            </div>
          </div>
        ) : (
          <p className="text-center text-white/20 text-sm font-mono">Cargando cotizaciones...</p>
        )}

        <p className="mt-10 text-center text-[10px] font-mono text-white/12">
          Los precios son referenciales y pueden variar. Verifica siempre en la plataforma oficial.
        </p>
      </main>

      <Footer />
    </div>
  );
};

export default PlatformsPage;
