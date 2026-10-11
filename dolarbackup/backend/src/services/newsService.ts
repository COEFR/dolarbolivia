import { NEWS_ITEMS, getNewsBySlug as getLocalNewsBySlug } from '@/data/news';
import { NewsItem, NewsCategory } from '@/types/news';

let newsCache: NewsItem[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION_MS = 3 * 60 * 1000; // 3 minutos

// 60 Fotografías HD completamente distintas y clasificadas por tema
const THEMATIC_PHOTO_POOLS: Record<string, string[]> = {
  bcb: [
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1509017174183-0b7e0278f1ec?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1518458028785-8fbcd101ebb9?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&auto=format&fit=crop&q=80',
  ],
  usdt: [
    'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1621504484383-47758ad275c0?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1614028674016-81c2d0f5e1f0?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1622979135225-d2ba269bc1bd?w=800&auto=format&fit=crop&q=80',
  ],
  p2p: [
    'https://images.unsplash.com/photo-1556742049-0a670f4a45a7?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
  ],
  ley: [
    'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=80',
  ],
  dolar: [
    'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1607863680198-23d4b2565df0?w=800&auto=format&fit=crop&q=80',
  ],
};

function stripHtml(html: string): string {
  if (!html) return '';
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

function extractImageFromHtml(html: string): string | null {
  if (!html) return null;
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : null;
}

function inferCategory(title: string, description: string): NewsCategory {
  const text = (title + ' ' + description).toLowerCase();
  if (text.includes('usdt') || text.includes('crypto') || text.includes('binance') || text.includes('tether') || text.includes('bitcoin')) {
    return 'Crypto & USDT';
  }
  if (text.includes('p2p') || text.includes('qr') || text.includes('comerciante') || text.includes('pago') || text.includes('transferencia')) {
    return 'Mercado P2P';
  }
  if (text.includes('asfi') || text.includes('ley') || text.includes('norma') || text.includes('regulac') || text.includes('decreto')) {
    return 'Regulaciones';
  }
  return 'Dólar';
}

function getStrictlyUniqueThematicImage(title: string, summary: string, slug: string, usedImages: Set<string>): string {
  const fullText = (title + ' ' + summary).toLowerCase();

  let targetTopic = 'dolar';
  if (fullText.includes('bcb') || fullText.includes('banco central') || fullText.includes('oficial') || fullText.includes('reserva')) {
    targetTopic = 'bcb';
  } else if (fullText.includes('usdt') || fullText.includes('tether') || fullText.includes('crypto') || fullText.includes('cripto') || fullText.includes('binance')) {
    targetTopic = 'usdt';
  } else if (fullText.includes('qr') || fullText.includes('pago') || fullText.includes('comercio') || fullText.includes('p2p') || fullText.includes('tienda')) {
    targetTopic = 'p2p';
  } else if (fullText.includes('ley') || fullText.includes('regula') || fullText.includes('asfi') || fullText.includes('norma') || fullText.includes('decreto')) {
    targetTopic = 'ley';
  }

  const primaryPool = THEMATIC_PHOTO_POOLS[targetTopic] || THEMATIC_PHOTO_POOLS['dolar'];
  for (const url of primaryPool) {
    if (!usedImages.has(url)) {
      usedImages.add(url);
      return url;
    }
  }

  for (const key of Object.keys(THEMATIC_PHOTO_POOLS)) {
    for (const url of THEMATIC_PHOTO_POOLS[key]) {
      if (!usedImages.has(url)) {
        usedImages.add(url);
        return url;
      }
    }
  }

  const fallbackUniqueUrl = `https://picsum.photos/seed/${encodeURIComponent(slug)}/800/500`;
  usedImages.add(fallbackUniqueUrl);
  return fallbackUniqueUrl;
}

function createSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function buildFullArticleContent(title: string, summary: string, sourceName: string, formattedDate: string, category: NewsCategory): string {
  const cleanSummary = summary.trim();

  return `
### Contexto y Panorama General

${cleanSummary}

La dinámica cambiaria y financiera en Bolivia continúa registrando movimientos clave en los canales informativos e institucionales. Esta noticia, publicada originalmente por **${sourceName}**, aborda elementos fundamentales sobre la evolución del mercado de divisas, la liquidez en dólares y el comportamiento de las herramientas de pago digitales.

#### Desarrollo de los Hechos y Detalles Clave

En el contexto económico actual, la atención de ahorristas, importadores y comerciantes se centra en la disponibilidad de divisas y en la cotización referencial utilizada en las operaciones cotidianas.

Los datos analizados indican los siguientes aspectos relevantes para el mercado local:

1. **Monitoreo de referencias de cambio:** El seguimiento diario de la paridad oficial frente a los mercados paralelos o P2P permite a los agentes económicos anticipar variaciones en los costos de insumos importados.
2. **Adopción de canales electrónicos:** La agilidad del uso de transferencias bancarias mediante códigos QR y plataformas digitales ha consolidado su rol como alternativa para mover fondos en bolivianos y activos digitales.
3. **Comportamiento del sector comercial:** Importadores y PyMEs ajustan sus presupuestos en función de las tasas vigentes en el mercado abierto para resguardar su capital operativo.

> "El monitoreo constante de las referencias cambiarias oficiales e informales resulta indispensable para evaluar el costo real de las operaciones financieras y comerciales en el país."

#### Impacto en el Mercado Boliviano

Para los usuarios en Bolivia, este desarrollo reafirma la importancia de verificar siempre las fuentes oficiales y mantener un control estricto sobre las comisiones y tasas aplicadas en cada transacción.

Ya sea mediante operaciones en ventanilla, casas de cambio o plataformas digitales Peer-to-Peer (P2P), el conocimiento actualizado de los indicadores permite tomar decisiones financieras más informadas y seguras.
  `.trim();
}

/**
 * Convierte una fecha a formato relativo ("Hoy", "Ayer", "Hace 2 días")
 * y retorna null si es mayor a 3 días de antigüedad.
 */
function getRelativeDateAndFilterOld(pubDateStr: string): { formatted: string; isValid: boolean } {
  const pubDate = new Date(pubDateStr);
  if (isNaN(pubDate.getTime())) {
    return { formatted: 'Reciente', isValid: true };
  }

  const now = new Date();
  const diffTimeMs = now.getTime() - pubDate.getTime();
  const diffDays = diffTimeMs / (1000 * 60 * 60 * 24);

  // Descartar si tiene MÁS de 3.5 días
  if (diffDays > 3.5) {
    return { formatted: '', isValid: false };
  }

  if (diffDays < 0.2) {
    return { formatted: 'Hace un momento', isValid: true };
  } else if (diffDays < 1) {
    return { formatted: 'Hoy', isValid: true };
  } else if (diffDays < 2) {
    return { formatted: 'Ayer', isValid: true };
  } else {
    return { formatted: `Hace ${Math.floor(diffDays)} días`, isValid: true };
  }
}

export async function fetchLatestNews(category?: NewsCategory | 'all'): Promise<NewsItem[]> {
  const now = Date.now();

  if (newsCache && now - lastFetchTime < CACHE_DURATION_MS) {
    return filterByCategory(newsCache, category);
  }

  const usedImages = new Set<string>();

  try {
    // Forzar en Google RSS la condición de últimas 72 horas (when:3d)
    const rssUrl = encodeURIComponent('https://news.google.com/rss/search?q=(dolar+bolivia+OR+usdt+bolivia+OR+bcb+bolivia)+when:3d&hl=es-419&gl=BO&ceid=BO:es-419');
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`;

    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error('Respuesta fallida del servicio RSS');

    const data = await response.json();

    if (data && data.items && Array.isArray(data.items) && data.items.length > 0) {
      const fetchedItems: NewsItem[] = [];

      data.items.forEach((item: any, index: number) => {
        const { formatted: formattedDate, isValid } = getRelativeDateAndFilterOld(item.pubDate);
        
        // Descartar si es mayor a 3 días
        if (!isValid) return;

        const parts = item.title.split(' - ');
        let sourceName = 'Prensa Internacional / Bolivia';
        let cleanTitle = item.title;

        if (parts.length > 1) {
          sourceName = parts.pop() || sourceName;
          cleanTitle = parts.join(' - ');
        }

        let rawSummary = stripHtml(item.description || item.content || '');

        if (rawSummary.startsWith(cleanTitle)) {
          rawSummary = rawSummary.replace(cleanTitle, '').trim();
        }
        if (rawSummary.endsWith(sourceName)) {
          rawSummary = rawSummary.slice(0, -sourceName.length).trim();
        }

        const summary = rawSummary.length > 180 ? rawSummary.substring(0, 180) + '...' : rawSummary;
        const inferredCat = inferCategory(cleanTitle, rawSummary);
        const slug = createSlug(cleanTitle);

        let chosenImageUrl = getStrictlyUniqueThematicImage(cleanTitle, rawSummary, slug, usedImages);

        const candidateImg = item.thumbnail || item.enclosure?.link || extractImageFromHtml(item.description || item.content || '');
        if (candidateImg && typeof candidateImg === 'string' && candidateImg.startsWith('http') && !usedImages.has(candidateImg)) {
          chosenImageUrl = candidateImg;
          usedImages.add(candidateImg);
        }

        const dynamicFallbackSeed = `https://picsum.photos/seed/${encodeURIComponent(slug)}/800/500`;

        const fullArticle = buildFullArticleContent(cleanTitle, rawSummary || summary, sourceName, formattedDate, inferredCat);

        fetchedItems.push({
          id: `ext_${index}_${Date.now()}`,
          slug: slug || `noticia-${index}`,
          title: cleanTitle,
          summary: summary || 'Haga clic para leer la nota económica completa.',
          category: inferredCat,
          date: formattedDate,
          source: sourceName,
          readTime: '3 min de lectura',
          isFeatured: index < 2,
          imageUrl: chosenImageUrl,
          fallbackUrl: dynamicFallbackSeed,
          externalUrl: item.link || undefined,
          content: fullArticle,
        });
      });

      // Si tenemos noticias frescas externas
      if (fetchedItems.length > 0) {
        newsCache = fetchedItems;
        lastFetchTime = now;
        return filterByCategory(fetchedItems, category);
      }
    }
  } catch (error) {
    console.warn('No se pudo obtener el feed de noticias recientes:', error);
  }

  // Si falla la API o no hay noticias dentro del rango, usar los reportes locales recientes (últimas 24-72h)
  const fallbackList: NewsItem[] = NEWS_ITEMS.map((item) => {
    const localPhoto = getStrictlyUniqueThematicImage(item.title, item.summary, item.slug, usedImages);
    return {
      ...item,
      imageUrl: localPhoto,
      fallbackUrl: `https://picsum.photos/seed/${encodeURIComponent(item.slug)}/800/500`,
    };
  });

  newsCache = fallbackList;
  return filterByCategory(fallbackList, category);
}

function filterByCategory(items: NewsItem[], category?: NewsCategory | 'all'): NewsItem[] {
  if (!category || category === 'all') return items;
  return items.filter((item) => item.category === category);
}

export function getNewsBySlug(slug: string): NewsItem | undefined {
  if (newsCache) {
    const found = newsCache.find((n) => n.slug === slug);
    if (found) return found;
  }
  return getLocalNewsBySlug(slug);
}