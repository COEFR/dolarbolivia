import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Share2, Copy, Check, MessageSquare } from 'lucide-react';
import { RatesDataResponse } from '@/types/rates';
import { showSuccess } from '@/utils/toast';

interface ShareRateSnapshotModalProps {
  data: RatesDataResponse;
}

export const ShareRateSnapshotModal: React.FC<ShareRateSnapshotModalProps> = ({ data }) => {
  const [copied, setCopied] = useState<boolean>(false);

  const formattedShareText = `
🟢 *DÓLAR BOLIVIA HOY* (${data.lastChecked})

💵 *Dólar P2P (Binance/Bybit)*
  • Venta (Comprar USDT): *${data.parallel.sell.toFixed(2)} BOB*
  • Compra (Vender USDT): *${data.parallel.buy.toFixed(2)} BOB*

💵 *Dólar Físico (Efectivo)*
  • Venta: *${data.physicalCash.sell.toFixed(2)} BOB*
  • Compra: *${data.physicalCash.buy.toFixed(2)} BOB*

🏛️ *Dólar Oficial BCB (Compra):* *${data.official.buyRate.toFixed(2)} BOB*
📈 *Brecha Cambiaria:* *+${data.parallel.gapWithOfficial}%*

📊 Consulta cotizaciones en tiempo real en:
https://dolarbolivia.vercel.app/
  `.trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedShareText);
    setCopied(true);
    showSuccess('¡Cotización copiada al portapapeles!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(formattedShareText)}`;
    window.open(url, '_blank');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="bg-[#152E21] hover:bg-[#C9A24B] text-[#C9A24B] hover:text-[#10241A] font-bold text-xs px-3.5 py-2 rounded-xl border border-[#C9A24B]/40 transition-all flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer font-mono-num">
          <Share2 size={15} /> Compartir Cotización
        </button>
      </DialogTrigger>

      <DialogContent className="bg-[#0D1E16] border-2 border-[#C9A24B]/50 text-[#F1EDE1] font-sans max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif-heading text-xl font-bold text-[#C9A24B] text-center">
            📲 Compartir Cotización del Día
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 my-2">
          <p className="text-xs text-[#F1EDE1]/70 text-center font-mono-num">
            Copia el reporte en formato formateado para enviar a tus contactos o grupos de WhatsApp:
          </p>

          <div className="bg-[#0A1711] p-4 rounded-xl border border-[#C9A24B]/30 font-mono-num text-xs text-emerald-300 whitespace-pre-wrap leading-relaxed select-all">
            {formattedShareText}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 font-mono-num text-xs">
            <button
              onClick={handleCopy}
              className="bg-[#152E21] hover:bg-[#C9A24B]/20 text-[#C9A24B] font-bold py-2.5 px-4 rounded-xl border border-[#C9A24B]/40 flex items-center justify-center gap-2 transition-all"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? '¡Copiado!' : 'Copiar Texto'}
            </button>

            <button
              onClick={handleWhatsAppShare}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all"
            >
              <MessageSquare size={16} /> Enviar a WhatsApp
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};