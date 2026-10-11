import { NewsItem } from '@/types/news';

export const NEWS_ITEMS: NewsItem[] = [
  {
    id: 'news-1',
    slug: 'volumen-usdt-bolivia-alcanza-record-plataformas-p2p',
    title: 'El volumen transaccionado en USDT P2P alcanza máximo histórico en Bolivia',
    summary: 'La preferencia por la criptomoneda estable Tether (USDT) sigue en aumento como alternativa principal ante la restricción de divisas físicas en el sistema financiero tradicional.',
    category: 'Crypto & USDT',
    date: 'Hace 3 horas',
    source: 'Unidad de Monitoreo DólarBolivia',
    readTime: '3 min de lectura',
    isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=800&auto=format&fit=crop&q=80', // USDT Tether Token
    content: `
### Incremento sostenido del comercio Peer-to-Peer

Durante las últimas semanas, las transacciones diarias negociadas en USDT en las plataformas **Binance P2P, Bybit y El Dorado** han alcanzado picos sin precedentes en el mercado boliviano.

Importadores, comerciantes de insumos y profesionales *freelance* han volcado sus operaciones cotidianas hacia el uso de criptoactivos estables para saldar obligaciones internacionales y resguardar su capital.

#### Factores determinantes:
1. **Cobros mediante QR Simple:** La agilidad de las transferencias bancarias locales mediante QR ha facilitado que los comerciantes liberen fondos en cuestión de minutos.
2. **Brecha de tasas reducida:** Los spreads promedio en el mercado P2P se han estrechado a solo **0.04 BOB**, aumentando la competitividad frente a las casas de cambio físicas.
3. **Restricción en tarjetas de crédito:** Las cuotas y límites diarios fijados para consumos internacionales con tarjetas de débito/crédito impulsaron a los usuarios hacia el ecosistema digital.
    `,
  },
  {
    id: 'news-2',
    slug: 'bcb-mantiene-tipo-cambio-oficial-compra',
    title: 'Banco Central de Bolivia ratifica la paridad oficial de compra en 6.86 BOB',
    summary: 'El BCB actualizó su reporte diario reafirmando el tipo de cambio oficial de compra en 6.86 BOB por dólar para operaciones del sector público e instituciones vinculadas.',
    category: 'Dólar',
    date: 'Hoy, 09:30 AM',
    source: 'Banco Central de Bolivia',
    readTime: '2 min de lectura',
    isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80', // Central Bank / Financial Building
    content: `
### Publicación oficial de cotizaciones

El Banco Central de Bolivia (BCB) ratificó a través de sus canales oficiales la vigencia de la tabla de cotizaciones oficial, manteniendo la paridad de **6.86 BOB para la compra y 6.96 BOB para la venta**.

A pesar de la brecha observada en el mercado paralelo y P2P, las operaciones de comercio exterior regulado y transferencias del Estado se mantienen bajo este marco referencial oficial.

Analistas económicos señalan que la atención del mercado financiero permanece atenta a la disponibilidad efectiva de divisas para el sector empresarial importador.
    `,
  },
  {
    id: 'news-3',
    slug: 'adopcion-pasarelas-pago-cripto-comercios-bolivianos',
    title: 'Comercios e importadores bolivianos adoptan pagos nativos en USDT',
    summary: 'Cada vez más empresas del rubro tecnológico y de repuestos automotrices aceptan liquidaciones directas en criptomonedas estables para agilizar compras a proveedores en Asia y Panamá.',
    category: 'Mercado P2P',
    date: 'Ayer',
    source: 'Redacción Financiera',
    readTime: '4 min de lectura',
    isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0a670f4a45a7?w=800&auto=format&fit=crop&q=80', // Payment POS / QR Store scan
    content: `
### Transformación en el comercio minorista y mayorista

La necesidad de agilizar importaciones sin incurrir en demoras de giros bancarios internacionales tradicionales ha llevado a pequeñas y medianas empresas (PyMEs) en **Santa Cruz, La Paz y Cochabamba** a formalizar procesos de cobro y pago con USDT.

#### Ventajas reportadas por comerciantes:
* **Inmediatez:** La confirmación de las transacciones en redes como TRON (TRC-20) o Polygon toma menos de dos minutos.
* **Sin costos de intermediación internacional:** Reducción sustancial de las comisiones de corresponsalía bancaria.
* **Seguridad P2P:** Uso de cuentas de custodia (*escrow*) garantizadas por exchanges verificados.
    `,
  },
  {
    id: 'news-4',
    slug: 'regulaciones-activos-digitales-en-latinoamerica-impacto-bolivia',
    title: 'Marco normativo regional para activos digitales: Tendencias en Sudamérica',
    summary: 'Un repaso sobre las medidas regulatorias aplicadas en países vecinos como Argentina, Perú y Brasil, y su influencia en el mercado de divisas digitales en Bolivia.',
    category: 'Regulaciones',
    date: 'Hace 2 días',
    source: 'Análisis Regulatorio DólarBolivia',
    readTime: '5 min de lectura',
    isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop&q=80', // Legal Gavel & Regulations
    content: `
### Panorama normativo de criptoactivos en la región

El uso de *stablecoins* ligadas al dólar se ha consolidado en toda América Latina como un pilar fundamental de inclusión financiera digital.

En los países vecinos, la tendencia regulatory se ha enfocado en otorgar claridad jurídica a las plataformas de intercambio (VASP), promover la verificación de identidad (KYC) y proteger a los usuarios finales.

En el caso boliviano, el interés público por entender el funcionamiento de las billeteras digitales y los mercados P2P ha impulsado campañas informativas sobre buenas prácticas de seguridad financiera.
    `,
  },
];

export function getNewsBySlug(slug: string): NewsItem | undefined {
  return NEWS_ITEMS.find((n) => n.slug === slug);
}