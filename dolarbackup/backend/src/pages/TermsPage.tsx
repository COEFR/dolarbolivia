import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Shield, FileText, AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

const TermsPage: React.FC = () => (
  <div className="min-h-screen bg-[#050505] bg-grid bg-grain">
    <Navbar />
    
    <main className="max-w-3xl mx-auto px-6 py-16">
      <div className="section-label mb-2">legal</div>
      <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Términos y Condiciones</h1>
      <p className="text-sm text-white/40 mb-8">
        Estos términos rigen el uso de nuestro sitio web y servicios. Por favor, léelos cuidadosamente antes de utilizar nuestra plataforma.
      </p>
      <p className="text-xs font-mono text-white/15 mb-10">
        Última actualización: 3 de junio de 2025
      </p>

      {/* Aceptación */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <FileText size={16} className="text-amber-500/60" />
          <h2 className="text-lg font-semibold text-white">Aceptación de Términos</h2>
        </div>
        <p className="text-sm text-white/40 leading-relaxed">
          Al utilizar DólarBolivia, aceptás cumplir con estos términos y condiciones. Si no estás de acuerdo, te recomendamos no usar nuestro sitio.
        </p>
      </section>

      {/* Descripción del Servicio */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <Shield size={16} className="text-amber-500/60" />
          <h2 className="text-lg font-semibold text-white">Descripción del Servicio</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="card-dark p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={14} className="text-green-400/60" />
              <h3 className="text-sm font-medium text-white/80">Lo que Ofrecemos</h3>
            </div>
            <ul className="space-y-1 text-xs text-white/40">
              <li>• Información referencial de cotizaciones</li>
              <li>• Datos del mercado paralelo de divisas</li>
              <li>• Herramientas de cálculo básicas</li>
              <li>• Análisis de tendencias históricas</li>
            </ul>
          </div>
          <div className="card-dark p-4">
            <div className="flex items-center gap-2 mb-2">
              <XCircle size={14} className="text-red-400/60" />
              <h3 className="text-sm font-medium text-white/80">Lo que NO Hacemos</h3>
            </div>
            <ul className="space-y-1 text-xs text-white/40">
              <li>• Servicios de cambio de divisas</li>
              <li>• Intermediación financiera</li>
              <li>• Asesoramiento financiero personalizado</li>
              <li>• Garantías sobre los precios mostrados</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Descargo */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={16} className="text-amber-500/60" />
          <h2 className="text-lg font-semibold text-white">Descargo de Responsabilidad</h2>
        </div>
        <div className="space-y-3 text-sm text-white/40 leading-relaxed">
          <p><strong className="text-white/60">Información Referencial:</strong> Todo el contenido proporcionado en este sitio es únicamente para fines informativos y no debe considerarse asesoramiento financiero, legal o profesional.</p>
          <p><strong className="text-white/60">No Garantizamos Precisión:</strong> Aunque nos esforzamos por mantener la información actualizada, no garantizamos la exactitud, completitud o actualidad de los datos mostrados.</p>
          <p><strong className="text-white/60">Decisiones Financieras:</strong> Cualquier decisión financiera que tome basada en la información de este sitio es bajo su propia responsabilidad y riesgo.</p>
        </div>
      </section>

      {/* Responsabilidades */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <Shield size={16} className="text-amber-500/60" />
          <h2 className="text-lg font-semibold text-white">Responsabilidades del Usuario</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="card-dark p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={14} className="text-green-400/60" />
              <h3 className="text-sm font-medium text-white/80">Uso Permitido</h3>
            </div>
            <ul className="space-y-1 text-xs text-white/40">
              <li>• Consultar información de referencia</li>
              <li>• Utilizar herramientas de cálculo</li>
              <li>• Compartir enlaces del sitio</li>
            </ul>
          </div>
          <div className="card-dark p-4">
            <div className="flex items-center gap-2 mb-2">
              <XCircle size={14} className="text-red-400/60" />
              <h3 className="text-sm font-medium text-white/80">Uso Prohibido</h3>
            </div>
            <ul className="space-y-1 text-xs text-white/40">
              <li>• Copiar contenido sin autorización</li>
              <li>• Intentar vulnerar la seguridad</li>
              <li>• Usar la información para actividades ilegales</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Modificaciones */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <RefreshCw size={16} className="text-amber-500/60" />
          <h2 className="text-lg font-semibold text-white">Modificaciones de los Términos</h2>
        </div>
        <p className="text-sm text-white/40 leading-relaxed">
          Nos reservamos el derecho de modificar estos términos en cualquier momento sin previo aviso. Es su responsabilidad revisar periódicamente esta página para estar al tanto de cualquier cambio. El uso continuado del sitio después de la publicación de cambios constituye su aceptación de los nuevos términos.
        </p>
        <p className="text-sm text-white/20 mt-3 italic">
          Recomendación: Guarde esta página en sus favoritos y revísela ocasionalmente para mantenerse informado.
        </p>
      </section>
    </main>

    <Footer />
  </div>
);

export default TermsPage;
