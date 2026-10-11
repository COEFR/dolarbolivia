export type NewsCategory = 'Dólar' | 'Crypto & USDT' | 'Mercado P2P' | 'Regulaciones';

export interface NewsItem {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: NewsCategory;
  date: string;
  source: string;
  readTime: string;
  content: string;
  isFeatured?: boolean;
  imageUrl?: string;
  fallbackUrl?: string;
  externalUrl?: string;
}