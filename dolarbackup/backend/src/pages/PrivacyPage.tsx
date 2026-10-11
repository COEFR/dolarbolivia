import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Shield, Cookie, Eye, Lock, Server, Mail } from 'lucide-react';

const PrivacyPage: React.FC = () => (
  <div className="min-h-screen bg-[#050505] bg-grid bg-grain">
    <Navbar />
    
    <main className="max-w-3xl mx-auto px-6 py-16">
      <div className="section-label mb-2">legal</div>
      <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Política de Privacidad</h1>
      <p className="text-sm text-white/40 mb-2">
        Tu privacidad es importante para nosotros. Aquí explicamos cómo recopilamos, utilizamos y protegemos tu información.
      </p>
      <p className="text-xs font-mono text-white/15 mb-10">
        Última actualización: 3 de junio de 2025
      </p>

      {/* Introducción */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <Shield size={16} className="text-amber-500/60" />
          <h2 className="text-lg font-semibold text-white">Introducción</h2>
        </div>
        <p className="text-sm text-white/40 leading-relaxed">
          En DólarBolivia respetamos tu privacidad y protegemos la información que compartís con nosotros. Esta política explica cómo recopilamos, usamos y resguardamos tus datos al navegar por nuestro sitio.
        </p>
      </section>

      {/* Información que Recopilamos */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <Eye size={16} className="text-amber-500/60" />
          <h2 className="text-lg font-semibold text-white">Información que Recopilamos</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="card-dark p-4">
            <div className="flex items-center gap-2 mb-2">
              <Server size={14} className="text-blue-400/60" />
              <h3 className="text-sm font-medium text-white/80">Información Automática</h3>
            </div>
            <ul className="space-y-1 text-xs text-white/40">
              <li>• Tipo de navegador</li>
              <li>• Páginas visitadas</li>
            </ul>
          </div>
          <div className="card-dark p-4">
            <div className="flex items-center gap-2 mb-2">
              <Mail size={14} className="text-green-400/60" />
              <h3 className="text-sm font-medium text-white/80">Información Voluntaria</h3>
            </div>
            <ul className="space-y-1 text-xs text-white/40">
              <li>• Correo electrónico (contacto)</li>
              <li>• Mensajes enviados</li>
              <li>• Preferencias de usuario</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Cookies */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <Cookie size={16} className="text-amber-500/60" />
          <h2 className="text-lg font-semibold text-white">Uso de Cookies</h2>
        </div>
        <p className="text-sm text-white/40 leading-relaxed">
          No utilizamos cookies ni tecnologías similares para mejorar tu experiencia en nuestro sitio web. Las cookies nos ayudarían a analizar el tráfico, personalizar contenido y recordar tus preferencias, pero por el momento no implementamos cookies.
        </p>
      </section>

      {/* Cómo utilizamos */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <Lock size={16} className="text-amber-500/60" />
          <h2 className="text-lg font-semibold text-white">Cómo Utilizamos tu Información</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="card-dark p-4">
            <h3 className="text-sm font-medium text-white/80 mb-2">Propósitos Principales</h3>
            <ul className="space-y-1 text-xs text-white/40">
              <li>• Mejorar nuestros servicios</li>
              <li>• Responder consultas</li>
              <li>• Garantizar seguridad</li>
            </ul>
          </div>
          <div className="card-dark p-4">
            <h3 className="text-sm font-medium text-white/80 mb-2">Compromisos</h3>
            <ul className="space-y-1 text-xs text-white/40">
              <li>• No vendemos tu información personal</li>
              <li>• No compartimos datos con terceros sin consentimiento</li>
              <li>• Utilizamos encriptación para proteger datos sensibles</li>
              <li>• Cumplimos con regulaciones de privacidad aplicables</li>
            </ul>
          </div>
        </div>
      </section>
    </main>

    <Footer />
  </div>
);

export default PrivacyPage;
