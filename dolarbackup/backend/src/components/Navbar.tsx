import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavbarProps {
  lastChecked?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ lastChecked, onRefresh, isRefreshing = false }) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  const links = [
    { to: '/', label: 'Cotización' },
    { to: '/plataformas', label: 'P2P' },
    { to: '/noticias', label: 'Noticias' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        
        {/* Logo — ultra minimal */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-sm font-bold tracking-tight text-white">
            dólar<span className="text-amber-500">bolivia</span>
          </span>
        </Link>

        {/* Nav — code style */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`px-3 py-1.5 rounded text-[13px] transition-all ${
                isActive(to)
                  ? 'text-white bg-white/[0.06] font-medium'
                  : 'text-white/30 hover:text-white/60'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Status dot */}
        <div className="flex items-center gap-3">
          {lastChecked && (
            <span className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-white/20">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500/60 animate-pulse-subtle" />
              {lastChecked}
            </span>
          )}
          {onRefresh && (
            <button onClick={onRefresh} disabled={isRefreshing}
              className="text-white/25 hover:text-white/60 transition-colors text-[10px] font-mono bg-white/[0.03] hover:bg-white/[0.06] px-2.5 py-1.5 rounded-md border border-white/[0.04] disabled:opacity-20">
              {isRefreshing ? '···' : '↻'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
