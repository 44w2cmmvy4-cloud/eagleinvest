<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Commission;
use App\Models\ReferralNetwork;
use App\Models\UserInvestment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CommissionController extends Controller
{
    /**
     * Obtener comisiones del usuario
     */
    public function getUserCommissions(Request $request, $userId)
    {
        $commissions = Commission::where('user_id', $userId)
            ->with(['fromUser'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($commission) {
                return [
                    'id' => $commission->id,
                    'date' => $commission->created_at->toIso8601String(),
                    'fromUserId' => $commission->from_user_id,
                    'fromUserName' => $commission->fromUser->name ?? 'Desconocido',
                    'level' => $commission->level,
                    'amount' => (float) $commission->amount,
                    'percentage' => (float) $commission->percentage,
                    'investmentAmount' => (float) $commission->investment_amount,
                    'status' => $commission->status,
                ];
            });

        return response()->json($commissions);
    }

    /**
     * Obtener comisiones mensuales
     */
    public function getMonthlyCommissions(Request $request, $userId)
    {
        $year = $request->get('year', now()->year);
        $month = $request->get('month', now()->month);

        $commissions = Commission::where('user_id', $userId)
            ->whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->with('fromUser')
            ->get();

        $total = $commissions->where('status', 'paid')->sum('amount');
        $pending = $commissions->where('status', 'pending')->sum('amount');

        return response()->json([
            'year' => $year,
            'month' => $month,
            'total' => $total,
            'pending' => $pending,
            'count' => $commissions->count(),
            'commissions' => $commissions
        ]);
    }

    /**
     * Distribuir comisiones de una inversión
     */
    public function distributeCommissions(Request $request)
    {
        $validator = \Validator::make($request->all(), [
            'investment_id' => 'required|exists:user_investments,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $investment = UserInvestment::with('user')->findOrFail($request->investment_id);
            $investorId = $investment->user_id;
            $amount = $investment->amount;

            // Porcentajes por nivel
            $percentages = [10, 5, 3, 2, 1];

            // Obtener upline (hasta 5 niveles)
            $upline = $this->getUpline($investorId, 5);

            $commissionsCreated = [];

            foreach ($upline as $index => $sponsorId) {
                $level = $index + 1;
                $percentage = $percentages[$index];
                $commissionAmount = $amount * ($percentage / 100);

                // Verificar que el sponsor esté activo
                $sponsorNetwork = ReferralNetwork::where('user_id', $sponsorId)->first();
                if (!$sponsorNetwork || !$sponsorNetwork->is_active) {
                    continue;
                }

                // Crear comisión
                $commission = Commission::create([
                    'user_id' => $sponsorId,
                    'from_user_id' => $investorId,
                    'investment_id' => $investment->id,
                    'level' => $level,
                    'investment_amount' => $amount,
                    'percentage' => $percentage,
                    'amount' => $commissionAmount,
                    'status' => 'pending',
                ]);

                // Actualizar balance del sponsor
                $sponsor = User::find($sponsorId);
                $sponsor->referral_balance = ($sponsor->referral_balance ?? 0) + $commissionAmount;
                $sponsor->save();

                $commissionsCreated[] = $commission;
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Comisiones distribuidas exitosamente',
                'commissions_count' => count($commissionsCreated),
                'total_distributed' => collect($commissionsCreated)->sum('amount')
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al distribuir comisiones: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Marcar comisión como pagada
     */
    public function markCommissionAsPaid(Request $request, $commissionId)
    {
        try {
            $commission = Commission::findOrFail($commissionId);
            $commission->markAsPaid();

            return response()->json([
                'success' => true,
                'message' => 'Comisión marcada como pagada'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener upline (patrocinadores hacia arriba)
     */
    private function getUpline(int $userId, int $levels = 5): array
    {
        $upline = [];
        $currentUserId = $userId;

        for ($i = 0; $i < $levels; $i++) {
            $user = User::find($currentUserId);
            
            if (!$user || !$user->sponsor_id) {
                break;
            }

            $upline[] = $user->sponsor_id;
            $currentUserId = $user->sponsor_id;
        }

        return $upline;
    }

    /**
     * Calcular comisión según nivel
     */
    public function calculateCommission(Request $request)
    {
        $validator = \Validator::make($request->all(), [
            'investment_amount' => 'required|numeric|min:0',
            'level' => 'required|integer|min:1|max:5',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $amount = $request->investment_amount;
        $level = $request->level;

        $percentages = [10, 5, 3, 2, 1];
        $percentage = $percentages[$level - 1];
        $commission = $amount * ($percentage / 100);

        return response()->json([
            'investment_amount' => $amount,
            'level' => $level,
            'percentage' => $percentage,
            'commission_amount' => $commission
        ]);
    }
}
