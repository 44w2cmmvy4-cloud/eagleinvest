<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class MarketDataController extends Controller
{
    /**
     * Obtener datos de criptomonedas desde CoinGecko
     */
    public function getCryptoPrices(Request $request)
    {
        $limit = $request->get('limit', 20);
        $currency = $request->get('currency', 'usd');
        
        // Cache por 30 segundos
        $cacheKey = "crypto_prices_{$currency}_{$limit}";
        
        $data = Cache::remember($cacheKey, 30, function () use ($currency, $limit) {
            try {
                $response = Http::get('https://api.coingecko.com/api/v3/coins/markets', [
                    'vs_currency' => $currency,
                    'order' => 'market_cap_desc',
                    'per_page' => $limit,
                    'page' => 1,
                    'sparkline' => false
                ]);

                if ($response->successful()) {
                    return $response->json();
                }

                return $this->getMockCryptoData();
            } catch (\Exception $e) {
                return $this->getMockCryptoData();
            }
        });

        return response()->json([
            'success' => true,
            'data' => $data,
            'timestamp' => now()
        ]);
    }

    /**
     * Obtener datos históricos de una criptomoneda
     */
    public function getCryptoHistory(Request $request, $coinId)
    {
        $days = $request->get('days', 7);
        $currency = $request->get('currency', 'usd');
        
        $cacheKey = "crypto_history_{$coinId}_{$currency}_{$days}";
        
        $data = Cache::remember($cacheKey, 300, function () use ($coinId, $currency, $days) {
            try {
                $response = Http::get("https://api.coingecko.com/api/v3/coins/{$coinId}/market_chart", [
                    'vs_currency' => $currency,
                    'days' => $days,
                    'interval' => $days > 1 ? 'daily' : 'hourly'
                ]);

                if ($response->successful()) {
                    return $response->json();
                }

                return ['prices' => [], 'market_caps' => [], 'total_volumes' => []];
            } catch (\Exception $e) {
                return ['prices' => [], 'market_caps' => [], 'total_volumes' => []];
            }
        });

        return response()->json([
            'success' => true,
            'data' => $data,
            'coin' => $coinId,
            'days' => $days
        ]);
    }

    /**
     * Obtener índices del mercado (stocks)
     */
    public function getMarketIndices()
    {
        // Datos simulados de índices de mercado
        // En producción, usar Alpha Vantage, Yahoo Finance API, o similar
        $indices = [
            [
                'symbol' => 'SPX',
                'name' => 'S&P 500',
                'price' => 4852.31 + (mt_rand(-100, 100) / 10),
                'change' => 5.12 + (mt_rand(-20, 20) / 10),
                'change_percent' => 0.85 + (mt_rand(-5, 5) / 10),
                'volume' => 3850000000,
                'timestamp' => now()
            ],
            [
                'symbol' => 'IXIC',
                'name' => 'NASDAQ',
                'price' => 19243.75 + (mt_rand(-200, 200) / 10),
                'change' => 85.32 + (mt_rand(-50, 50) / 10),
                'change_percent' => 1.25 + (mt_rand(-10, 10) / 10),
                'volume' => 4200000000,
                'timestamp' => now()
            ],
            [
                'symbol' => 'DJI',
                'name' => 'Dow Jones',
                'price' => 42573.48 + (mt_rand(-150, 150) / 10),
                'change' => 105.45 + (mt_rand(-30, 30) / 10),
                'change_percent' => 0.45 + (mt_rand(-8, 8) / 10),
                'volume' => 3100000000,
                'timestamp' => now()
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => $indices
        ]);
    }

    /**
     * Obtener noticias financieras
     */
    public function getFinanceNews(Request $request)
    {
        $category = $request->get('category', 'finance');
        
        // Noticias simuladas (en producción usar NewsAPI, Alpha Vantage News, etc.)
        $news = [
            [
                'title' => 'Bitcoin alcanza nuevo máximo histórico superando los $98,000',
                'description' => 'La principal criptomoneda continúa su rally alcista impulsada por la demanda institucional y la aprobación de nuevos ETFs.',
                'url' => 'https://eagleinvest.com/news/bitcoin-nuevo-maximo',
                'image_url' => 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800',
                'published_at' => now()->subHours(2),
                'source' => 'CryptoNews',
                'category' => 'crypto'
            ],
            [
                'title' => 'Wall Street cierra con ganancias ante expectativas de la Fed',
                'description' => 'Los principales índices subieron anticipando decisiones sobre tasas de interés en la próxima reunión.',
                'url' => 'https://eagleinvest.com/news/wall-street-ganancias',
                'image_url' => 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
                'published_at' => now()->subHours(5),
                'source' => 'Financial Times',
                'category' => 'stocks'
            ],
            [
                'title' => 'Ethereum 2.0: La actualización que cambiará el futuro de DeFi',
                'description' => 'Los expertos analizan el impacto de la transición completa a Proof of Stake en el ecosistema DeFi.',
                'url' => 'https://eagleinvest.com/news/ethereum-2.0-defi',
                'image_url' => 'https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=800',
                'published_at' => now()->subHours(8),
                'source' => 'Blockchain Today',
                'category' => 'crypto'
            ],
            [
                'title' => 'Inversores institucionales incrementan posiciones en activos digitales',
                'description' => 'Fondos de inversión y bancos aumentan significativamente su exposición a criptomonedas.',
                'url' => 'https://eagleinvest.com/news/institucionales-crypto',
                'image_url' => 'https://images.unsplash.com/photo-1611095790444-1dfa35e37b52?w=800',
                'published_at' => now()->subHours(12),
                'source' => 'Bloomberg Crypto',
                'category' => 'institutional'
            ],
            [
                'title' => 'Análisis: Las 5 tendencias que dominarán el mercado en 2025',
                'description' => 'Expertos predicen qué sectores y tecnologías liderarán las inversiones el próximo año.',
                'url' => 'https://eagleinvest.com/news/tendencias-2025',
                'image_url' => 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
                'published_at' => now()->subDay(),
                'source' => 'Market Watch',
                'category' => 'analysis'
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => $news,
            'category' => $category
        ]);
    }

    /**
     * Obtener trading pairs populares
     */
    public function getTrendingPairs()
    {
        $cacheKey = 'trending_pairs';
        
        $data = Cache::remember($cacheKey, 60, function () {
            try {
                $response = Http::get('https://api.coingecko.com/api/v3/search/trending');
                
                if ($response->successful()) {
                    return $response->json();
                }
                
                return ['coins' => []];
            } catch (\Exception $e) {
                return ['coins' => []];
            }
        });

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    /**
     * Datos mock de criptomonedas
     */
    private function getMockCryptoData()
    {
        return [
            [
                'id' => 'bitcoin',
                'symbol' => 'btc',
                'name' => 'Bitcoin',
                'image' => 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
                'current_price' => 98500 + (mt_rand(-1000, 1000)),
                'market_cap' => 1920000000000,
                'total_volume' => 52000000000,
                'price_change_percentage_24h' => 2.5 + (mt_rand(-200, 200) / 100),
                'high_24h' => 99500,
                'low_24h' => 97000
            ],
            [
                'id' => 'ethereum',
                'symbol' => 'eth',
                'name' => 'Ethereum',
                'image' => 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
                'current_price' => 3650 + (mt_rand(-100, 100)),
                'market_cap' => 438000000000,
                'total_volume' => 24000000000,
                'price_change_percentage_24h' => 3.2 + (mt_rand(-200, 200) / 100),
                'high_24h' => 3700,
                'low_24h' => 3580
            ],
            [
                'id' => 'binancecoin',
                'symbol' => 'bnb',
                'name' => 'BNB',
                'image' => 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
                'current_price' => 620 + (mt_rand(-20, 20)),
                'market_cap' => 95000000000,
                'total_volume' => 2800000000,
                'price_change_percentage_24h' => 1.8 + (mt_rand(-150, 150) / 100),
                'high_24h' => 628,
                'low_24h' => 612
            ]
        ];
    }
}
