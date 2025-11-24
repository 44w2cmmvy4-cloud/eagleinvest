import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, of, BehaviorSubject } from 'rxjs';
import { map, catchError, switchMap, shareReplay } from 'rxjs/operators';

export interface MarketQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  high24h?: number;
  low24h?: number;
  timestamp: Date;
}

export interface CryptoPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  image: string;
}

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  publishedAt: Date;
  source: string;
  category?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MarketDataService {
  // APIs gratuitas para datos de mercado
  private cryptoApiUrl = 'https://api.coingecko.com/api/v3';
  private newsApiUrl = 'https://newsapi.org/v2'; // Necesitas obtener una API key gratuita
  private newsApiKey = 'YOUR_NEWS_API_KEY'; // Reemplazar con tu API key de newsapi.org
  
  // Alpha Vantage para stocks (API gratuita con límite)
  private alphaVantageUrl = 'https://www.alphavantage.co/query';
  private alphaVantageKey = 'YOUR_ALPHA_VANTAGE_KEY'; // Reemplazar con tu API key

  // Cache de datos de mercado
  private marketDataCache$ = new BehaviorSubject<MarketQuote[]>([]);
  private cryptoDataCache$ = new BehaviorSubject<CryptoPrice[]>([]);
  private newsCache$ = new BehaviorSubject<NewsArticle[]>([]);

  constructor(private http: HttpClient) {
    this.initializeMarketDataStreams();
  }

  /**
   * Inicializar flujos de datos en tiempo real (actualización cada 30 segundos)
   */
  private initializeMarketDataStreams(): void {
    // Actualizar datos de crypto cada 30 segundos
    interval(30000).pipe(
      switchMap(() => this.fetchCryptoPrices())
    ).subscribe(data => this.cryptoDataCache$.next(data));

    // Cargar datos iniciales
    this.fetchCryptoPrices().subscribe(data => this.cryptoDataCache$.next(data));
    this.fetchFinanceNews().subscribe(data => this.newsCache$.next(data));
  }

  /**
   * Obtener precios de criptomonedas desde CoinGecko (API GRATUITA)
   */
  fetchCryptoPrices(): Observable<CryptoPrice[]> {
    const url = `${this.cryptoApiUrl}/coins/markets`;
    const params = {
      vs_currency: 'usd',
      order: 'market_cap_desc',
      per_page: '20',
      page: '1',
      sparkline: 'false'
    };

    return this.http.get<any[]>(url, { params }).pipe(
      map(data => data.map(coin => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        current_price: coin.current_price,
        price_change_percentage_24h: coin.price_change_percentage_24h,
        market_cap: coin.market_cap,
        total_volume: coin.total_volume,
        high_24h: coin.high_24h,
        low_24h: coin.low_24h,
        image: coin.image
      }))),
      catchError(error => {
        console.error('Error fetching crypto prices:', error);
        return of(this.getMockCryptoData());
      }),
      shareReplay(1)
    );
  }

  /**
   * Obtener datos de mercado en tiempo real (observable)
   */
  getCryptoPricesStream(): Observable<CryptoPrice[]> {
    return this.cryptoDataCache$.asObservable();
  }

  /**
   * Obtener precio de una criptomoneda específica
   */
  getCryptoPrice(coinId: string): Observable<any> {
    const url = `${this.cryptoApiUrl}/coins/${coinId}`;
    const params = {
      localization: 'false',
      tickers: 'false',
      market_data: 'true',
      community_data: 'false',
      developer_data: 'false',
      sparkline: 'false'
    };

    return this.http.get(url, { params }).pipe(
      catchError(error => {
        console.error(`Error fetching price for ${coinId}:`, error);
        return of(null);
      })
    );
  }

  /**
   * Obtener datos históricos de precio
   */
  getHistoricalData(coinId: string, days: number = 7): Observable<any> {
    const url = `${this.cryptoApiUrl}/coins/${coinId}/market_chart`;
    const params = {
      vs_currency: 'usd',
      days: days.toString(),
      interval: 'daily'
    };

    return this.http.get(url, { params }).pipe(
      catchError(error => {
        console.error(`Error fetching historical data for ${coinId}:`, error);
        return of({ prices: [], market_caps: [], total_volumes: [] });
      })
    );
  }

  /**
   * Obtener noticias financieras desde NewsAPI (API GRATUITA - requiere registro)
   */
  fetchFinanceNews(): Observable<NewsArticle[]> {
    // Si no tienes API key, retorna noticias mock
    if (this.newsApiKey === 'YOUR_NEWS_API_KEY') {
      return of(this.getMockNews());
    }

    const url = `${this.newsApiUrl}/top-headlines`;
    const params = {
      category: 'business',
      country: 'us',
      apiKey: this.newsApiKey,
      pageSize: '10'
    };

    return this.http.get<any>(url, { params }).pipe(
      map(response => response.articles.map((article: any) => ({
        title: article.title,
        description: article.description,
        url: article.url,
        imageUrl: article.urlToImage,
        publishedAt: new Date(article.publishedAt),
        source: article.source.name,
        category: 'finance'
      }))),
      catchError(error => {
        console.error('Error fetching news:', error);
        return of(this.getMockNews());
      })
    );
  }

  /**
   * Obtener stream de noticias
   */
  getNewsStream(): Observable<NewsArticle[]> {
    return this.newsCache$.asObservable();
  }

  /**
   * Obtener índices del mercado (S&P 500, NASDAQ, DOW)
   */
  getMarketIndices(): Observable<MarketQuote[]> {
    // Datos simulados con variación realista
    return of([
      {
        symbol: 'SPX',
        name: 'S&P 500',
        price: 4852.31 + (Math.random() - 0.5) * 20,
        change: 5.12 + (Math.random() - 0.5) * 2,
        changePercent: 0.85 + (Math.random() - 0.5) * 0.2,
        volume: 3850000000,
        timestamp: new Date()
      },
      {
        symbol: 'IXIC',
        name: 'NASDAQ',
        price: 19243.75 + (Math.random() - 0.5) * 50,
        change: 85.32 + (Math.random() - 0.5) * 10,
        changePercent: 1.25 + (Math.random() - 0.5) * 0.3,
        volume: 4200000000,
        timestamp: new Date()
      },
      {
        symbol: 'DJI',
        name: 'Dow Jones',
        price: 42573.48 + (Math.random() - 0.5) * 30,
        change: 105.45 + (Math.random() - 0.5) * 15,
        changePercent: 0.45 + (Math.random() - 0.5) * 0.15,
        volume: 3100000000,
        timestamp: new Date()
      }
    ]);
  }

  /**
   * Datos mock de criptomonedas (fallback)
   */
  private getMockCryptoData(): CryptoPrice[] {
    return [
      {
        id: 'bitcoin',
        symbol: 'BTC',
        name: 'Bitcoin',
        current_price: 98500 + (Math.random() - 0.5) * 1000,
        price_change_percentage_24h: 2.5 + (Math.random() - 0.5) * 2,
        market_cap: 1920000000000,
        total_volume: 52000000000,
        high_24h: 99500,
        low_24h: 97000,
        image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png'
      },
      {
        id: 'ethereum',
        symbol: 'ETH',
        name: 'Ethereum',
        current_price: 3650 + (Math.random() - 0.5) * 100,
        price_change_percentage_24h: 3.2 + (Math.random() - 0.5) * 2,
        market_cap: 438000000000,
        total_volume: 24000000000,
        high_24h: 3700,
        low_24h: 3580,
        image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png'
      },
      {
        id: 'binancecoin',
        symbol: 'BNB',
        name: 'BNB',
        current_price: 620 + (Math.random() - 0.5) * 20,
        price_change_percentage_24h: 1.8 + (Math.random() - 0.5) * 1.5,
        market_cap: 95000000000,
        total_volume: 2800000000,
        high_24h: 628,
        low_24h: 612,
        image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png'
      }
    ];
  }

  /**
   * Noticias mock (fallback)
   */
  private getMockNews(): NewsArticle[] {
    return [
      {
        title: 'Bitcoin alcanza nuevo máximo histórico superando los $98,000',
        description: 'La principal criptomoneda continúa su rally alcista impulsada por la demanda institucional.',
        url: '#',
        imageUrl: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400',
        publishedAt: new Date(),
        source: 'CryptoNews',
        category: 'crypto'
      },
      {
        title: 'Wall Street cierra con ganancias ante expectativas de la Fed',
        description: 'Los principales índices subieron anticipando decisiones sobre tasas de interés.',
        url: '#',
        imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400',
        publishedAt: new Date(),
        source: 'Financial Times',
        category: 'stocks'
      },
      {
        title: 'Ethereum 2.0: La actualización que cambiará el futuro de DeFi',
        description: 'Los expertos analizan el impacto de la transición a Proof of Stake.',
        url: '#',
        imageUrl: 'https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=400',
        publishedAt: new Date(),
        source: 'Blockchain Today',
        category: 'crypto'
      }
    ];
  }

  /**
   * Calcular rendimiento de portafolio
   */
  calculatePortfolioPerformance(investments: any[]): any {
    const totalValue = investments.reduce((sum, inv) => sum + inv.value, 0);
    const totalCost = investments.reduce((sum, inv) => sum + inv.quantity, 0);
    const totalGain = totalValue - totalCost;
    const gainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

    return {
      totalValue,
      totalCost,
      totalGain,
      gainPercent,
      bestPerformer: investments.reduce((best, inv) => 
        inv.change_percentage > (best?.change_percentage || 0) ? inv : best, null
      ),
      worstPerformer: investments.reduce((worst, inv) => 
        inv.change_percentage < (worst?.change_percentage || 0) ? inv : worst, null
      )
    };
  }
}
