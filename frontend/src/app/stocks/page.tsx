'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, Newspaper, PieChart,
  Search, ArrowUpRight, ArrowDownRight, RefreshCw, Plus, Trash2, Activity, Building2,
  Bell, Filter, Info, ShieldCheck, Zap, Sliders, Check, BarChart2,
  Compass, Moon, Sparkles, Calendar, Layers, Scale, FileText, Award, Flame, Crosshair
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface FinancialStatement {
  revenue: string;
  netProfit: string;
  grossMargin: string;
  operatingMargin: string;
  totalAssets: string;
  totalLiabilities: string;
  equity: string;
  cashEquivalents: string;
  operatingCashFlow: string;
  freeCashFlow: string;
  der: number;
  currentRatio: number;
}

interface AstronacciAnalysis {
  climaxDate: string;
  planetaryPhenomenon: string;
  timeClusterBarCount: number;
  timeCycleSignal: 'BULLISH REVERSAL' | 'BEARISH CLIMAX' | 'ACCUMULATION WINDOW' | 'BREAKOUT WINDOW';
  fibSupport38: number;
  fibSupport50: number;
  fibResistance61: number;
  fibResistance100: number;
  astroDescription: string;
}

interface StockItem {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  high: number;
  low: number;
  marketCap: string;
  per: number;
  pbv: number;
  roe: number;
  divYield: number;
  targetPrice: number;
  recommendation: 'STRONG BUY' | 'BUY' | 'HOLD' | 'SELL' | 'SPECULATIVE BUY';
  chartData: { time: string; price: number }[];
  financials: FinancialStatement;
  altmanZScore: number;
  piotroskiFScore: number;
  dcfFairValue: number;
  astronacci: AstronacciAnalysis;
}

interface OrderBookLevel {
  bidQty: number;
  bidPrice: number;
  offerPrice: number;
  offerQty: number;
}

interface PortfolioItem {
  id: string;
  symbol: string;
  shares: number;
  avgPrice: number;
}

interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'ABOVE' | 'BELOW';
  triggered: boolean;
}

