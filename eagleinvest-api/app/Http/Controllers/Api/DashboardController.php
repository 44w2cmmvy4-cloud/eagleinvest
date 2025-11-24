<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\InvestmentPlan;
use App\Models\UserInvestment;
use App\Models\Transaction;
use App\Models\Withdrawal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class DashboardController extends Controller
{
    /**
     * Autenticar usuario contra la base de datos
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $email = $request->email;
        $password = $request->password;
        
        // Buscar usuario en la base de datos
        $user = User::where('email', $email)->first();
        
        // Verificar si el usuario existe y la contraseña es correcta
        if ($user && Hash::check($password, $user->password)) {
            return response()->json([
                'success' => true,
                'message' => 'Login exitoso',
                'user' => $user,
                'token' => 'bearer-token-' . $user->id . '-' . time()
            ]);
        }
        
        return response()->json([
            'success' => false,
            'message' => 'Credenciales inválidas. Verifica tu email y contraseña.'
        ], 401);
    }

    /**
     * Obtener datos del dashboard del usuario
     */
    public function getDashboardData($userId)
    {
        $user = User::find($userId);
        if (!$user) {
            return response()->json(['error' => 'Usuario no encontrado'], 404);
        }

        // Inversiones activas
        $activeInvestments = UserInvestment::with('investmentPlan')
            ->where('user_id', $userId)
            ->where('status', 'active')
            ->get();

        // Últimas transacciones
        $recentTransactions = Transaction::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // Ganancias de los últimos 7 días
        $weeklyEarnings = Transaction::where('user_id', $userId)
            ->where('type', 'earnings')
            ->where('created_at', '>=', now()->subDays(7))
            ->sum('amount');

        // Estadísticas
        $stats = [
            'total_invested' => $user->total_invested,
            'total_earnings' => $user->total_earnings,
            'earnings_balance' => $user->earnings_balance,
            'referral_balance' => $user->referral_balance,
            'active_investments' => $user->active_investments,
            'total_referrals' => $user->total_referrals,
            'weekly_earnings' => $weeklyEarnings
        ];

        return response()->json([
            'user' => $user,
            'stats' => $stats,
            'active_investments' => $activeInvestments,
            'recent_transactions' => $recentTransactions
        ]);
    }

    /**
     * Obtener planes de inversión disponibles
     */
    public function getInvestmentPlans()
    {
        $plans = InvestmentPlan::where('is_active', true)->get();
        return response()->json($plans);
    }

    /**
     * Obtener todas las transacciones del usuario
     */
    public function getTransactions($userId, Request $request)
    {
        $query = Transaction::where('user_id', $userId)
            ->orderBy('created_at', 'desc');

        // Filtros opcionales
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }
        
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $transactions = $query->paginate(20);
        return response()->json($transactions);
    }

    /**
     * Obtener retiros del usuario
     */
    public function getWithdrawals($userId)
    {
        $withdrawals = Withdrawal::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json($withdrawals);
    }

    /**
     * Crear nueva solicitud de retiro
     */
    public function createWithdrawal(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'amount' => 'required|numeric|min:10',
            'payment_method' => 'required|string',
            'account_details' => 'required|string'
        ]);

        $user = User::find($request->user_id);
        
        // Verificar que el usuario tenga suficiente saldo
        if ($user->earnings_balance < $request->amount) {
            return response()->json([
                'error' => 'Saldo insuficiente'
            ], 400);
        }

        // Calcular comisión (ejemplo: 2%)
        $fee = $request->amount * 0.02;
        $netAmount = $request->amount - $fee;

        $withdrawal = Withdrawal::create([
            'user_id' => $request->user_id,
            'amount' => $request->amount,
            'payment_method' => $request->payment_method,
            'account_details' => $request->account_details,
            'status' => 'pending',
            'reference_id' => 'WD-' . strtoupper(uniqid()),
            'fee' => $fee,
            'net_amount' => $netAmount
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Solicitud de retiro creada exitosamente',
            'withdrawal' => $withdrawal
        ]);
    }

    /**
     * Obtener datos del perfil del usuario
     */
    public function getProfile($userId)
    {
        $user = User::find($userId);
        if (!$user) {
            return response()->json(['error' => 'Usuario no encontrado'], 404);
        }

        // Actividad reciente
        $recentActivity = Transaction::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Retiros pendientes
        $pendingWithdrawals = Withdrawal::where('user_id', $userId)
            ->whereIn('status', ['pending', 'processing'])
            ->count();

        return response()->json([
            'user' => $user,
            'recent_activity' => $recentActivity,
            'pending_withdrawals' => $pendingWithdrawals
        ]);
    }

    /**
     * Actualizar perfil del usuario
     */
    public function updateProfile(Request $request, $userId)
    {
        $user = User::find($userId);
        if (!$user) {
            return response()->json(['error' => 'Usuario no encontrado'], 404);
        }

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'phone' => 'sometimes|nullable|string|max:20',
            'country' => 'sometimes|required|string|max:100',
            'language' => 'sometimes|required|string|max:50',
            'notifications_enabled' => 'sometimes|boolean',
            'two_factor_enabled' => 'sometimes|boolean'
        ]);

        $user->update($request->only([
            'name', 'phone', 'country', 'language', 
            'notifications_enabled', 'two_factor_enabled'
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Perfil actualizado exitosamente',
            'user' => $user
        ]);
    }

    /**
     * Obtener estadísticas de referidos
     */
    public function getReferralStats($userId)
    {
        $user = User::find($userId);
        if (!$user) {
            return response()->json(['error' => 'Usuario no encontrado'], 404);
        }

        // Obtener referidos del usuario
        $referrals = User::where('referred_by', $userId)->get();
        $activeReferrals = $referrals->where('status', 'active')->count();
        
        // Calcular comisiones totales y del mes
        $totalCommission = $user->referral_balance ?? 0;
        $thisMonthCommission = Transaction::where('user_id', $userId)
            ->where('type', 'referral_commission')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('amount');

        return response()->json([
            'total_referrals' => $user->total_referrals ?? 0,
            'active_referrals' => $activeReferrals,
            'total_commission' => $totalCommission,
            'this_month_commission' => $thisMonthCommission,
            'referral_link' => "https://eagleinvest.com/register?ref={$user->referral_code}"
        ]);
    }

    /**
     * Obtener lista de referidos
     */
    public function getReferrals($userId)
    {
        $user = User::find($userId);
        if (!$user) {
            return response()->json(['error' => 'Usuario no encontrado'], 404);
        }

        // Obtener referidos directos (nivel 1)
        $referrals = User::where('referred_by', $userId)
            ->get()
            ->map(function($referral) {
                $totalInvested = UserInvestment::where('user_id', $referral->id)
                    ->sum('amount');
                
                $commissionEarned = Transaction::where('user_id', $referral->referred_by)
                    ->where('type', 'referral_commission')
                    ->where('description', 'like', "%{$referral->name}%")
                    ->sum('amount');

                return [
                    'id' => $referral->id,
                    'name' => $referral->name,
                    'email' => $referral->email,
                    'joined_date' => $referral->created_at,
                    'status' => $totalInvested > 0 ? 'active' : 'pending',
                    'total_invested' => $totalInvested,
                    'commission_earned' => $commissionEarned,
                    'level' => 1
                ];
            });

        return response()->json($referrals);
    }
}
