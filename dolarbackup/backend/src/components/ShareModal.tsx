import React, { useState, useRef, useEffect } from 'react';
import { X, Download, Share2 } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { RatesDataResponse } from '@/types/rates';

interface Props { data: RatesDataResponse }

interface HistoryPoint { t: string; s: number }

const ShareModal: React.FC<Props> = ({ data }) => {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [msg, setMsg] = useState('');
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      fetch('history.json')            // relativo: funciona en el dominio y en cualquier subcarpeta
        .then(r => r.json())
        .then((pts: HistoryPoint[]) => setHistory(pts))
        .catch(() => setHistory([]));
    }
  }, [open]);

  const now = new Date();
  const dateStr = now.toLocaleDateString('es-BO', { day: '2-digit', month: 'short' }).toUpperCase();
  const timeStr = now.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });

  const sparkData = history.length > 0
    ? history.map(p => ({ v: parseFloat((p.s - Math.floor(p.s)).toFixed(3)) }))
    : [{ v: 0.72 }, { v: 0.74 }, { v: 0.71 }, { v: 0.75 }, { v: 0.73 }, { v: 0.76 }, { v: 0.74 }];

  const sparkValues = sparkData.map(d => d.v);
  const isUp = sparkValues.length > 1 && sparkValues[sparkValues.length - 1] >= sparkValues[0];
  const sparkColor = isUp ? '#4ade80' : '#f59e0b';

  const shareText = `📊 DólarBolivia\nCompra: Bs ${data.parallel.buy.toFixed(2)} | Venta: Bs ${data.parallel.sell.toFixed(2)}\n${dateStr} ${timeStr}\nOficial BCB: Bs ${data.official.buyRate.toFixed(2)}\nhttps://dolarbolivia.site`;

  const aviso = (m: string) => { setMsg(m); window.setTimeout(() => setMsg(''), 3000); };

  // Copiar compatible: sirve también sin HTTPS (donde navigator.clipboard no existe)
  const copiar = (texto: string): boolean => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(texto).then(() => aviso('📋 Copiado al portapapeles')).catch(() => {});
        return true;
      }
    } catch {}
    try {
      const ta = document.createElement('textarea');
      ta.value = texto;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.top = '0';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      ta.setSelectionRange(0, ta.value.length);
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch { return false; }
  };

  // Dibujar la tarjeta como imagen (con tolerancia a fallos: nunca rompe el botón)
  const dibujar = async (): Promise<HTMLCanvasElement | null> => {
    if (!cardRef.current) return null;
    try {
      const { default: html2canvas } = await import('html2canvas');
      return await html2canvas(cardRef.current, {
        backgroundColor: '#0a0a0a',
        scale: 3,
        useCORS: true,
        allowTaint: false,
        logging: false,
      });
    } catch { return null; }
  };

  const blobDe = (canvas: HTMLCanvasElement): Promise<Blob | null> =>
    new Promise(res => { try { canvas.toBlob(b => res(b), 'image/png'); } catch { res(null); } });

  const handleDownload = async () => {
    const canvas = await dibujar();
    if (canvas) {
      const blob = await blobDe(canvas);
      if (blob) {
        try {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `dolarbolivia-${new Date().toISOString().slice(0, 10)}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.setTimeout(() => URL.revokeObjectURL(url), 5000);
          aviso('✅ Imagen guardada');
          return;
        } catch {}
      }
    }
    aviso(copiar(shareText) ? '📋 No se pudo la imagen: copié la cotización' : '⚠️ No se pudo guardar');
  };

  const handleShare = async () => {
    // 1) Compartir nativo (celular con HTTPS): manda la imagen + el texto
    try {
      if (navigator.share) {
        const canvas = await dibujar();
        const blob = canvas ? await blobDe(canvas) : null;
        if (blob) {
          const file = new File([blob], 'dolarbolivia.png', { type: 'image/png' });
          const nav: any = navigator;
          if (nav.canShare && nav.canShare({ files: [file] })) {
            await navigator.share({ files: [file], title: 'DólarBolivia', text: shareText });
            return;
          }
        }
        await navigator.share({ title: 'DólarBolivia', text: shareText });
        return;
      }
    } catch (e: any) {
      if (e && e.name === 'AbortError') return;   // el usuario cerró la hoja de compartir: no es error
    }
    // 2) Sin HTTPS (o sin Web Share): WhatsApp + portapapeles
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank', 'noopener');
    copiar(shareText);
    aviso('📲 Abriendo WhatsApp · copiado listo para pegar');
  };

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:bg-amber-500/20 transition-all text-sm font-semibold btn-hover">
        <Share2 size={18} />
        ¡Comparte la cotización ahora!
      </button>

      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', background: 'rgba(5,5,5,0.92)', backdropFilter: 'blur(8px)' }}
          onClick={() => setOpen(false)}>
          
          <div onClick={e => e.stopPropagation()} style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
            
            <button onClick={() => setOpen(false)}
              style={{ position: 'absolute', top: '-36px', right: '0', width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 1 }}>
              <X size={16} />
            </button>

            {/* SHARE CARD — same design as Facebook post */}
            <div ref={cardRef} style={{ 
              background: '#0a0a0a', 
              border: '1px solid rgba(255,255,255,0.06)',
              padding: '40px 32px', 
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}>
              
              {/* Top */}
              <div style={{ marginBottom: '32px' }}>
                <p style={{ fontSize: '16px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px', fontWeight: 700 }}>
                  USDT / BOB
                </p>
                <p style={{ fontSize: '13px', fontFamily: 'monospace', color: 'rgba(245,158,11,0.7)', textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 600 }}>
                  T.C. PARALELO
                </p>
              </div>

              {/* Prices */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', margin: '28px 0 20px' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '13px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px', fontWeight: 700 }}>
                    COMPRA
                  </p>
                  <p style={{ fontSize: '48px', fontWeight: 900, fontFamily: 'monospace', color: '#ffffff', lineHeight: 1 }}>
                    {data.parallel.buy.toFixed(2)}
                  </p>
                </div>
                <div style={{ width: '1px', background: 'rgba(255,255,255,0.08)', alignSelf: 'stretch' }} />
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '13px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px', fontWeight: 700 }}>
                    VENTA
                  </p>
                  <p style={{ fontSize: '48px', fontWeight: 900, fontFamily: 'monospace', color: '#f59e0b', lineHeight: 1 }}>
                    {data.parallel.sell.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Official BCB */}
              <p style={{ margin: '16px 0 24px', fontSize: '13px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)' }}>
                Oficial BCB: <strong style={{ color: 'rgba(255,255,255,0.65)' }}>{data.official.buyRate.toFixed(2)}</strong> BOB/USD
              </p>

              {/* Sparkline */}
              <div style={{ margin: '16px 0', height: '48px' }}>
                <ResponsiveContainer width="100%" height={48}>
                  <AreaChart data={sparkData} margin={{ top: 4, right: 0, left: 0, bottom: 4 }}>
                    <defs>
                      <linearGradient id="sparkGrad2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={sparkColor} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={sparkColor} stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <Area 
                      type="monotone" dataKey="v" 
                      stroke={sparkColor} strokeWidth={2.5} 
                      fill="url(#sparkGrad2)" dot={false}
                      isAnimationActive={true} animationDuration={2000} animationEasing="ease-out"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Date */}
              <p style={{ fontSize: '13px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '16px 0' }}>
                {dateStr} · {timeStr} (Bolivia)
              </p>

              {/* Sources */}
              <p style={{ fontSize: '10px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.15)', marginTop: '12px', letterSpacing: '0.04em' }}>
                Binance · Bybit · Bitget · OKX · MEXC · Saldo · Wallbit
              </p>

               {/* Brand */}
              <p style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.04em', marginTop: '20px', color: 'rgba(255,255,255,0.7)' }}>
                DÓLAR<span style={{ color: '#f59e0b' }}>BOLIVIA</span>
              </p>

              {/* Watermark */}
              <p style={{ fontSize: '14px', fontFamily: 'monospace', color: '#60a5fa', marginTop: '8px', letterSpacing: '0.08em', fontWeight: 600 }}>
                dolarbolivia.site
              </p>

            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button onClick={handleDownload}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
                <Download size={16} /> Guardar imagen
              </button>
              <button onClick={handleShare}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '12px', borderRadius: '12px', border: '1px solid rgba(245,158,11,0.15)', background: 'rgba(245,158,11,0.08)', color: '#f59e0b', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                <Share2 size={16} /> Compartir
              </button>
            </div>

            {/* Confirmación visible: antes los botones no avisaban nada */}
            {msg && (
              <p style={{ marginTop: '10px', textAlign: 'center', fontSize: '12px', fontFamily: 'monospace', color: '#f59e0b', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: '10px', padding: '8px 10px' }}>
                {msg}
              </p>
            )}

          </div>
        </div>
      )}
    </>
  );
};

export default ShareModal;