const PRESET_EMITEN_CATALOG: Omit<StockItem, 'chartData'>[] = [
  {
    symbol: 'BBCA',
    name: 'Bank Central Asia Tbk',
    sector: 'Banking',
    price: 10250,
    change: 150,
    changePercent: 1.48,
    volume: '84.2M',
    high: 10300,
    low: 10100,
    marketCap: '1,263 T',
    per: 24.5,
    pbv: 4.8,
    roe: 21.2,
    divYield: 2.8,
    targetPrice: 11500,
    recommendation: 'BUY',
    financials: {
      revenue: 'Rp 102.5 Triliun',
      netProfit: 'Rp 48.6 Triliun',
      grossMargin: '78.4%',
      operatingMargin: '56.2%',
      totalAssets: 'Rp 1,380 Triliun',
      totalLiabilities: 'Rp 1,140 Triliun',
      equity: 'Rp 240 Triliun',
      cashEquivalents: 'Rp 75.4 Triliun',
      operatingCashFlow: 'Rp 52.1 Triliun',
      freeCashFlow: 'Rp 44.8 Triliun',
      der: 0.65,
      currentRatio: 1.85,
    },
    altmanZScore: 3.85,
    piotroskiFScore: 8,
    dcfFairValue: 11850,
    astronacci: {
      climaxDate: '24 September 2026',
      planetaryPhenomenon: 'Sun-Mercury Alignment & Full Moon Cluster',
      timeClusterBarCount: 21,
      timeCycleSignal: 'BULLISH REVERSAL',
      fibSupport38: 9850,
      fibSupport50: 10050,
      fibResistance61: 10800,
      fibResistance100: 11500,
      astroDescription: 'Siklus waktu Astronacci mengindikasikan akumulasi pada window 21 hari dengan konfluensi Full Moon Reversal.'
    }
  },
  {
    symbol: 'BBRI',
    name: 'Bank Rakyat Indonesia Tbk',
    sector: 'Banking',
    price: 5425,
    change: -50,
    changePercent: -0.91,
    volume: '112.5M',
    high: 5500,
    low: 5400,
    marketCap: '822 T',
    per: 13.8,
    pbv: 2.6,
    roe: 18.5,
    divYield: 5.4,
    targetPrice: 6200,
    recommendation: 'BUY',
    financials: {
      revenue: 'Rp 185.2 Triliun',
      netProfit: 'Rp 60.4 Triliun',
      grossMargin: '74.1%',
      operatingMargin: '42.5%',
      totalAssets: 'Rp 1,965 Triliun',
      totalLiabilities: 'Rp 1,650 Triliun',
      equity: 'Rp 315 Triliun',
      cashEquivalents: 'Rp 92.0 Triliun',
      operatingCashFlow: 'Rp 64.5 Triliun',
      freeCashFlow: 'Rp 58.2 Triliun',
      der: 0.72,
      currentRatio: 1.62,
    },
    altmanZScore: 3.42,
    piotroskiFScore: 7,
    dcfFairValue: 6450,
    astronacci: {
      climaxDate: '28 September 2026',
      planetaryPhenomenon: 'Jupiter Direct Motion & Moon-Venus Trine',
      timeClusterBarCount: 34,
      timeCycleSignal: 'ACCUMULATION WINDOW',
      fibSupport38: 5200,
      fibSupport50: 5350,
      fibResistance61: 5800,
      fibResistance100: 6300,
      astroDescription: 'Astronacci Time Cycle mendeteksi akumulasi di support Fibonacci 38.2% menjelang fenomena Jupiter Direct.'
    }
  },
  {
    symbol: 'BMRI',
    name: 'Bank Mandiri Tbk',
    sector: 'Banking',
    price: 7100,
    change: 100,
    changePercent: 1.43,
    volume: '68.4M',
    high: 7150,
    low: 7000,
    marketCap: '662 T',
    per: 11.9,
    pbv: 2.1,
    roe: 19.8,
    divYield: 5.1,
    targetPrice: 8000,
    recommendation: 'STRONG BUY',
    financials: {
      revenue: 'Rp 160.8 Triliun',
      netProfit: 'Rp 55.1 Triliun',
      grossMargin: '72.8%',
      operatingMargin: '48.9%',
      totalAssets: 'Rp 2,174 Triliun',
      totalLiabilities: 'Rp 1,840 Triliun',
      equity: 'Rp 334 Triliun',
      cashEquivalents: 'Rp 88.5 Triliun',
      operatingCashFlow: 'Rp 59.2 Triliun',
      freeCashFlow: 'Rp 51.0 Triliun',
      der: 0.68,
      currentRatio: 1.70,
    },
    altmanZScore: 3.65,
    piotroskiFScore: 9,
    dcfFairValue: 8300,
    astronacci: {
      climaxDate: '02 Oktober 2026',
      planetaryPhenomenon: 'Saturn-Mars Harmonic Square',
      timeClusterBarCount: 13,
      timeCycleSignal: 'BREAKOUT WINDOW',
      fibSupport38: 6800,
      fibSupport50: 7000,
      fibResistance61: 7600,
      fibResistance100: 8200,
      astroDescription: 'Siklus waktu menunjukkan konfirmasi breakout di atas Fibonacci 61.8% didukung aspek harmonis planet.'
    }
  },
  {
    symbol: 'BBNI',
    name: 'Bank Negara Indonesia Tbk',
    sector: 'Banking',
    price: 5650,
    change: 75,
    changePercent: 1.35,
    volume: '42.1M',
    high: 5700,
    low: 5550,
    marketCap: '210 T',
    per: 9.8,
    pbv: 1.3,
    roe: 15.2,
    divYield: 5.8,
    targetPrice: 6500,
    recommendation: 'BUY',
    financials: {
      revenue: 'Rp 88.4 Triliun',
      netProfit: 'Rp 21.2 Triliun',
      grossMargin: '68.5%',
      operatingMargin: '38.4%',
      totalAssets: 'Rp 1,085 Triliun',
      totalLiabilities: 'Rp 925 Triliun',
      equity: 'Rp 160 Triliun',
      cashEquivalents: 'Rp 42.1 Triliun',
      operatingCashFlow: 'Rp 23.5 Triliun',
      freeCashFlow: 'Rp 19.8 Triliun',
      der: 0.81,
      currentRatio: 1.55,
    },
    altmanZScore: 3.10,
    piotroskiFScore: 7,
    dcfFairValue: 6750,
    astronacci: {
      climaxDate: '10 Oktober 2026',
      planetaryPhenomenon: 'Mercury Ingress Scorpio',
      timeClusterBarCount: 55,
      timeCycleSignal: 'BULLISH REVERSAL',
      fibSupport38: 5400,
      fibSupport50: 5550,
      fibResistance61: 6100,
      fibResistance100: 6600,
      astroDescription: 'Astro cycle 55-bar count menandai pembalikan arah naik dari dasar area support.'
    }
  },
  {
    symbol: 'TLKM',
    name: 'Telkom Indonesia Tbk',
    sector: 'Telecommunication',
    price: 3680,
    change: 80,
    changePercent: 2.22,
    volume: '65.1M',
    high: 3700,
    low: 3600,
    marketCap: '364 T',
    per: 14.2,
    pbv: 2.8,
    roe: 17.1,
    divYield: 4.9,
    targetPrice: 4200,
    recommendation: 'HOLD',
    financials: {
      revenue: 'Rp 149.2 Triliun',
      netProfit: 'Rp 24.5 Triliun',
      grossMargin: '62.4%',
      operatingMargin: '31.5%',
      totalAssets: 'Rp 287 Triliun',
      totalLiabilities: 'Rp 135 Triliun',
      equity: 'Rp 152 Triliun',
      cashEquivalents: 'Rp 31.8 Triliun',
      operatingCashFlow: 'Rp 38.2 Triliun',
      freeCashFlow: 'Rp 22.4 Triliun',
      der: 0.88,
      currentRatio: 1.35,
    },
    altmanZScore: 3.25,
    piotroskiFScore: 6,
    dcfFairValue: 4350,
    astronacci: {
      climaxDate: '15 Oktober 2026',
      planetaryPhenomenon: 'Venus Sextile Neptune',
      timeClusterBarCount: 21,
      timeCycleSignal: 'ACCUMULATION WINDOW',
      fibSupport38: 3500,
      fibSupport50: 3620,
      fibResistance61: 3950,
      fibResistance100: 4300,
      astroDescription: 'Siklus waktu telekomunikasi mendukung fase akumulasi menyambut tren digital Kuartal IV.'
    }
  },
  {
    symbol: 'ASII',
    name: 'Astra International Tbk',
    sector: 'Automotive & Conglomerate',
    price: 5125,
    change: 25,
    changePercent: 0.49,
    volume: '38.9M',
    high: 5200,
    low: 5075,
    marketCap: '207 T',
    per: 6.8,
    pbv: 1.1,
    roe: 16.4,
    divYield: 8.2,
    targetPrice: 6000,
    recommendation: 'BUY',
    financials: {
      revenue: 'Rp 315.4 Triliun',
      netProfit: 'Rp 33.8 Triliun',
      grossMargin: '21.5%',
      operatingMargin: '14.2%',
      totalAssets: 'Rp 445 Triliun',
      totalLiabilities: 'Rp 205 Triliun',
      equity: 'Rp 240 Triliun',
      cashEquivalents: 'Rp 48.0 Triliun',
      operatingCashFlow: 'Rp 36.4 Triliun',
      freeCashFlow: 'Rp 28.1 Triliun',
      der: 0.85,
      currentRatio: 1.48,
    },
    altmanZScore: 2.95,
    piotroskiFScore: 8,
    dcfFairValue: 6200,
    astronacci: {
      climaxDate: '20 Oktober 2026',
      planetaryPhenomenon: 'New Moon Eclipse Window',
      timeClusterBarCount: 34,
      timeCycleSignal: 'BULLISH REVERSAL',
      fibSupport38: 4950,
      fibSupport50: 5050,
      fibResistance61: 5500,
      fibResistance100: 6100,
      astroDescription: 'Fase New Moon Eclipse menandai awal dari kenaikan siklus otomotif jangka menengah.'
    }
  },
  {
    symbol: 'UNVR',
    name: 'Unilever Indonesia Tbk',
    sector: 'Consumer Goods',
    price: 2850,
    change: -30,
    changePercent: -1.04,
    volume: '22.4M',
    high: 2900,
    low: 2820,
    marketCap: '108 T',
    per: 21.0,
    pbv: 28.5,
    roe: 78.0,
    divYield: 4.1,
    targetPrice: 3200,
    recommendation: 'HOLD',
    financials: {
      revenue: 'Rp 38.6 Triliun',
      netProfit: 'Rp 4.8 Triliun',
      grossMargin: '49.2%',
      operatingMargin: '16.5%',
      totalAssets: 'Rp 16.8 Triliun',
      totalLiabilities: 'Rp 13.2 Triliun',
      equity: 'Rp 3.6 Triliun',
      cashEquivalents: 'Rp 1.2 Triliun',
      operatingCashFlow: 'Rp 5.2 Triliun',
      freeCashFlow: 'Rp 4.4 Triliun',
      der: 3.66,
      currentRatio: 0.72,
    },
    altmanZScore: 2.80,
    piotroskiFScore: 5,
    dcfFairValue: 3100,
    astronacci: {
      climaxDate: '25 Oktober 2026',
      planetaryPhenomenon: 'Mercury Retrograde Shadow',
      timeClusterBarCount: 13,
      timeCycleSignal: 'ACCUMULATION WINDOW',
      fibSupport38: 2750,
      fibSupport50: 2820,
      fibResistance61: 3050,
      fibResistance100: 3300,
      astroDescription: 'Siklus waktu konsumen menunjukkan konsolidasi harga dekat area Fib 50.0%.'
    }
  },
  {
    symbol: 'GOTO',
    name: 'GoTo Gojek Tokopedia Tbk',
    sector: 'Technology',
    price: 62,
    change: 2,
    changePercent: 3.33,
    volume: '480.5M',
    high: 64,
    low: 60,
    marketCap: '74 T',
    per: -12.4,
    pbv: 0.8,
    roe: -8.5,
    divYield: 0.0,
    targetPrice: 85,
    recommendation: 'SPECULATIVE BUY',
    financials: {
      revenue: 'Rp 14.8 Triliun',
      netProfit: '-Rp 2.4 Triliun',
      grossMargin: '38.0%',
      operatingMargin: '-18.2%',
      totalAssets: 'Rp 125 Triliun',
      totalLiabilities: 'Rp 28 Triliun',
      equity: 'Rp 97 Triliun',
      cashEquivalents: 'Rp 23.5 Triliun',
      operatingCashFlow: 'Rp 1.2 Triliun',
      freeCashFlow: 'Rp 0.8 Triliun',
      der: 0.28,
      currentRatio: 2.10,
    },
    altmanZScore: 2.40,
    piotroskiFScore: 6,
    dcfFairValue: 90,
    astronacci: {
      climaxDate: '01 November 2026',
      planetaryPhenomenon: 'Uranus Opposition Sun',
      timeClusterBarCount: 55,
      timeCycleSignal: 'BREAKOUT WINDOW',
      fibSupport38: 58,
      fibSupport50: 61,
      fibResistance61: 72,
      fibResistance100: 88,
      astroDescription: 'Oposisi Uranus memicu lonjakan volatilitas dan potensi spekulasi rally pada sektor teknologi.'
    }
  },
  {
    symbol: 'AMMN',
    name: 'Amman Mineral Internasional Tbk',
    sector: 'Mining & Metals',
    price: 11800,
    change: 350,
    changePercent: 3.06,
    volume: '51.2M',
    high: 11950,
    low: 11450,
    marketCap: '855 T',
    per: 45.2,
    pbv: 7.2,
    roe: 15.8,
    divYield: 0.8,
    targetPrice: 13500,
    recommendation: 'BUY',
    financials: {
      revenue: 'Rp 42.5 Triliun',
      netProfit: 'Rp 14.2 Triliun',
      grossMargin: '58.4%',
      operatingMargin: '42.1%',
      totalAssets: 'Rp 168 Triliun',
      totalLiabilities: 'Rp 65 Triliun',
      equity: 'Rp 103 Triliun',
      cashEquivalents: 'Rp 18.2 Triliun',
      operatingCashFlow: 'Rp 16.5 Triliun',
      freeCashFlow: 'Rp 12.0 Triliun',
      der: 0.63,
      currentRatio: 1.80,
    },
    altmanZScore: 3.90,
    piotroskiFScore: 8,
    dcfFairValue: 13800,
    astronacci: {
      climaxDate: '05 November 2026',
      planetaryPhenomenon: 'Mars Trine Pluto Metal Cycle',
      timeClusterBarCount: 21,
      timeCycleSignal: 'BULLISH REVERSAL',
      fibSupport38: 11200,
      fibSupport50: 11500,
      fibResistance61: 12400,
      fibResistance100: 13600,
      astroDescription: 'Mars-Pluto Trine menandakan siklus penguatan komoditas tembaga dan emas.'
    }
  },
  {
    symbol: 'ADRO',
    name: 'Adaro Energy Indonesia Tbk',
    sector: 'Energy & Coal',
    price: 3480,
    change: 120,
    changePercent: 3.57,
    volume: '77.8M',
    high: 3510,
    low: 3360,
    marketCap: '111 T',
    per: 4.2,
    pbv: 0.9,
    roe: 24.1,
    divYield: 14.5,
    targetPrice: 4000,
    recommendation: 'STRONG BUY',
    financials: {
      revenue: 'Rp 98.2 Triliun',
      netProfit: 'Rp 24.1 Triliun',
      grossMargin: '48.1%',
      operatingMargin: '35.6%',
      totalAssets: 'Rp 155 Triliun',
      totalLiabilities: 'Rp 42 Triliun',
      equity: 'Rp 113 Triliun',
      cashEquivalents: 'Rp 38.5 Triliun',
      operatingCashFlow: 'Rp 28.4 Triliun',
      freeCashFlow: 'Rp 24.2 Triliun',
      der: 0.37,
      currentRatio: 2.25,
    },
    altmanZScore: 4.10,
    piotroskiFScore: 9,
    dcfFairValue: 4200,
    astronacci: {
      climaxDate: '12 November 2026',
      planetaryPhenomenon: 'Sun Trine Neptune Energy Peak',
      timeClusterBarCount: 34,
      timeCycleSignal: 'BREAKOUT WINDOW',
      fibSupport38: 3300,
      fibSupport50: 3420,
      fibResistance61: 3750,
      fibResistance100: 4100,
      astroDescription: 'Siklus energi memasuki puncak waktu dengan imbal hasil dividen super jumbo.'
    }
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    sector: 'Global Tech & AI',
    price: 124.5,
    change: 4.25,
    changePercent: 3.53,
    volume: '48.9M',
    high: 125.8,
    low: 120.1,
    marketCap: '3.06 T USD',
    per: 72.4,
    pbv: 48.1,
    roe: 85.0,
    divYield: 0.08,
    targetPrice: 145,
    recommendation: 'STRONG BUY',
    financials: {
      revenue: '$96.3 Miliar',
      netProfit: '$53.0 Miliar',
      grossMargin: '75.2%',
      operatingMargin: '62.4%',
      totalAssets: '$85.2 Miliar',
      totalLiabilities: '$24.8 Miliar',
      equity: '$60.4 Miliar',
      cashEquivalents: '$31.4 Miliar',
      operatingCashFlow: '$40.5 Miliar',
      freeCashFlow: '$38.2 Miliar',
      der: 0.41,
      currentRatio: 3.40,
    },
    altmanZScore: 8.20,
    piotroskiFScore: 9,
    dcfFairValue: 152,
    astronacci: {
      climaxDate: '18 November 2026',
      planetaryPhenomenon: 'Mercury-Jupiter AI Conjunction',
      timeClusterBarCount: 21,
      timeCycleSignal: 'BULLISH REVERSAL',
      fibSupport38: 118,
      fibSupport50: 122,
      fibResistance61: 134,
      fibResistance100: 148,
      astroDescription: 'Siklus konjungsi Merkurius-Yupiter memicu babak baru penguatan sektor AI global.'
    }
  },
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    sector: 'Global Tech & Hardware',
    price: 220.8,
    change: 1.5,
    changePercent: 0.68,
    volume: '32.1M',
    high: 222.5,
    low: 218.4,
    marketCap: '3.38 T USD',
    per: 33.1,
    pbv: 42.0,
    roe: 140.0,
    divYield: 0.45,
    targetPrice: 245,
    recommendation: 'BUY',
    financials: {
      revenue: '$385.6 Miliar',
      netProfit: '$100.9 Miliar',
      grossMargin: '46.2%',
      operatingMargin: '30.8%',
      totalAssets: '$352.5 Miliar',
      totalLiabilities: '$278.4 Miliar',
      equity: '$74.1 Miliar',
      cashEquivalents: '$61.5 Miliar',
      operatingCashFlow: '$110.5 Miliar',
      freeCashFlow: '$98.2 Miliar',
      der: 3.75,
      currentRatio: 0.98,
    },
    altmanZScore: 5.10,
    piotroskiFScore: 8,
    dcfFairValue: 250,
    astronacci: {
      climaxDate: '22 November 2026',
      planetaryPhenomenon: 'Full Moon Sun Alignment',
      timeClusterBarCount: 34,
      timeCycleSignal: 'ACCUMULATION WINDOW',
      fibSupport38: 212,
      fibSupport50: 218,
      fibResistance61: 232,
      fibResistance100: 248,
      astroDescription: 'Siklus waktu konsumer global menunjukkan akumulasi bertahap menuju liburan akhir tahun.'
    }
  },
  {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    sector: 'Global EV & Tech',
    price: 238.2,
    change: -3.8,
    changePercent: -1.57,
    volume: '55.6M',
    high: 245.0,
    low: 234.1,
    marketCap: '760 B USD',
    per: 61.5,
    pbv: 11.2,
    roe: 18.2,
    divYield: 0.0,
    targetPrice: 280,
    recommendation: 'HOLD',
    financials: {
      revenue: '$96.8 Miliar',
      netProfit: '$15.0 Miliar',
      grossMargin: '18.2%',
      operatingMargin: '9.5%',
      totalAssets: '$106.8 Miliar',
      totalLiabilities: '$43.2 Miliar',
      equity: '$63.6 Miliar',
      cashEquivalents: '$29.1 Miliar',
      operatingCashFlow: '$13.2 Miliar',
      freeCashFlow: '$4.4 Miliar',
      der: 0.67,
      currentRatio: 1.72,
    },
    altmanZScore: 4.80,
    piotroskiFScore: 7,
    dcfFairValue: 265,
    astronacci: {
      climaxDate: '28 November 2026',
      planetaryPhenomenon: 'Mars Opposition Pluto Volatility',
      timeClusterBarCount: 55,
      timeCycleSignal: 'BREAKOUT WINDOW',
      fibSupport38: 225,
      fibSupport50: 235,
      fibResistance61: 258,
      fibResistance100: 285,
      astroDescription: 'Oposisi Mars-Pluto memicu pergerakan impulsif di luar area konsolidasi saat ini.'
    }
  }
];

