import React from 'react';
import { HelpCircle } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const faqs = [
    {
      q: '¿Qué es el dólar paralelo o "blue" en Bolivia?',
      a: 'Es la cotización del dólar estadounidense que surge de la libre oferta y demanda entre personas y comercios (vía P2P o físico), fuera del circuito de asignación fija del Banco Central de Bolivia.',
    },
    {
      q: '¿Por qué existe una diferencia con el dólar oficial (6.96 BOB)?',
      a: 'El Banco Central de Bolivia mantiene fijado el tipo de cambio oficial en 6.96 BOB. Sin embargo, ante la escasez de divisas físicas en ventanillas bancarias y restricciones en tarjetas de crédito/débito, la demanda migró hacia plataformas P2P donde la tasa flota libremente.',
    },
    {
      q: '¿Cada cuánto tiempo se actualizan las cotizaciones en este portal?',
      a: 'Nuestros algoritmos recopilan y promedian los datos del libro de órdenes públicas de Binance P2P, Bybit y plataformas fintech en intervalos de 5 a 15 minutos.',
    },
    {
      q: '¿Cómo puedo comprar o vender dólares usando USDT de forma segura?',
      a: 'Utiliza únicamente plataformas reconocidas con custodia en garantía (escrow), verifica que la cuenta bancaria del destinatario coincida con su identidad verificada y nunca liberes los activos antes de verificar el saldo en tu banca móvil.',
    },
  ];

  return (
    <div className="banknote-card rounded-2xl p-6 sm:p-8 border border-[#C9A24B]/30 mb-12">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#C9A24B]/20">
        <div className="w-10 h-10 rounded bg-[#C9A24B]/20 text-[#C9A24B] flex items-center justify-center border border-[#C9A24B]/40">
          <HelpCircle size={22} />
        </div>
        <div>
          <h3 className="font-serif-heading text-xl font-bold text-[#F1EDE1]">
            Preguntas Frecuentes
          </h3>
          <p className="text-xs text-[#F1EDE1]/60">
            Dudas comunes sobre el mercado de divisas y P2P en Bolivia
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-[#0D1E16] p-5 rounded-xl border border-[#C9A24B]/20 space-y-2">
            <h4 className="font-serif-heading text-base font-semibold text-[#C9A24B]">
              {faq.q}
            </h4>
            <p className="text-xs text-[#F1EDE1]/80 leading-relaxed font-sans">
              {faq.a}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};