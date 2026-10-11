import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { TickerHero } from '@/components/TickerHero';
import { Calculator } from '@/components/Calculator';
import { PlatformComparison } from '@/components/PlatformComparison';
import CurrencyTable from '@/components/CurrencyTable';
import { PriceChart } from '@/components/PriceChart';
import { NewsSection } from '@/components/NewsSection';
import { fetchLiveRates } from '@/services/ratesService';
import { RatesDataResponse } from '@/types/rates';
import { showSuccess } from '@/utils/toast';

const Index: React.FC = () => {
  const [data, setData] = useState<RatesDataResponse | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (notify = false) => {
    setRefreshing(true);
    const res = await fetchLiveRates();
    setData(res);
    setRefreshing(false);
    if (notify) showSuccess('Cotizaciones actualizadas');
  };

  useEffect(() => { load(); }, []);

  if (!data) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <p className="font-mono text-sm text-white/20 animate-pulse-subtle">cargando cotizaciones...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] bg-grid bg-grain">
      <Navbar lastChecked={data.lastChecked} onRefresh={() => load(true)} isRefreshing={refreshing} />

      <main className="max-w-5xl mx-auto px-6">
        <TickerHero data={data} />
        <CurrencyTable parallelRate={data.parallel.sell} />
        <Calculator parallelBuy={data.parallel.buy} parallelSell={data.parallel.sell} officialRate={data.official.rate} />
        <PlatformComparison platforms={data.platforms} />
        <section className="py-8">
          <div className="section-label">noticias</div>
          <NewsSection />
        </section>
      </main>

      <Footer officialRate={data.official.rate} lastVerified={data.official.lastVerified} />
    </div>
  );
};

export default Index;
