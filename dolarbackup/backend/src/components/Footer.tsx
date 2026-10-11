import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

interface FooterProps {
  officialRate?: number;
  lastVerified?: string;
}

export const Footer: React.FC<FooterProps> = ({ officialRate, lastVerified }) => (
  <footer className="border-t border-white/[0.04] mt-16">
    <div className="max-w-5xl mx-auto px-6 py-12">
      
      {/* Grid: 4 columns matching the reference */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-8 border-b border-white/[0.05]">
        
        {/* Col 1: Brand + BCB */}
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              dólar<span className="text-amber-500">bolivia</span>
            </h3>
            <p className="text-xs text-white/30 mt-1">Información de Criptomonedas P2P</p>
          </div>
          <p className="text-[11px] text-white/25 leading-relaxed">
            Plataforma informativa especializada en cotizaciones de USDT/BOB basadas en mercados P2P de criptomonedas. Datos obtenidos de plataformas de intercambio digital verificadas.
          </p>
          
          {/* BCB */}
          <div className="pt-4 border-t border-white/[0.04]">
            <p className="text-[11px] text-white/30 mb-1">Tipo de Cambio BCB</p>
            <p className="text-xs font-bold text-blue-400/60 tracking-wider uppercase">OFICIAL UNIFICADO</p>
            {officialRate && (
              <p className="text-xl font-bold font-mono text-white/80 mt-0.5">Bs {officialRate.toFixed(2)}</p>
            )}
            <p className="text-[10px] text-white/18 mt-1">Fuente: Banco Central de Bolivia</p>
          </div>
        </div>

        {/* Col 2: Aviso Legal + Patrocinado */}
        <div className="space-y-4">
          <div className="flex items-start gap-2">
            <Shield size={14} className="text-amber-500/30 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-white/25 mb-1">Aviso Legal</p>
              <p className="text-[10px] text-white/15 leading-relaxed">
                Las cotizaciones mostradas son precios referenciales obtenidos de plataformas de intercambio P2P de criptomonedas (USDT). No constituyen asesoramiento financiero.
              </p>
            </div>
          </div>
          <div className="pt-2 border-t border-white/[0.04]">
            <p className="text-[10px] text-white/18">Contenido Patrocinado:</p>
            <p className="text-[9px] text-white/10 mt-0.5 leading-relaxed">
              Este sitio incluye información promocionada por Airtm, El Dorado y Takenos. Las cotizaciones reflejan precios P2P en sus plataformas.
            </p>
          </div>
        </div>

        {/* Col 3: Información + Legal */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <span className="w-1 h-1 rounded-full bg-amber-500/30" />
              <h4 className="text-[10px] font-semibold uppercase tracking-wider text-white/25">Información</h4>
            </div>
            <div className="space-y-1 text-xs text-white/30">
              <Link to="/transparencia" className="block hover:text-amber-500/60 transition-colors">Fuentes de Datos</Link>
              <Link to="/sobre-nosotros" className="block hover:text-amber-500/60 transition-colors">Sobre Nosotros</Link>
            </div>
          </div>
          <div className="pt-2">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="w-1 h-1 rounded-full bg-amber-500/30" />
              <h4 className="text-[10px] font-semibold uppercase tracking-wider text-white/25">Legal</h4>
            </div>
            <div className="space-y-1 text-xs text-white/30">
              <Link to="/terminos" className="block hover:text-amber-500/60 transition-colors">Términos de Uso</Link>
              <Link to="/privacidad" className="block hover:text-amber-500/60 transition-colors">Privacidad</Link>
            </div>
          </div>
        </div>

        {/* Col 4: Contacto */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="w-1 h-1 rounded-full bg-amber-500/30" />
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-white/25">Contacto</h4>
          </div>
          <a href="mailto:info@dolarbolivia.com" className="text-xs text-white/20 hover:text-amber-500/60 transition-colors">
            info@dolarbolivia.com
          </a>
        </div>
      </div>

      {/* Bottom */}
      <div className="pt-5 text-center">
        <p className="text-[10px] font-mono text-white/10">
          © {new Date().getFullYear()} DólarBolivia
        </p>
      </div>
    </div>
  </footer>
);
