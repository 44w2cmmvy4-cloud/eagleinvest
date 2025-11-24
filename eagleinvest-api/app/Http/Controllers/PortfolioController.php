<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class PortfolioController extends Controller
{
    /**
     * Obtener portafolio del usuario autenticado
     */
    public function index(Request $request)
    {
        $userId = $request->user()->id;

        // Datos simulados del portafolio
        $portfolio = [
            'id' => $userId,
            'total_value' => 125450.50,
            'invested_amount' => 100000.00,
            'total_return' => 25450.50,
            'return_percentage' => 25.45,
            'daily_change' => 1250.75,
            'daily_change_percentage' => 1.01,
            'last_updated' => now(),
            'investments' => [
                [
                    'id' => 1,
                    'symbol' => 'AAPL',
                    'name' => 'Apple Inc.',
                    'quantity' => 50,
                    'purchase_price' => 150.00,
                    'current_price' => 175.50,
                    'value' => 8775.00,
                    'change' => 1275.00,
                    'change_percentage' => 16.94,
                ],
                [
                    'id' => 2,
                    'symbol' => 'MSFT',
                    'name' => 'Microsoft Corporation',
                    'quantity' => 30,
                    'purchase_price' => 320.00,
                    'current_price' => 380.25,
                    'value' => 11407.50,
                    'change' => 1807.50,
                    'change_percentage' => 18.81,
                ],
                [
                    'id' => 3,
                    'symbol' => 'GOOGL',
                    'name' => 'Alphabet Inc.',
                    'quantity' => 20,
                    'purchase_price' => 100.00,
                    'current_price' => 125.80,
                    'value' => 2516.00,
                    'change' => 516.00,
                    'change_percentage' => 25.80,
                ],
                [
                    'id' => 4,
                    'symbol' => 'TSLA',
                    'name' => 'Tesla Inc.',
                    'quantity' => 15,
                    'purchase_price' => 240.00,
                    'current_price' => 280.50,
                    'value' => 4207.50,
                    'change' => 607.50,
                    'change_percentage' => 16.88,
                ],
                [
                    'id' => 5,
                    'symbol' => 'AMZN',
                    'name' => 'Amazon.com Inc.',
                    'quantity' => 25,
                    'purchase_price' => 140.00,
                    'current_price' => 170.25,
                    'value' => 4256.25,
                    'change' => 756.25,
                    'change_percentage' => 21.61,
                ],
            ],
        ];

        return response()->json($portfolio, 200);
    }

    /**
     * Obtener análisis de mercado
     */
    public function marketAnalysis(Request $request)
    {
        $analysis = [
            'market_overview' => [
                [
                    'index' => 'S&P 500',
                    'value' => 5874.35,
                    'change' => 45.20,
                    'change_percentage' => 0.78,
                    'trend' => 'up',
                ],
                [
                    'index' => 'Nasdaq-100',
                    'value' => 20342.50,
                    'change' => 125.80,
                    'change_percentage' => 0.62,
                    'trend' => 'up',
                ],
                [
                    'index' => 'Dow Jones',
                    'value' => 44851.20,
                    'change' => -32.15,
                    'change_percentage' => -0.07,
                    'trend' => 'down',
                ],
            ],
            'top_gainers' => [
                [
                    'symbol' => 'NVIDIA',
                    'name' => 'NVIDIA Corporation',
                    'price' => 875.50,
                    'change_percentage' => 8.45,
                ],
                [
                    'symbol' => 'TESLA',
                    'name' => 'Tesla Inc.',
                    'price' => 280.50,
                    'change_percentage' => 5.23,
                ],
                [
                    'symbol' => 'META',
                    'name' => 'Meta Platforms',
                    'price' => 525.80,
                    'change_percentage' => 4.18,
                ],
            ],
            'top_losers' => [
                [
                    'symbol' => 'INTEL',
                    'name' => 'Intel Corporation',
                    'price' => 28.45,
                    'change_percentage' => -3.12,
                ],
                [
                    'symbol' => 'IBM',
                    'name' => 'IBM Corporation',
                    'price' => 195.20,
                    'change_percentage' => -2.45,
                ],
                [
                    'symbol' => 'CISCO',
                    'name' => 'Cisco Systems',
                    'price' => 52.10,
                    'change_percentage' => -1.87,
                ],
            ],
        ];

        return response()->json($analysis, 200);
    }

    /**
     * Obtener transacciones del usuario
     */
    public function transactions(Request $request)
    {
        $userId = $request->user()->id;

        $transactions = [
            [
                'id' => 1,
                'type' => 'BUY',
                'symbol' => 'AAPL',
                'quantity' => 50,
                'price' => 150.00,
                'total' => 7500.00,
                'date' => '2025-11-01T10:30:00Z',
                'status' => 'completed',
            ],
            [
                'id' => 2,
                'type' => 'BUY',
                'symbol' => 'MSFT',
                'quantity' => 30,
                'price' => 320.00,
                'total' => 9600.00,
                'date' => '2025-11-03T14:15:00Z',
                'status' => 'completed',
            ],
            [
                'id' => 3,
                'type' => 'SELL',
                'symbol' => 'GOOGL',
                'quantity' => 10,
                'price' => 120.50,
                'total' => 1205.00,
                'date' => '2025-11-05T09:45:00Z',
                'status' => 'completed',
            ],
            [
                'id' => 4,
                'type' => 'BUY',
                'symbol' => 'TSLA',
                'quantity' => 15,
                'price' => 240.00,
                'total' => 3600.00,
                'date' => '2025-11-07T11:20:00Z',
                'status' => 'completed',
            ],
        ];

        return response()->json($transactions, 200);
    }
}
