<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Withdrawal;
use App\Models\UserInvestment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class WithdrawalController extends Controller
{
    /**
     * Obtener balance disponible para retiro
     */
    public function getAvailableBalance(Request $request, $userId)
    {
        $user = User::findOrFail($userId);
        
        $balance = [
            'earnings_balance' => $user->earnings_balance ?? 0,
            'referral_balance' => $user->referral_balance ?? 0,
            'blocked_balance' => $user->blocked_balance ?? 0,
            'available' => ($user->earnings_balance ?? 0) + ($user->referral_balance ?? 0),
            'total' => ($user->earnings_balance ?? 0) + ($user->referral_balance ?? 0) + ($user->blocked_balance ?? 0),
        ];

        return response()->json($balance);
    }

    /**
     * Validar solicitud de retiro
     */
    public function validateWithdrawal(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'amount' => 'required|numeric|min:10',
            'wallet_address' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'valid' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::find($request->user_id);
        $amount = $request->amount;

        // Obtener inversión activa del usuario
        $activeInvestment = UserInvestment::where('user_id', $user->id)
            ->where('is_active', true)
            ->orderBy('created_at', 'desc')
            ->first();

        $validations = [];

        // 1. Verificar balance suficiente
        $availableBalance = ($user->earnings_balance ?? 0) + ($user->referral_balance ?? 0);
        $validations['sufficient_balance'] = [
            'valid' => $amount <= $availableBalance,
            'message' => $amount <= $availableBalance 
                ? 'Balance suficiente' 
                : "Balance insuficiente. Disponible: $$availableBalance"
        ];

        // 2. Verificar monto mínimo según plan
        $minAmounts = [
            'basico' => 10,
            'intermedio' => 50,
            'premium' => 100,
            'elite' => 500,
        ];

        $planType = $request->plan_type ?? 'basico';
        $minAmount = $minAmounts[$planType] ?? 10;
        
        $validations['minimum_amount'] = [
            'valid' => $amount >= $minAmount,
            'message' => $amount >= $minAmount
                ? "Monto válido para plan $planType"
                : "Monto mínimo para plan $planType: $$minAmount"
        ];

        // 3. Verificar intervalo de retiros
        $lastWithdrawal = Withdrawal::where('user_id', $user->id)
            ->where('status', '!=', 'cancelled')
            ->orderBy('created_at', 'desc')
            ->first();

        $daysRequired = match($planType) {
            'basico' => 10,
            'intermedio' => 10,
            'premium' => 15,
            'elite' => 30,
            default => 10
        };

        $intervalValid = true;
        $intervalMessage = 'Intervalo de retiros respetado';

        if ($lastWithdrawal) {
            $daysSinceLastWithdrawal = now()->diffInDays($lastWithdrawal->created_at);
            $intervalValid = $daysSinceLastWithdrawal >= $daysRequired;
            $intervalMessage = $intervalValid
                ? "Último retiro hace $daysSinceLastWithdrawal días"
                : "Debe esperar $daysRequired días entre retiros. Días transcurridos: $daysSinceLastWithdrawal";
        }

        $validations['withdrawal_interval'] = [
            'valid' => $intervalValid,
            'message' => $intervalMessage
        ];

        // 4. Verificar inversión activa
        $validations['active_investment'] = [
            'valid' => $activeInvestment !== null,
            'message' => $activeInvestment
                ? 'Inversión activa encontrada'
                : 'No tiene inversiones activas'
        ];

        // 5. Validar dirección de wallet
        $walletValid = $this->validateWalletAddress($request->wallet_address);
        $validations['wallet_address'] = [
            'valid' => $walletValid,
            'message' => $walletValid
                ? 'Dirección de wallet válida'
                : 'Dirección de wallet inválida'
        ];

        // Calcular fee
        $feePercentages = [
            'basico' => 20,
            'intermedio' => 10,
            'premium' => 5,
            'elite' => 3,
        ];

        $feePercentage = $feePercentages[$planType] ?? 20;
        $fee = $amount * ($feePercentage / 100);
        $netAmount = $amount - $fee;

        $allValid = collect($validations)->every(fn($v) => $v['valid']);

        return response()->json([
            'valid' => $allValid,
            'validations' => $validations,
            'fee' => $fee,
            'fee_percentage' => $feePercentage,
            'net_amount' => $netAmount,
            'available_balance' => $availableBalance
        ]);
    }

    /**
     * Crear solicitud de retiro
     */
    public function createWithdrawal(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'amount' => 'required|numeric|min:10',
            'withdrawal_method' => 'required|string',
            'wallet_address' => 'required|string',
            'plan_type' => 'required|in:basico,intermedio,premium,elite',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $user = User::findOrFail($request->user_id);
            $amount = $request->amount;
            $planType = $request->plan_type;

            // Calcular fee
            $feePercentages = [
                'basico' => 20,
                'intermedio' => 10,
                'premium' => 5,
                'elite' => 3,
            ];

            $feePercentage = $feePercentages[$planType];
            $fee = $amount * ($feePercentage / 100);
            $netAmount = $amount - $fee;

            // Crear retiro
            $withdrawal = Withdrawal::create([
                'user_id' => $user->id,
                'amount' => $amount,
                'fee' => $fee,
                'net_amount' => $netAmount,
                'withdrawal_method' => $request->withdrawal_method,
                'wallet_address' => $request->wallet_address,
                'plan_type' => $planType,
                'status' => 'pending',
            ]);

            // Bloquear balance
            $user->blocked_balance = ($user->blocked_balance ?? 0) + $amount;
            $user->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Solicitud de retiro creada exitosamente',
                'withdrawal' => $withdrawal
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al crear retiro: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener retiros del usuario
     */
    public function getUserWithdrawals(Request $request, $userId)
    {
        $withdrawals = Withdrawal::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($withdrawals);
    }

    /**
     * Obtener detalle de un retiro
     */
    public function getWithdrawalDetail(Request $request, $id)
    {
        $withdrawal = Withdrawal::with('user')->findOrFail($id);
        return response()->json($withdrawal);
    }

    /**
     * Cancelar retiro (solo si está pending)
     */
    public function cancelWithdrawal(Request $request, $id)
    {
        try {
            DB::beginTransaction();

            $withdrawal = Withdrawal::findOrFail($id);

            if ($withdrawal->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'Solo se pueden cancelar retiros pendientes'
                ], 400);
            }

            // Desbloquear balance
            $user = $withdrawal->user;
            $user->blocked_balance = max(0, ($user->blocked_balance ?? 0) - $withdrawal->amount);
            $user->save();

            // Cancelar retiro
            $withdrawal->status = 'cancelled';
            $withdrawal->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Retiro cancelado exitosamente'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al cancelar retiro: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Validar dirección de wallet
     */
    private function validateWalletAddress(string $address): bool
    {
        // TRC20 validation (starts with T and 34 characters)
        if (preg_match('/^T[A-Za-z0-9]{33}$/', $address)) {
            return true;
        }

        // ERC20 validation (starts with 0x and 42 characters)
        if (preg_match('/^0x[a-fA-F0-9]{40}$/', $address)) {
            return true;
        }

        return false;
    }
}
