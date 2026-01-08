<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\MarketDataController;
use App\Http\Controllers\Api\ReferralController as ApiReferralController;
use App\Http\Controllers\ReferralController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TwoFactorController;
use App\Http\Controllers\WalletController;
use App\Http\Controllers\WithdrawalController;
use App\Http\Controllers\InvestmentController;
use App\Http\Controllers\SupportTicketController;
use App\Http\Controllers\Api\WithdrawalController as ApiWithdrawalController;
use App\Http\Controllers\Api\NetworkController;
use App\Http\Controllers\Api\CommissionController;
use App\Http\Controllers\Api\Admin\AdminWithdrawalController;

// Rutas públicas de autenticación
Route::post('/auth/register', [AuthController::class, 'register'])->middleware('throttle:60,1');
Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:60,1');
Route::post('/auth/verify-2fa', [TwoFactorController::class, 'verify2FACode'])->middleware('throttle:60,1');
Route::post('/auth/resend-2fa', [TwoFactorController::class, 'resend2FACode'])->middleware('throttle:60,1');

// Rutas de invitación (públicas) - Sistema de diagramas
Route::get('/referrals/check', [ReferralController::class, 'checkInvitation'])->middleware('throttle:20,1');
Route::post('/referrals/register', [ReferralController::class, 'register'])->middleware('throttle:3,10');

// Rutas de datos de mercado (públicas)
Route::prefix('market')->middleware('throttle:30,1')->group(function () {
    Route::get('/crypto/prices', [MarketDataController::class, 'getCryptoPrices']);
    Route::get('/crypto/{coinId}/history', [MarketDataController::class, 'getCryptoHistory']);
    Route::get('/indices', [MarketDataController::class, 'getMarketIndices']);
    Route::get('/news', [MarketDataController::class, 'getFinanceNews']);
    Route::get('/trending', [MarketDataController::class, 'getTrendingPairs']);
});

// Rutas protegidas
Route::middleware(['auth:sanctum', 'throttle:60,1'])->group(function () {
    // Autenticación
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    // Usuario
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    
    // Inversiones - Sistema de diagramas
    Route::prefix('investments')->group(function () {
        Route::post('/', [InvestmentController::class, 'createInvestment'])->middleware('throttle:10,60');
        Route::get('/', [InvestmentController::class, 'userInvestments']);
        Route::get('/{id}', [InvestmentController::class, 'getInvestment']);
    });

    // Retiros - Sistema de diagramas
    Route::prefix('withdrawals')->group(function () {
        Route::post('/', [WithdrawalController::class, 'requestWithdrawal'])->middleware('throttle:5,60');
        Route::get('/', [WithdrawalController::class, 'userWithdrawals']);
        
        // Admin routes
        Route::middleware('admin')->group(function () {
            Route::get('/pending/all', [WithdrawalController::class, 'pendingWithdrawals']);
            Route::post('/{id}/approve', [WithdrawalController::class, 'approveWithdrawal']);
            Route::post('/{id}/complete', [WithdrawalController::class, 'completeWithdrawal']);
        });
    });

    // Tickets de soporte - Sistema de diagramas
    Route::prefix('support')->group(function () {
        Route::post('/wallet-change', [SupportTicketController::class, 'requestWalletChange'])->middleware('throttle:3,60');
        Route::get('/tickets', [SupportTicketController::class, 'userTickets']);
        Route::get('/tickets/{id}', [SupportTicketController::class, 'getTicket']);

        // Admin routes
        Route::middleware('admin')->group(function () {
            Route::get('/tickets/pending/all', [SupportTicketController::class, 'pendingTickets']);
            Route::post('/tickets/{id}/review', [SupportTicketController::class, 'reviewTicket']);
            Route::post('/tickets/{id}/verify-identity', [SupportTicketController::class, 'verifyIdentity']);
            Route::post('/tickets/{id}/approve', [SupportTicketController::class, 'approveWalletChange']);
            Route::post('/tickets/{id}/reject', [SupportTicketController::class, 'rejectWalletChange']);
        });
    });

    // Red de referidos - Sistema de diagramas
    Route::prefix('referrals')->group(function () {
        Route::get('/code', [ReferralController::class, 'getReferralCode']);
        Route::get('/network', [ReferralController::class, 'getNetwork']);
    });

    // ========== NUEVOS ENDPOINTS - SISTEMA COMPLETO ==========

    // Retiros mejorados
    Route::prefix('withdrawals/v2')->group(function () {
        Route::get('/balance/{userId}', [ApiWithdrawalController::class, 'getAvailableBalance']);
        Route::post('/validate', [ApiWithdrawalController::class, 'validateWithdrawal']);
        Route::post('/create', [ApiWithdrawalController::class, 'createWithdrawal'])->middleware('throttle:5,60');
        Route::get('/user/{userId}', [ApiWithdrawalController::class, 'getUserWithdrawals']);
        Route::get('/{id}', [ApiWithdrawalController::class, 'getWithdrawalDetail']);
        Route::post('/{id}/cancel', [ApiWithdrawalController::class, 'cancelWithdrawal']);
    });

    // Red Unilevel
    Route::prefix('network')->group(function () {
        Route::get('/level/{userId}', [NetworkController::class, 'getUserLevel']);
        Route::get('/tree/{userId}', [NetworkController::class, 'getUserNetwork']);
        Route::get('/referrals/{userId}', [NetworkController::class, 'getDirectReferrals']);
        Route::get('/stats/{userId}', [NetworkController::class, 'getNetworkStats']);
    });

    // Comisiones
    Route::prefix('commissions')->group(function () {
        Route::get('/user/{userId}', [CommissionController::class, 'getUserCommissions']);
        Route::get('/monthly/{userId}', [CommissionController::class, 'getMonthlyCommissions']);
        Route::post('/distribute', [CommissionController::class, 'distributeCommissions']);
        Route::post('/{id}/mark-paid', [CommissionController::class, 'markCommissionAsPaid']);
        Route::post('/calculate', [CommissionController::class, 'calculateCommission']);
    });

    // Admin - Gestión de Retiros
    Route::prefix('admin/withdrawals')->middleware('admin')->group(function () {
        Route::get('/pending', [AdminWithdrawalController::class, 'getPendingWithdrawals']);
        Route::get('/all', [AdminWithdrawalController::class, 'getAllWithdrawals']);
        Route::post('/{id}/approve', [AdminWithdrawalController::class, 'approveWithdrawal']);
        Route::post('/{id}/reject', [AdminWithdrawalController::class, 'rejectWithdrawal']);
        Route::post('/{id}/process', [AdminWithdrawalController::class, 'processWithdrawal']);
        Route::post('/{id}/complete', [AdminWithdrawalController::class, 'completeWithdrawal']);
        Route::get('/stats', [AdminWithdrawalController::class, 'getWithdrawalStats']);
    });
});

