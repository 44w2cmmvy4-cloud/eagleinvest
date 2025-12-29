<?php

namespace App\Http\Controllers;

use App\Models\Withdrawal;
use App\Models\InvestmentPlan;
use App\Models\PlanLevel;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class WithdrawalController extends Controller
{
    /**
     * Solicitar retiro siguiendo el flujo del diagrama "Fin del Rahn"
     */
    public function requestWithdrawal(Request $request)
    {
        $request->validate([
            'investment_plan_id' => 'required|exists:investment_plans,id'
        ]);

        $user = $request->user();
        $investmentPlan = InvestmentPlan::where('id', $request->investment_plan_id)
            ->where('user_id', $user->id)
            ->first();

        if (!$investmentPlan) {
            return response()->json(['error' => 'Plan de inversión no encontrado'], 404);
        }

        // Paso 1: Verificar si tiene "Value Cortyycado"
        if (!$user->value_cortyycado) {
            return response()->json([
                'error' => 'Error: Contactar Soporte',
                'message' => 'Tu cuenta no tiene verificación activa. Por favor contacta al soporte.'
            ], 403);
        }

        // Paso 2: Retornar Saldo de Rahn
        $currentBalance = $investmentPlan->amount;

        // Paso 3: Determinar qué plan es
        $planTier = $this->determinePlanTier($currentBalance);
        $planLevel = PlanLevel::where('plan_name', $planTier)->first();

        if (!$planLevel) {
            return response()->json(['error' => 'Plan no configurado correctamente'], 500);
        }

        // Paso 4: Verificar minutos transcurridos (MODO SIMULACIÓN)
        $startDate = $investmentPlan->start_date ?? $investmentPlan->created_at;
        $minutesElapsed = Carbon::parse($startDate)->diffInMinutes(now());

        $meetsMinimumTime = $minutesElapsed >= $planLevel->minimum_days; // Usamos minimum_days como minutos

        // Paso 5: Verificar monto mínimo
        $meetsMinimumAmount = $currentBalance >= $planLevel->minimum_withdrawal;

        // Paso 6: Calcular comisión
        $feePercentage = 0;
        $canWithdraw = false;

        if ($meetsMinimumTime && $meetsMinimumAmount) {
            // Aplicar Fase según el plan
            $feePercentage = $this->calculateFeePercentage($planTier, $minutesElapsed); // Pasamos minutos
            $canWithdraw = true;
        } else {
            // Rechazar solicitud
            $reasons = [];
            if (!$meetsMinimumTime) {
                $reasons[] = "Deben transcurrir al menos {$planLevel->minimum_days} minutos (Modo Simulación)";
            }
            if (!$meetsMinimumAmount) {
                $reasons[] = "El monto mínimo de retiro es ${$planLevel->minimum_withdrawal}";
            }

            return response()->json([
                'error' => 'Rechazado: ' . implode('. ', $reasons),
                'can_withdraw' => false,
                'minutes_elapsed' => $minutesElapsed,
                'minutes_required' => $planLevel->minimum_days,
                'current_balance' => $currentBalance,
                'minimum_required' => $planLevel->minimum_withdrawal
            ], 400);
        }

        // Paso 7: Calcular Neto
        $feeAmount = ($currentBalance * $feePercentage) / 100;
        $netAmount = $currentBalance - $feeAmount;

        // Paso 8: Crear solicitud de retiro (Estado Pendiente 1-48h)
        $withdrawal = Withdrawal::create([
            'user_id' => $user->id,
            'investment_plan_id' => $investmentPlan->id,
            'amount' => $currentBalance,
            'fee_percentage' => $feePercentage,
            'net_amount' => $netAmount,
            'status' => 'pending',
            'days_elapsed' => $daysElapsed,
            'meets_minimum' => true,
            'requested_at' => now()
        ]);

        return response()->json([
            'message' => 'Solicitud de retiro creada exitosamente',
            'withdrawal' => $withdrawal,
            'estimated_time' => '1-48 horas',
            'details' => [
                'gross_amount' => $currentBalance,
                'fee_percentage' => $feePercentage,
                'fee_amount' => $feeAmount,
                'net_amount' => $netAmount,
                'days_elapsed' => $daysElapsed
            ]
        ], 201);
    }

    /**
     * Admin: Aprobar retiro
     */
    public function approveWithdrawal(Request $request, $id)
    {
        $admin = $request->user();
        
        if (!$admin->is_admin) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $withdrawal = Withdrawal::findOrFail($id);

        if (!$withdrawal->canBeApproved()) {
            return response()->json(['error' => 'Esta solicitud no puede ser aprobada'], 400);
        }

        $withdrawal->update([
            'status' => 'approved',
            'approved_at' => now(),
            'approved_by' => $admin->id
        ]);

        // Aquí se integraría con el sistema de pagos real
        // Por ahora simulamos el envío

        return response()->json([
            'message' => 'Retiro aprobado exitosamente',
            'withdrawal' => $withdrawal->load(['user', 'investmentPlan'])
        ]);
    }

    /**
     * Admin: Completar retiro (marcar como enviado)
     */
    public function completeWithdrawal(Request $request, $id)
    {
        $admin = $request->user();
        
        if (!$admin->is_admin) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $withdrawal = Withdrawal::findOrFail($id);

        if ($withdrawal->status !== 'approved') {
            return response()->json(['error' => 'Solo se pueden completar retiros aprobados'], 400);
        }

        $withdrawal->update([
            'status' => 'completed'
        ]);

        return response()->json([
            'message' => 'Dinero enviado exitosamente',
            'withdrawal' => $withdrawal
        ]);
    }

    /**
     * Listar retiros pendientes para el admin
     */
    public function pendingWithdrawals(Request $request)
    {
        $admin = $request->user();
        
        if (!$admin->is_admin) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $withdrawals = Withdrawal::pending()
            ->with(['user', 'investmentPlan'])
            ->orderBy('requested_at', 'asc')
            ->get();

        return response()->json($withdrawals);
    }

    /**
     * Historial de retiros del usuario
     */
    public function userWithdrawals(Request $request)
    {
        $user = $request->user();

        $withdrawals = Withdrawal::where('user_id', $user->id)
            ->with('investmentPlan')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($withdrawals);
    }

    /**
     * Determinar tier del plan basado en monto
     */
    private function determinePlanTier($amount): string
    {
        if ($amount >= 5000) {
            return 'Platino';
        } elseif ($amount >= 1000) {
            return 'Oro';
        } elseif ($amount >= 100) {
            return 'Plata';
        } else {
            return 'Bronce';
        }
    }

    /**
     * Calcular porcentaje de comisión según plan y días
     */
    private function calculateFeePercentage($planTier, $daysElapsed): float
    {
        // Lógica según el diagrama
        // Los porcentajes exactos pueden ajustarse según negocio
        
        switch ($planTier) {
            case 'Bronce':
                return $daysElapsed >= 18 ? 5 : 10;
            case 'Plata':
                return $daysElapsed >= 18 ? 3 : 8;
            case 'Oro':
                return $daysElapsed >= 18 ? 2 : 5;
            case 'Platino':
                return $daysElapsed >= 18 ? 1 : 3;
            default:
                return 5;
        }
    }
}
