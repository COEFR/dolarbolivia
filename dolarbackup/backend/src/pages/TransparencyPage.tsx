import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ShieldCheck, Database, RefreshCw, AlertTriangle } from 'lucide-react';

const TransparencyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-guilloche flex flex-col justify-between">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex-1">
        
        {/* Header */}
        <div className="banknote-card rounded-2xl p-6 sm:p-8 border border-[#C9A24B]/30 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded bg-[#C9A24B]/20 text-[#C9A24B] flex items-center justify-center">
              <ShieldCheck size={22} />
            </div>
            <div>
              <span className="text-xs font-mono-num text-[#C9A24B] uppercase tracking-wider">POLÍTICA Y METODOLOGÍA</span>
              <h1 className="font-serif-heading text-3xl font-extrabold text-[#F1EDE1]">
                Transparencia de Datos & Metodología
              </h1>
            </div>
          </div>
          <p className="text-sm text-[#F1EDE1]/70 max-w-2xl">
            Explicación detallada sobre cómo recopilamos, promediamos y verificamos la información cambiaria en tiempo real sin manipulaciones ni estimaciones subjetivas.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6 mb-12">
          
          <div className="banknote-card rounded-xl p-6 border border-[#C9A24B]/30 space-y-3">
            <div className="flex items-center gap-2 text-[#C9A24B] font-bold font-serif-heading text-lg">
              <Database size={20} /> 1. Origen de las Fuentes Públicas
            </div>
            <p className="text-xs sm:text-sm text-[#F1EDE1]/80 leading-relaxed">
              <strong>Tasa Oficial de Compra:</strong> Se obtiene directamente de la publicación oficial diaria del Banco Central de Bolivia (BCB) a través de su portal institucional.<br />
              <strong>Tasa Paralela / P2P:</strong> Se consulta a través de los endpoints públicos de la API P2P de Binance (frecuencia de libro de órdenes), Bybit, OKX y plataformas de dinero electrónico.
            </p>
          </div>

          <div className="banknote-card rounded-xl p-6 border border-[#C9A24B]/30 space-y-3">
            <div className="flex items-center gap-2 text-[#C9A24B] font-bold font-serif-heading text-lg">
              <RefreshCw size={20} /> 2. Frecuencia de Actualización y Manejo de Errores
            </div>
            <p className="text-xs sm:text-sm text-[#F1EDE1]/80 leading-relaxed">
              Las lecturas se ejecutan de forma automática. Cada registro almacenado posee una marca temporal (*timestamp*) explícita. En caso de que una API externa sufra una caída temporal o bloqueo por límite de peticiones, el sistema pasa automáticamente a modo respaldo notificando la leyenda <span className="font-mono-num text-[#9C3B33] bg-[#9C3B33]/20 px-2 py-0.5 rounded">No disponible</span> o manteniendo el último valor verificado.
            </p>
          </div>

          <div className="banknote-card rounded-xl p-6 border border-[#C9A24B]/30 space-y-3">
            <div className="flex items-center gap-2 text-[#9C3B33] font-bold font-serif-heading text-lg">
              <AlertTriangle size={20} /> 3. Neutralidad Cambiaria
            </div>
            <p className="text-xs sm:text-sm text-[#F1EDE1]/80 leading-relaxed">
              DólarBolivia no realiza intermediación financiera, compraventa de divisas ni captación de fondos. El único objetivo del portal es otorgar transparencia informativa a la población y a los actores económicos del país.
            </p>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
};

export default TransparencyPage;