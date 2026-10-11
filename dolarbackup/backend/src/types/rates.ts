export interface RateItem {
  buy: number;
  sell: number;
  avg: number;
  lastUpdated: string;
}

export interface BinanceAd {
  id: string;
  merchantName: string;
  price: number;
  tradeType: 'BUY' | 'SELL';
  minAmount: number;
  maxAmount: number;
  finishRate: number; // percentage e.g. 99.4%
  completedOrders: number;
  methods: string[];
}

export interface PlatformRate {
  id: string;
  name: string;
  code: string;
  type: 'P2P Exchange' | 'Fintech' | 'Remesas';
  buyRate: number; // BOB por USD
  sellRate: number; // BOB por USD
  spread: number;
  lastUpdated: string;
  status: 'Online' | 'Inestable' | 'Mantenimiento';
  trustScore: 'Alta' | 'Media' | 'Verificada';
  minAmountBOB: number;
  paymentMethods: string[];
}

export interface OfficialRate {
  rate: number; // 6.86 BOB (compra)
  buyRate: number; // 6.86 BOB (compra)
  source: string;
  lastVerified: string;
}

export interface CityRate {
  city: string;
  code: string;
  flag: string;
  buyCash: number;
  sellCash: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
  popularPlaces: string[];
}

export interface HistoricalRatePoint {
  date: string;
  blueBuy: number;
  blueSell: number;
  official: number;
  gapPercentage: number;
}

export interface RatesDataResponse {
  official: OfficialRate;
  parallel: {
    buy: number;
    sell: number;
    avg: number;
    gapWithOfficial: number; // percentage e.g. 67.8%
    variation24h: number; // e.g. +0.02
  };
  physicalCash: {
    buy: number;
    sell: number;
    avg: number;
  };
  cityRates: CityRate[];
  lastChecked: string;
  platforms: PlatformRate[];
  binanceAds: BinanceAd[];
  sourceSummary: string;
}

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  category: 'Análisis' | 'Guías P2P' | 'Economía';
  date: string;
  readTime: string;
  author: string;
  content: string;
}