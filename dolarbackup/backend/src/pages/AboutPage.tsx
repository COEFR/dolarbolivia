import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Target, Eye, Heart, Shield, Zap, Users } from 'lucide-react';

const AboutPage: React.FC = () => (
  <div className="min-h-screen bg-[#050505] bg-grid bg-grain">
    <Navbar />
    
    <main className="max-w-3xl mx-auto px-6 py-16">
      <div className="section-label mb-2">información</div>
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 text-lg font-bold">
          $
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Sobre Nosotros</h1>
          <p className="text-sm text-amber-500/60 font-mono">dólar<span className="text-white/40">bolivia</span></p>
        </div>
      </div>

      <p className="text-sm text-white/40 leading-relaxed mb-4">
        Somos una plataforma informativa especializada en proporcionar datos precisos y en tiempo real del mercado cambiario boliviano.
      </p>
      <p className="text-sm text-white/30 leading-relaxed mb-10">
        Creemos que la información económica confiable es la base para tomar decisiones financieras inteligentes.
      </p>

      {/* Misión + Visión */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        <div className="card-dark p-5">
          <div className="flex items-center gap-2 mb-3">
            <Target size={16} className="text-amber-500/60" />
            <h2 className="text-base font-semibold text-white">Nuestra Misión</h2>
          </div>
          <p className="text-xs text-white/40 leading-relaxed">
            Proporcionar información precisa, actualizada y accesible sobre el mercado cambiario boliviano, especialmente del dólar paralelo o "blue".
          </p>
          <p className="text-xs text-white/25 leading-relaxed mt-2">
            Buscamos empoderar a los ciudadanos con conocimientos económicos que les permitan tomar decisiones financieras acertadas en su día a día.
          </p>
        </div>

        <div className="card-dark p-5">
          <div className="flex items-center gap-2 mb-3">
            <Eye size={16} className="text-blue-400/60" />
            <h2 className="text-base font-semibold text-white">Nuestra Visión</h2>
          </div>
          <p className="text-xs text-white/40 leading-relaxed">
            Ser la fuente más confiable y accesible de información económica en Bolivia, especialmente en temas de cambio de divisas.
          </p>
          <p className="text-xs text-white/25 leading-relaxed mt-2">
            Contribuir al desarrollo financiero de la comunidad mediante transparencia, objetividad y veracidad en todos nuestros contenidos.
          </p>
        </div>
      </div>

      {/* Valores */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Heart size={16} className="text-amber-500/60" />
          <h2 className="text-lg font-semibold text-white">Nuestros Valores</h2>
        </div>
        <p className="text-xs text-white/30 mb-4">Basamos nuestro trabajo en principios fundamentales que nos guían cada día</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: Shield, title: 'Transparencia', desc: 'Información clara y verificable en todo momento' },
            { icon: Zap, title: 'Precisión', desc: 'Datos actualizados en tiempo real y verificados' },
            { icon: Users, title: 'Accesibilidad', desc: 'Disponible para todos sin importar su nivel' },
            { icon: Heart, title: 'Compromiso', desc: 'Dedicados al bienestar financiero comunitario' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card-dark p-4 text-center">
              <Icon size={20} className="text-amber-500/50 mx-auto mb-2" />
              <h3 className="text-sm font-medium text-white/80 mb-1">{title}</h3>
              <p className="text-[10px] text-white/30 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>

    <Footer />
  </div>
);

export default AboutPage;
