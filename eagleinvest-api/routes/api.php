<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController as ApiAuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\MarketDataController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TwoFactorController;
use App\Http\Controllers\WalletController;

// Rutas públicas de autenticación
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [ApiAuthController::class, 'login']);
Route::post('/auth/verify-2fa', [TwoFactorController::class, 'verify2FACode']);
Route::post('/auth/resend-2fa', [TwoFactorController::class, 'resend2FACode']);

// Wallet routes (public for connection)
Route::get('/wallet/{userId}', [WalletController::class, 'getWalletInfo']);
Route::post('/wallet/connect', [WalletController::class, 'connectWallet']);
Route::post('/wallet/disconnect', [WalletController::class, 'disconnectWallet']);


// Rutas de demo (sin autenticación)
Route::post('/demo/login', [DashboardController::class, 'login']);
Route::prefix('demo')->group(function () {
    Route::get('/dashboard/{userId}', [DashboardController::class, 'getDashboardData']);
    Route::get('/plans', [DashboardController::class, 'getInvestmentPlans']);
    Route::get('/transactions/{userId}', [DashboardController::class, 'getTransactions']);
    Route::get('/withdrawals/{userId}', [DashboardController::class, 'getWithdrawals']);
    Route::post('/withdrawals', [DashboardController::class, 'createWithdrawal']);
    Route::get('/profile/{userId}', [DashboardController::class, 'getProfile']);
    Route::put('/profile/{userId}', [DashboardController::class, 'updateProfile']);
    Route::get('/referrals/{userId}/stats', [DashboardController::class, 'getReferralStats']);
    Route::get('/referrals/{userId}', [DashboardController::class, 'getReferrals']);
});

// Rutas de datos de mercado (públicas)
Route::prefix('market')->group(function () {
    Route::get('/crypto/prices', [MarketDataController::class, 'getCryptoPrices']);
    Route::get('/crypto/{coinId}/history', [MarketDataController::class, 'getCryptoHistory']);
    Route::get('/indices', [MarketDataController::class, 'getMarketIndices']);
    Route::get('/news', [MarketDataController::class, 'getFinanceNews']);
    Route::get('/trending', [MarketDataController::class, 'getTrendingPairs']);
});

// Rutas protegidas
Route::middleware('auth:sanctum')->group(function () {
    // Autenticación
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/verify', [AuthController::class, 'verify']);

    // Portafolio
    Route::get('/portfolio', [PortfolioController::class, 'index']);
    Route::get('/portfolio/market-analysis', [PortfolioController::class, 'marketAnalysis']);
    Route::get('/portfolio/transactions', [PortfolioController::class, 'transactions']);

    // Usuario
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::get('/profile', ProfileController::class);
});