export default function StocksPage() {
  const [activeTab, setActiveTab] = useState<'screener' | 'chart' | 'fundamentals' | 'astronacci' | 'orderbook' | 'portfolio' | 'news' | 'alerts'>('screener');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BBCA');
  const [searchQuery, setSearchQuery] = useState('');
  const [sectorFilter, setSectorFilter] = useState<string>('ALL');
  const [isRealtimeActive, setIsRealtimeActive] = useState<boolean>(true);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showCatalogModal, setShowCatalogModal] = useState<boolean>(false);

  // Form state for adding custom emiten
  const [newSymbol, setNewSymbol] = useState('');
  const [newName, setNewName] = useState('');
  const [newSector, setNewSector] = useState('Banking');
  const [newPrice, setNewPrice] = useState<number>(5000);
  const [newMarketCap, setNewMarketCap] = useState('150 T');
  const [newPer, setNewPer] = useState<number>(15);
  const [newPbv, setNewPbv] = useState<number>(2.0);
  const [newTargetPrice, setNewTargetPrice] = useState<number>(6000);

  // Form state for alert
  const [alertTargetPrice, setAlertTargetPrice] = useState<number>(10000);
  const [alertCondition, setAlertCondition] = useState<'ABOVE' | 'BELOW'>('BELOW');

  // Initial Stock Market Watchlist
  const [stocks, setStocks] = useState<StockItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nexus_stock_watchlist');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { console.error(e); }
      }
    }
    return PRESET_EMITEN_CATALOG.slice(0, 5).map(item => ({
      ...item,
      chartData: [
        { time: '09:00', price: item.price * 0.98 },
        { time: '10:00', price: item.price * 0.99 },
        { time: '11:00', price: item.price * 1.01 },
        { time: '12:00', price: item.price * 0.995 },
        { time: '14:00', price: item.price * 1.005 },
        { time: '15:00', price: item.price },
      ]
    }));
  });

  // Price alerts state
  const [alerts, setAlerts] = useState<PriceAlert[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nexus_stock_alerts');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { console.error(e); }
      }
    }
    return [
      { id: '1', symbol: 'BBCA', targetPrice: 10000, condition: 'BELOW', triggered: false },
      { id: '2', symbol: 'TLKM', targetPrice: 3800, condition: 'ABOVE', triggered: false }
    ];
  });

  // Orderbook Depth State
  const [orderBookData, setOrderBookData] = useState<OrderBookLevel[]>([
    { bidQty: 45210, bidPrice: 10250, offerPrice: 10275, offerQty: 18450 },
    { bidQty: 68100, bidPrice: 10225, offerPrice: 10300, offerQty: 34120 },
    { bidQty: 92400, bidPrice: 10200, offerPrice: 10325, offerQty: 51200 },
    { bidQty: 120500, bidPrice: 10175, offerPrice: 10350, offerQty: 74200 },
    { bidQty: 154000, bidPrice: 10150, offerPrice: 10375, offerQty: 89100 },
  ]);

  // Portfolio Holdings State
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nexus_stock_portfolio');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { console.error(e); }
      }
    }
    return [
      { id: '1', symbol: 'BBCA', shares: 5000, avgPrice: 9800 },
      { id: '2', symbol: 'TLKM', shares: 10000, avgPrice: 3500 },
    ];
  });

  const [buySymbol, setBuySymbol] = useState('BBCA');
  const [buyShares, setBuyShares] = useState(1000);
  const [buyPrice, setBuyPrice] = useState(10250);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('nexus_stock_watchlist', JSON.stringify(stocks));
  }, [stocks]);

  useEffect(() => {
    localStorage.setItem('nexus_stock_portfolio', JSON.stringify(portfolio));
  }, [portfolio]);

  useEffect(() => {
    localStorage.setItem('nexus_stock_alerts', JSON.stringify(alerts));
  }, [alerts]);

  // REAL-TIME STREAMING TICK ENGINE
  useEffect(() => {
    if (!isRealtimeActive) return;

    const interval = setInterval(() => {
      setStocks((prevStocks) =>
        prevStocks.map((stock) => {
          const deltaPercent = (Math.random() - 0.48) * 0.012;
          const deltaPrice = Math.round(stock.price * deltaPercent);
          const newPrice = Math.max(1, stock.price + (['NVDA', 'AAPL', 'TSLA'].includes(stock.symbol) ? Number((deltaPercent * 10).toFixed(2)) : deltaPrice));
          const newChange = Number((newPrice - (stock.price - stock.change)).toFixed(2));
          const newChangePercent = Number(((newChange / Math.max(1, newPrice - newChange)) * 100).toFixed(2));

          const currentTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

          const updatedChart = [
            ...stock.chartData.slice(-12),
            { time: currentTimeStr, price: newPrice },
          ];

          // Check alerts
          setAlerts((prevAlerts) =>
            prevAlerts.map((alert) => {
              if (alert.symbol === stock.symbol && !alert.triggered) {
                if (alert.condition === 'BELOW' && newPrice <= alert.targetPrice) {
                  return { ...alert, triggered: true };
                }
                if (alert.condition === 'ABOVE' && newPrice >= alert.targetPrice) {
                  return { ...alert, triggered: true };
                }
              }
              return alert;
            })
          );

          return {
            ...stock,
            price: newPrice,
            change: newChange,
            changePercent: newChangePercent,
            high: Math.max(stock.high, newPrice),
            low: Math.min(stock.low, newPrice),
            chartData: updatedChart,
          };
        })
      );

      setOrderBookData((prevOrderbook) =>
        prevOrderbook.map((row) => ({
          ...row,
          bidQty: Math.max(1000, row.bidQty + Math.floor((Math.random() - 0.5) * 2500)),
          offerQty: Math.max(1000, row.offerQty + Math.floor((Math.random() - 0.5) * 2500)),
        }))
      );
    }, 2000);

    return () => clearInterval(interval);
  }, [isRealtimeActive]);

  const selectedStock = stocks.find((s) => s.symbol === selectedSymbol) || stocks[0] || PRESET_EMITEN_CATALOG[0];

  const handleSelectSymbol = (sym: string) => {
    setSelectedSymbol(sym);
    setBuySymbol(sym);
    const target = stocks.find((s) => s.symbol === sym);
    if (target) {
      setBuyPrice(target.price);
      setAlertTargetPrice(target.price);
    }
  };

  const handleAddEmiten = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSymbol.trim() || !newName.trim()) return;

    const formattedSymbol = newSymbol.trim().toUpperCase();
    if (stocks.some((s) => s.symbol === formattedSymbol)) {
      alert(`Ticker ${formattedSymbol} is already in your active watchlist.`);
      return;
    }

    const newStock: StockItem = {
      symbol: formattedSymbol,
      name: newName.trim(),
      sector: newSector,
      price: newPrice,
      change: 0,
      changePercent: 0,
      volume: '15.2M',
      high: newPrice,
      low: newPrice,
      marketCap: newMarketCap,
      per: newPer,
      pbv: newPbv,
      roe: 16.5,
      divYield: 3.5,
      targetPrice: newTargetPrice,
      recommendation: 'BUY',
      chartData: [
        { time: '09:00', price: newPrice },
        { time: '10:00', price: newPrice },
      ],
      financials: {
        revenue: 'Rp 50 Triliun',
        netProfit: 'Rp 10 Triliun',
        grossMargin: '55.0%',
        operatingMargin: '30.0%',
        totalAssets: 'Rp 100 Triliun',
        totalLiabilities: 'Rp 40 Triliun',
        equity: 'Rp 60 Triliun',
        cashEquivalents: 'Rp 15 Triliun',
        operatingCashFlow: 'Rp 12 Triliun',
        freeCashFlow: 'Rp 8 Triliun',
        der: 0.67,
        currentRatio: 1.5,
      },
      altmanZScore: 3.20,
      piotroskiFScore: 7,
      dcfFairValue: Math.round(newPrice * 1.15),
      astronacci: {
        climaxDate: '15 Oktober 2026',
        planetaryPhenomenon: 'Full Moon Planetary Conjunction',
        timeClusterBarCount: 21,
        timeCycleSignal: 'BULLISH REVERSAL',
        fibSupport38: Math.round(newPrice * 0.95),
        fibSupport50: Math.round(newPrice * 0.98),
        fibResistance61: Math.round(newPrice * 1.08),
        fibResistance100: Math.round(newPrice * 1.18),
        astroDescription: 'Siklus waktu astronacci custom emiten menunjukkan akumulasi awal pada zona pembalikan arah.'
      }
    };

    setStocks([...stocks, newStock]);
    setSelectedSymbol(formattedSymbol);
    setNewSymbol('');
    setNewName('');
    setShowAddModal(false);
  };

  const handleAddFromCatalog = (catalogItem: Omit<StockItem, 'chartData'>) => {
    if (stocks.some((s) => s.symbol === catalogItem.symbol)) {
      alert(`Ticker ${catalogItem.symbol} is already in your watchlist.`);
      return;
    }

    const newStock: StockItem = {
      ...catalogItem,
      chartData: [
        { time: '09:00', price: catalogItem.price * 0.98 },
        { time: '10:00', price: catalogItem.price * 0.99 },
        { time: '11:00', price: catalogItem.price * 1.01 },
        { time: '12:00', price: catalogItem.price * 0.995 },
        { time: '14:00', price: catalogItem.price },
      ],
    };

    setStocks([...stocks, newStock]);
    setSelectedSymbol(catalogItem.symbol);
    setShowCatalogModal(false);
  };

  const handleRemoveEmiten = (sym: string) => {
    if (stocks.length === 1) {
      alert('Cannot remove the last stock ticker.');
      return;
    }
    const updated = stocks.filter((s) => s.symbol !== sym);
    setStocks(updated);
    if (selectedSymbol === sym) {
      setSelectedSymbol(updated[0].symbol);
    }
  };

  const handleAddHolding = (e: React.FormEvent) => {
    e.preventDefault();
    const newHolding: PortfolioItem = {
      id: Date.now().toString(),
      symbol: buySymbol,
      shares: buyShares,
      avgPrice: buyPrice,
    };
    setPortfolio([...portfolio, newHolding]);
  };

  const handleRemoveHolding = (id: string) => {
    setPortfolio(portfolio.filter((p) => p.id !== id));
  };

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const newAlert: PriceAlert = {
      id: Date.now().toString(),
      symbol: selectedSymbol,
      targetPrice: alertTargetPrice,
      condition: alertCondition,
      triggered: false,
    };
    setAlerts([...alerts, newAlert]);
  };

  const handleRemoveAlert = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  // Sectors list
  const availableSectors = ['ALL', ...Array.from(new Set(stocks.map(s => s.sector)))];

  // Filtered stocks list
  const filteredStocks = stocks.filter((s) => {
    const matchesSearch = s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSector = sectorFilter === 'ALL' || s.sector === sectorFilter;
    return matchesSearch && matchesSector;
  });

  // REAL-TIME PORTFOLIO MATH
  const totalPortfolioValue = portfolio.reduce((sum, p) => {
    const currentStock = stocks.find((s) => s.symbol === p.symbol);
    const livePrice = currentStock ? currentStock.price : p.avgPrice;
    return sum + p.shares * livePrice;
  }, 0);

  const totalCostBasis = portfolio.reduce((sum, p) => sum + p.shares * p.avgPrice, 0);
  const totalUnrealizedPnL = totalPortfolioValue - totalCostBasis;
  const totalPnLPercent = totalCostBasis > 0 ? (totalUnrealizedPnL / totalCostBasis) * 100 : 0;

  const newsFeed = [
    { id: 1, title: 'BBCA Reports 12% YoY Net Profit Growth in Q3 2026', source: 'MarketWire', time: '2 mins ago', symbol: 'BBCA' },
    { id: 2, title: 'Bank Indonesia Keeps Benchmark Interest Rate Stable at 6.00%', source: 'Financial Times', time: '15 mins ago', symbol: 'BBRI' },
    { id: 3, title: 'Telkom (TLKM) Expands 5G Fiber Infrastructure Across Java', source: 'TechAsia', time: '45 mins ago', symbol: 'TLKM' },
    { id: 4, title: 'NVIDIA (NVDA) Unveils Next-Gen AI Datacenter Chips', source: 'Bloomberg', time: '1 hour ago', symbol: 'NVDA' },
    { id: 5, title: 'Bank Mandiri (BMRI) Synergizes Micro Lending Platform', source: 'Bisnis.com', time: '2 hours ago', symbol: 'BMRI' },
    { id: 6, title: 'Amman Mineral (AMMN) Copper Smelter Hits Full Operation', source: 'Reuters', time: '3 hours ago', symbol: 'AMMN' },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Real-time Ticker Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold shadow-xs">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900">Stockbit Market Hub & Analisis Astronacci Desk</h1>
              <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse">
                <Activity className="w-3 h-3" />
                <span>LIVE STREAMING</span>
              </span>
            </div>
            <p className="text-xs text-slate-500">Kelola emiten, analisis keuangan 3 pilar (Laba Rugi, Neraca, Arus Kas), siklus Astronacci Time & Price Ratios, dan portofolio live.</p>
          </div>
        </div>

        {/* Global Action Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowCatalogModal(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Preset Catalog</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Emiten Custom</span>
          </button>

          <button
            onClick={() => setIsRealtimeActive(!isRealtimeActive)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              isRealtimeActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRealtimeActive ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
            <span>{isRealtimeActive ? 'Live' : 'Paused'}</span>
          </button>
        </div>
      </div>

      {/* Triggered Alert Notification Banner */}
      {alerts.some(a => a.triggered) && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-center justify-between text-xs text-amber-900 shadow-xs">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-600 animate-bounce" />
            <span className="font-bold">Notifikasi Harga Saham:</span>
            <span>
              {alerts.filter(a => a.triggered).map(a => `${a.symbol} telah mencapai target Rp ${a.targetPrice.toLocaleString()}`).join(', ')}
            </span>
          </div>
          <button
            onClick={() => setAlerts(alerts.map(a => ({ ...a, triggered: false })))}
            className="text-[11px] font-bold text-amber-700 hover:underline"
          >
            Clear Alerts
          </button>
        </div>
      )}

      {/* Navigation Tab Bar */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs overflow-x-auto">
        {(['screener', 'chart', 'fundamentals', 'astronacci', 'orderbook', 'portfolio', 'news', 'alerts'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl font-bold capitalize transition-all ${
              activeTab === tab
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab === 'screener' ? 'Emiten Watchlist' :
             tab === 'chart' ? `Chart (${selectedSymbol})` :
             tab === 'fundamentals' ? `Keuangan & Fundamental (${selectedSymbol})` :
             tab === 'astronacci' ? `Analisis Astronacci ✨ (${selectedSymbol})` :
             tab === 'orderbook' ? `Orderbook (${selectedSymbol})` :
             tab === 'portfolio' ? 'Live Portfolio' :
             tab === 'news' ? 'News Feed' : 'Harga Alerts'}
          </button>
        ))}
      </div>

      {/* 1. EMITEN WATCHLIST & SEARCH TAB */}
      {activeTab === 'screener' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Watchlist Aktif ({filteredStocks.length} Emiten)</h2>
            </div>

            {/* Search & Sector Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari kode emiten / nama perusahaan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>

              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={sectorFilter}
                  onChange={(e) => setSectorFilter(e.target.value)}
                  className="bg-transparent text-slate-700 font-semibold focus:outline-none"
                >
                  {availableSectors.map((sec) => (
                    <option key={sec} value={sec}>{sec === 'ALL' ? 'Semua Sektor' : sec}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-semibold border-b border-slate-100 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Kode Ticker</th>
                  <th className="p-3">Nama Perusahaan</th>
                  <th className="p-3">Sektor</th>
                  <th className="p-3">Harga Realtime</th>
                  <th className="p-3">Perubahan</th>
                  <th className="p-3">% Change</th>
                  <th className="p-3">PER / PBV</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredStocks.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      Tidak ada emiten ditemukan dengan kata kunci &quot;{searchQuery}&quot;.
                    </td>
                  </tr>
                ) : (
                  filteredStocks.map((stock) => {
                    const isPositive = stock.change >= 0;
                    const isSelected = selectedSymbol === stock.symbol;

                    return (
                      <tr
                        key={stock.symbol}
                        onClick={() => handleSelectSymbol(stock.symbol)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50/60 font-semibold' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                          <span>{stock.symbol}</span>
                          {isSelected && <span className="w-2 h-2 rounded-full bg-blue-600" />}
                        </td>
                        <td className="p-3 text-slate-700">{stock.name}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                            {stock.sector}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-slate-900">{stock.price.toLocaleString()}</td>
                        <td className={`p-3 font-semibold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                          {isPositive ? `+${stock.change}` : stock.change}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${isPositive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                            {isPositive ? `+${stock.changePercent}%` : `${stock.changePercent}%`}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500 font-mono text-[11px]">
                          {stock.per}x / {stock.pbv}x
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectSymbol(stock.symbol);
                                setActiveTab('chart');
                              }}
                              className="px-2.5 py-1 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-xs font-semibold shadow-xs"
                            >
                              Chart
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectSymbol(stock.symbol);
                                setActiveTab('fundamentals');
                              }}
                              className="px-2.5 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-semibold"
                            >
                              Detail
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectSymbol(stock.symbol);
                                setActiveTab('astronacci');
                              }}
                              className="px-2.5 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-semibold border border-amber-200 flex items-center gap-1"
                            >
                              <Sparkles className="w-3 h-3 text-amber-600" />
                              <span>Astronacci</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveEmiten(stock.symbol);
                              }}
                              className="p-1 text-slate-400 hover:text-red-600"
                              title="Hapus dari Watchlist"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. REAL-TIME INTERACTIVE CHART TAB */}
      {activeTab === 'chart' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-slate-900">{selectedStock.symbol}</h2>
                <span className="text-sm font-semibold text-slate-500">{selectedStock.name}</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {selectedStock.sector}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-2xl font-bold text-slate-900">{selectedStock.price.toLocaleString()}</span>
                <span className={`text-sm font-bold ${selectedStock.change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {selectedStock.change >= 0 ? `+${selectedStock.change} (+${selectedStock.changePercent}%)` : `${selectedStock.change} (${selectedSymbol ? selectedStock.changePercent : 0}%)`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold">Pilih Emiten:</span>
              <select
                value={selectedSymbol}
                onChange={(e) => handleSelectSymbol(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-600"
              >
                {stocks.map((s) => (
                  <option key={s.symbol} value={s.symbol}>{s.symbol} — {s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="h-80 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={selectedStock.chartData}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="time" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} domain={['auto', 'auto']} />
                <Tooltip />
                <Area type="monotone" dataKey="price" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPrice)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 3. EMITEN FINANCIAL STATEMENTS & FUNDAMENTAL DEEP-DIVE */}
      {activeTab === 'fundamentals' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-slate-900">{selectedStock.symbol} — Analisis Laporan Keuangan & Fundamental</h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    selectedStock.recommendation === 'STRONG BUY' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                    selectedStock.recommendation === 'BUY' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {selectedStock.recommendation}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{selectedStock.name} • Sektor: {selectedStock.sector}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-semibold">Ganti Emiten:</span>
                <select
                  value={selectedSymbol}
                  onChange={(e) => handleSelectSymbol(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold"
                >
                  {stocks.map((s) => (
                    <option key={s.symbol} value={s.symbol}>{s.symbol} — {s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Valuation & Financial Health Scores */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Altman Z-Score</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">Safe Zone</span>
                </div>
                <p className="text-2xl font-bold text-slate-900">{selectedStock.altmanZScore}</p>
                <p className="text-[11px] text-slate-600">Risiko kebangkrutan sangat rendah. Struktur permodalan sangat sehat.</p>
              </div>

              <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-2xl space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-blue-800">
                  <span className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-blue-600" />
                    <span>Piotroski F-Score</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800">{selectedStock.piotroskiFScore} / 9</span>
                </div>
                <p className="text-2xl font-bold text-slate-900">{selectedStock.piotroskiFScore} / 9</p>
                <p className="text-[11px] text-slate-600">Kekuatan operasi & kualitas laba perusahaan berada di tingkat puncak.</p>
              </div>

              <div className="p-4 bg-purple-50/50 border border-purple-200 rounded-2xl space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-purple-800">
                  <span className="flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-purple-600" />
                    <span>DCF Fair Value</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                    +{(((selectedStock.dcfFairValue - selectedStock.price) / selectedStock.price) * 100).toFixed(1)}% Discount
                  </span>
                </div>
                <p className="text-2xl font-bold text-slate-900">Rp {selectedStock.dcfFairValue.toLocaleString()}</p>
                <p className="text-[11px] text-slate-600">Nilai wajar berbasis Discounted Cash Flow 10 tahun.</p>
              </div>
            </div>

            {/* Financial Statement Trilogy Table */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Ringkasan Laporan Keuangan 3 Pilar ({selectedStock.symbol})</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium">
                {/* 1. Income Statement */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                  <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-2 text-xs uppercase tracking-wider text-blue-600">
                    1. Laporan Laba Rugi (Income Statement)
                  </h4>
                  <div className="space-y-2 text-slate-700">
                    <div className="flex justify-between">
                      <span>Total Pendapatan (Revenue):</span>
                      <span className="font-bold text-slate-900">{selectedStock.financials.revenue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Laba Bersih (Net Profit):</span>
                      <span className="font-bold text-emerald-600">{selectedStock.financials.netProfit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Gross Profit Margin:</span>
                      <span className="font-mono">{selectedStock.financials.grossMargin}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Operating Margin:</span>
                      <span className="font-mono">{selectedStock.financials.operatingMargin}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Balance Sheet */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                  <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-2 text-xs uppercase tracking-wider text-blue-600">
                    2. Neraca Keuangan (Balance Sheet)
                  </h4>
                  <div className="space-y-2 text-slate-700">
                    <div className="flex justify-between">
                      <span>Total Aset (Assets):</span>
                      <span className="font-bold text-slate-900">{selectedStock.financials.totalAssets}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Utang (Liabilities):</span>
                      <span className="font-mono">{selectedStock.financials.totalLiabilities}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Ekuitas (Equity):</span>
                      <span className="font-bold text-slate-900">{selectedStock.financials.equity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Debt-to-Equity Ratio (DER):</span>
                      <span className="font-bold text-blue-600 font-mono">{selectedStock.financials.der}x</span>
                    </div>
                  </div>
                </div>

                {/* 3. Cash Flow */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                  <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-2 text-xs uppercase tracking-wider text-blue-600">
                    3. Arus Kas (Cash Flow Statement)
                  </h4>
                  <div className="space-y-2 text-slate-700">
                    <div className="flex justify-between">
                      <span>Kas & Setara Kas:</span>
                      <span className="font-bold text-slate-900">{selectedStock.financials.cashEquivalents}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Arus Kas Operasi:</span>
                      <span className="font-mono">{selectedStock.financials.operatingCashFlow}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Free Cash Flow (FCF):</span>
                      <span className="font-bold text-emerald-600">{selectedStock.financials.freeCashFlow}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Current Ratio:</span>
                      <span className="font-mono">{selectedStock.financials.currentRatio}x</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Investment Strategy Blueprint */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3 shadow-lg">
              <h3 className="text-sm font-bold flex items-center gap-2 text-blue-400">
                <Crosshair className="w-4 h-4" />
                <span>Strategi Investasi & Blueprint Alokasi Modal ({selectedStock.symbol})</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 space-y-1">
                  <h4 className="font-bold text-emerald-400">1. Value Investing Blueprint (Graham / Buffett)</h4>
                  <p className="text-slate-300 text-[11px]">
                    Beli emiten saat PER ({selectedStock.per}x) dan PBV ({selectedStock.pbv}x) berada di area terdiskon dengan Margin of Safety &gt; 15% dari DCF Fair Value (Rp {selectedStock.dcfFairValue.toLocaleString()}).
                  </p>
                </div>
                <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 space-y-1">
                  <h4 className="font-bold text-blue-400">2. Dividend Growth & Passive Cashflow Strategy</h4>
                  <p className="text-slate-300 text-[11px]">
                    Imbal hasil dividen sebesar {selectedStock.divYield}% memberikan perlindungan arus kas berkala yang cocok untuk akumulasi portofolio jangka panjang.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. ASTRONACCI TIME & PRICE CYCLE ANALYSIS TAB ✨ */}
      {activeTab === 'astronacci' && (
        <div className="space-y-6">
          {/* Astronacci Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30 flex items-center justify-center font-bold shadow-inner">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold">Astronacci Time & Price Cycle Analysis — {selectedStock.symbol}</h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      EYE OF THE FUTURE
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">Prediksi tanggal pembalikan arah harga (Time Climax) berbasis Financial Astrology & Rasi Fibonacci Ratio.</p>
                </div>
              </div>

              <select
                value={selectedSymbol}
                onChange={(e) => handleSelectSymbol(e.target.value)}
                className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-bold"
              >
                {stocks.map((s) => (
                  <option key={s.symbol} value={s.symbol}>{s.symbol} — {s.name}</option>
                ))}
              </select>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
              <span className="font-bold text-amber-400">Metodologi Astronacci:</span> Mengombinasikan ilmu **Financial Astrology** (pergerakan posisi siklus bulan, matahari, dan aliansi planet) serta **Fibonacci Time & Price Ratio** untuk mengetahui <span className="underline decoration-amber-400 underline-offset-4">KAPAN HARGA AKAN BERBALIK ARAH</span> (*Time Reversal Date*) sebelum pergerakan terjadi di pasar fisik.
            </p>
          </div>

          {/* Time Cycle Target & Signal Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>Reversal Time Climax</span>
              </span>
              <p className="text-base font-bold text-slate-900">{selectedStock.astronacci.climaxDate}</p>
              <span className="text-[11px] text-amber-600 font-semibold">Tanggal Pembalikan Arah Major</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <Moon className="w-3.5 h-3.5 text-purple-600" />
                <span>Fenomena Astro Planet</span>
              </span>
              <p className="text-xs font-bold text-slate-900 truncate" title={selectedStock.astronacci.planetaryPhenomenon}>
                {selectedStock.astronacci.planetaryPhenomenon}
              </p>
              <span className="text-[11px] text-slate-500">Alignment Siklus Kosmik</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-emerald-600" />
                <span>Fibonacci Time Window</span>
              </span>
              <p className="text-base font-bold text-slate-900">{selectedStock.astronacci.timeClusterBarCount} Bars Count</p>
              <span className="text-[11px] text-slate-500">Klaster Waktu Fibonacci</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-red-600" />
                <span>Sinyal Astronacci</span>
              </span>
              <p className="text-xs font-bold text-emerald-600 uppercase">{selectedStock.astronacci.timeCycleSignal}</p>
              <span className="text-[11px] text-slate-500">Aksi Strategi Siap Entri</span>
            </div>
          </div>

          {/* Fibonacci Price Ratio Targets */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Target Klaster Fibonacci Price Ratios ({selectedStock.symbol})</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-red-700 uppercase">Fib 100% Climax Target</span>
                <p className="text-base font-bold text-red-900">Rp {selectedStock.astronacci.fibResistance100.toLocaleString()}</p>
                <span className="text-[10px] text-red-600">Target Profit Maksimal</span>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-amber-700 uppercase">Fib 61.8% Golden Ratio</span>
                <p className="text-base font-bold text-amber-900">Rp {selectedStock.astronacci.fibResistance61.toLocaleString()}</p>
                <span className="text-[10px] text-amber-600">Resistensi Kunci Breakout</span>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-blue-700 uppercase">Fib 50.0% Mid Pivot</span>
                <p className="text-base font-bold text-blue-900">Rp {selectedStock.astronacci.fibSupport50.toLocaleString()}</p>
                <span className="text-[10px] text-blue-600">Area Keseimbangan Pivot</span>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-emerald-700 uppercase">Fib 38.2% Key Support</span>
                <p className="text-base font-bold text-emerald-900">Rp {selectedStock.astronacci.fibSupport38.toLocaleString()}</p>
                <span className="text-[10px] text-emerald-600">Area Ideal Entri Beli</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 space-y-1 font-medium">
              <span className="font-bold text-slate-900">Catatan Analis Astronacci:</span>
              <p>{selectedStock.astronacci.astroDescription}</p>
            </div>
          </div>

          {/* Astronacci Trading Rules Guide */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Panduan Eksekusi Strategi Trading Astronacci</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-slate-800 border border-slate-700 rounded-xl space-y-1">
                <span className="font-bold text-amber-300">Rule 1: Buy on Time Window</span>
                <p className="text-slate-300 text-[11px]">Jangan masuk posisi secara acak. Hanya lakukan pembelian ketika harga berada dekat <span className="font-bold text-white">Reversal Time Climax Date</span>.</p>
              </div>

              <div className="p-3 bg-slate-800 border border-slate-700 rounded-xl space-y-1">
                <span className="font-bold text-blue-300">Rule 2: Fibonacci Price Confluence</span>
                <p className="text-slate-300 text-[11px]">Pastikan pergerakan harga tertahan di area <span className="font-bold text-white">Fib 38.2% - 50.0% Support</span> sebelum mengklik tombol beli.</p>
              </div>

              <div className="p-3 bg-slate-800 border border-slate-700 rounded-xl space-y-1">
                <span className="font-bold text-emerald-300">Rule 3: Climax Exit Target</span>
                <p className="text-slate-300 text-[11px]">Ambil profit tepat waktu ketika harga mencapai <span className="font-bold text-white">Fib 100% Target Price</span> bersamaan dengan berakhirnya siklus waktu.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. STOCKBIT ORDERBOOK BID / OFFER DEPTH TAB */}
      {activeTab === 'orderbook' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Live Orderbook Depth (Bid / Offer) — {selectedSymbol}</h2>
              <p className="text-xs text-slate-500">Live order matching queue for buyer (Bid) and seller (Offer).</p>
            </div>

            <select
              value={selectedSymbol}
              onChange={(e) => handleSelectSymbol(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold"
            >
              {stocks.map((s) => (
                <option key={s.symbol} value={s.symbol}>{s.symbol}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="border border-emerald-200 rounded-xl overflow-hidden">
              <div className="bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 border-b border-emerald-200 flex justify-between">
                <span>BID QTY (Lot)</span>
                <span>BID PRICE</span>
              </div>
              <div className="divide-y divide-emerald-100 bg-emerald-50/20 text-xs font-mono">
                {orderBookData.map((row, i) => (
                  <div key={i} className="flex justify-between px-3 py-1.5 hover:bg-emerald-100/50">
                    <span className="text-slate-600">{row.bidQty.toLocaleString()}</span>
                    <span className="font-bold text-emerald-700">{row.bidPrice.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-red-200 rounded-xl overflow-hidden">
              <div className="bg-red-50 px-3 py-2 text-xs font-bold text-red-800 border-b border-red-200 flex justify-between">
                <span>OFFER PRICE</span>
                <span>OFFER QTY (Lot)</span>
              </div>
              <div className="divide-y divide-red-100 bg-red-50/20 text-xs font-mono">
                {orderBookData.map((row, i) => (
                  <div key={i} className="flex justify-between px-3 py-1.5 hover:bg-red-100/50">
                    <span className="font-bold text-red-700">{row.offerPrice.toLocaleString()}</span>
                    <span className="text-slate-600">{row.offerQty.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. REAL-TIME PORTFOLIO TRACKER TAB */}
      {activeTab === 'portfolio' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Live Portfolio Value</span>
              <p className="text-xl font-bold text-slate-900 mt-1">Rp {totalPortfolioValue.toLocaleString()}</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Total Cost Basis</span>
              <p className="text-xl font-bold text-slate-700 mt-1">Rp {totalCostBasis.toLocaleString()}</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Real-Time Unrealized P&L</span>
              <p className={`text-xl font-bold mt-1 ${totalUnrealizedPnL >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {totalUnrealizedPnL >= 0 ? `+Rp ${totalUnrealizedPnL.toLocaleString()}` : `-Rp ${Math.abs(totalUnrealizedPnL).toLocaleString()}`} ({totalPnLPercent.toFixed(2)}%)
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-sm font-bold text-slate-900">Live Stock Holdings</h2>
              <form onSubmit={handleAddHolding} className="flex items-center gap-2 flex-wrap">
                <select
                  value={buySymbol}
                  onChange={(e) => setBuySymbol(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold"
                >
                  {stocks.map((s) => (
                    <option key={s.symbol} value={s.symbol}>{s.symbol}</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Jumlah Saham"
                  value={buyShares}
                  onChange={(e) => setBuyShares(parseInt(e.target.value) || 0)}
                  className="w-24 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
                <input
                  type="number"
                  placeholder="Avg Price"
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(parseFloat(e.target.value) || 0)}
                  className="w-28 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
                <button type="submit" className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-xs">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Beli / Tambah</span>
                </button>
              </form>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-400 font-semibold border-b border-slate-100 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Kode Saham</th>
                    <th className="p-3">Jumlah Lembar</th>
                    <th className="p-3">Harga Beli Rata-Rata</th>
                    <th className="p-3">Harga Live</th>
                    <th className="p-3">Nilai Pasar</th>
                    <th className="p-3">Live Unrealized P&L</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {portfolio.map((item) => {
                    const currentStock = stocks.find((s) => s.symbol === item.symbol);
                    const livePrice = currentStock ? currentStock.price : item.avgPrice;
                    const marketVal = item.shares * livePrice;
                    const costVal = item.shares * item.avgPrice;
                    const pnl = marketVal - costVal;
                    const pnlPct = costVal > 0 ? (pnl / costVal) * 100 : 0;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">{item.symbol}</td>
                        <td className="p-3 text-slate-700">{item.shares.toLocaleString()}</td>
                        <td className="p-3 text-slate-700">Rp {item.avgPrice.toLocaleString()}</td>
                        <td className="p-3 font-bold text-slate-900">Rp {livePrice.toLocaleString()}</td>
                        <td className="p-3 text-slate-900 font-bold">Rp {marketVal.toLocaleString()}</td>
                        <td className={`p-3 font-bold ${pnl >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {pnl >= 0 ? `+Rp ${pnl.toLocaleString()}` : `-Rp ${Math.abs(pnl).toLocaleString()}`} ({pnlPct.toFixed(2)}%)
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleRemoveHolding(item.id)}
                            className="p-1 text-slate-400 hover:text-red-600"
                            title="Hapus Saham"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 7. PRICE ALERTS TAB */}
      {activeTab === 'alerts' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Notifikasi Alert Harga Saham</h2>
              <p className="text-xs text-slate-500">Pasang notifikasi saat harga emiten menyentuh batas tertentu.</p>
            </div>

            <form onSubmit={handleCreateAlert} className="flex items-center gap-2 flex-wrap">
              <select
                value={selectedSymbol}
                onChange={(e) => handleSelectSymbol(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold"
              >
                {stocks.map((s) => (
                  <option key={s.symbol} value={s.symbol}>{s.symbol}</option>
                ))}
              </select>

              <select
                value={alertCondition}
                onChange={(e) => setAlertCondition(e.target.value as 'ABOVE' | 'BELOW')}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold"
              >
                <option value="BELOW">Kurang Dari (&le;)</option>
                <option value="ABOVE">Lebih Dari (&ge;)</option>
              </select>

              <input
                type="number"
                placeholder="Target Price"
                value={alertTargetPrice}
                onChange={(e) => setAlertTargetPrice(parseFloat(e.target.value) || 0)}
                className="w-28 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold"
              />

              <button type="submit" className="px-3.5 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-xs">
                <Bell className="w-3.5 h-3.5" />
                <span>Pasang Alert</span>
              </button>
            </form>
          </div>

          <div className="space-y-2">
            {alerts.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Belum ada price alert yang dipasang.</p>
            ) : (
              alerts.map((a) => (
                <div key={a.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{a.symbol}</span>
                    <span className="text-slate-500">saat harga {a.condition === 'BELOW' ? '<=' : '>='} Rp {a.targetPrice.toLocaleString()}</span>
                    {a.triggered && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        TRIGGERED
                      </span>
                    )}
                  </div>
                  <button onClick={() => handleRemoveAlert(a.id)} className="text-slate-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 8. INTEGRATED STOCK NEWS FEED TAB */}
      {activeTab === 'news' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-blue-600" />
              <span>Berita Pasar Keuangan ({selectedSymbol})</span>
            </h2>

            <select
              value={selectedSymbol}
              onChange={(e) => handleSelectSymbol(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold"
            >
              {stocks.map((s) => (
                <option key={s.symbol} value={s.symbol}>{s.symbol}</option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            {newsFeed
              .filter((n) => n.symbol === selectedSymbol || selectedSymbol === 'all')
              .map((item) => (
                <div key={item.id} className="p-4 bg-slate-50 border border-slate-200 hover:border-blue-400 rounded-xl space-y-1.5 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded font-mono">{item.symbol}</span>
                    <span className="text-[11px] text-slate-400">{item.source} • {item.time}</span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 hover:text-blue-600 cursor-pointer">{item.title}</h3>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* MODAL 1: ADD NEW CUSTOM EMITEN */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">Tambah Emiten / Ticker Baru</h3>
            </div>

            <form onSubmit={handleAddEmiten} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Kode Ticker Symbol (contoh: BBNI, ASII, GOTO)</label>
                <input
                  type="text"
                  required
                  placeholder="contoh: BBNI"
                  value={newSymbol}
                  onChange={(e) => setNewSymbol(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono uppercase font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Nama Perusahaan Perusahaan</label>
                <input
                  type="text"
                  required
                  placeholder="contoh: Bank Negara Indonesia Tbk"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Sektor Industry</label>
                  <select
                    value={newSector}
                    onChange={(e) => setNewSector(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  >
                    <option value="Banking">Banking</option>
                    <option value="Technology">Technology</option>
                    <option value="Telecommunication">Telecommunication</option>
                    <option value="Automotive">Automotive</option>
                    <option value="Consumer Goods">Consumer Goods</option>
                    <option value="Energy & Coal">Energy & Coal</option>
                    <option value="Mining & Metals">Mining & Metals</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Harga Awal (Rp)</label>
                  <input
                    type="number"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Market Cap</label>
                  <input
                    type="text"
                    value={newMarketCap}
                    onChange={(e) => setNewMarketCap(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">PER (x)</label>
                  <input
                    type="number"
                    value={newPer}
                    onChange={(e) => setNewPer(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">PBV (x)</label>
                  <input
                    type="number"
                    value={newPbv}
                    onChange={(e) => setNewPbv(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md"
                >
                  Simpan Emiten
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PRESET CATALOG QUICK ADD */}
      {showCatalogModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <span>Katalog Emiten Populer (IDX & Global)</span>
                </h3>
                <p className="text-xs text-slate-500">Klik &quot;Tambah ke Watchlist&quot; untuk langsung memantau emiten tanpa memasukkan parameter manual.</p>
              </div>
              <button onClick={() => setShowCatalogModal(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">
                Tutup
              </button>
            </div>

            <div className="overflow-y-auto flex-1 pr-1 space-y-2">
              {PRESET_EMITEN_CATALOG.map((cat) => {
                const isAdded = stocks.some(s => s.symbol === cat.symbol);
                return (
                  <div key={cat.symbol} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="w-12 text-center font-bold text-slate-900 font-mono bg-white py-1 rounded border border-slate-200">{cat.symbol}</span>
                      <div>
                        <h4 className="font-bold text-slate-900">{cat.name}</h4>
                        <span className="text-[10px] text-slate-500">{cat.sector} • PER: {cat.per}x • PBV: {cat.pbv}x</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-900">Rp {cat.price.toLocaleString()}</span>
                      {isAdded ? (
                        <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>Aktif</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAddFromCatalog(cat)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs"
                        >
                          + Tambah
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
