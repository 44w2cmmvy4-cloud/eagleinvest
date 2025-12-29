<?php

namespace App\Http\Controllers;

use App\Models\InvestmentPlan;
use App\Models\PlanLevel;
use App\Models\MonthlyCommissionCap;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class InvestmentController extends Controller
{
    /**
     * Crear nueva inversión siguiendo el diagrama "Usuario Ingresa Monto a Invertir"
     */
    public function createInvestment(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:10|max:1000000'
        ], [
            'amount.required' => 'El monto de inversión es requerido',
            'amount.numeric' => 'El monto debe ser un número válido',
            'amount.min' => 'El monto mínimo es $10',
            'amount.max' => 'El monto máximo es $1,000,000'
        ]);

        $user = $request->user();
        $amount = floatval($request->amount);

        // Validar que el usuario esté verificado
        /*
        if (!$user->value_cortyycado) {
            return response()->json([
                'error' => 'Tu cuenta debe estar verificada para invertir',
                'message' => 'Contacta al soporte para verificar tu cuenta'
            ], 403);
        }
        */

        // Paso 1: Validar monto mínimo
        if ($amount < 10) {
            return response()->json([
                'error' => 'El monto mínimo es $10',
                'minimum_required' => 10
            ], 400);
        }

        // Paso 2: Clasificar Rango de Inversión
        $planLevel = $this->classifyInvestmentRange($amount);

        if (!$planLevel) {
            return response()->json(['error' => 'No se pudo clasificar el monto'], 500);
        }

        // Paso 3: Asignar Plan correspondiente
        $planTier = $planLevel->plan_name;
        $tierMapping = [
            'Bronce' => 'MICRO IMPACTO',
            'Plata' => 'RÁPIDO SOCIAL',
            'Oro' => 'ESTÁNDAR SOLIDARIO',
            'Platino' => 'PREMIUM HUMANITARIO'
        ];

        $planName = $tierMapping[$planTier] ?? 'ESTÁNDAR';

        // Paso 4: Configurar Candidato (Retiro cada X días / Min $Y)
        DB::beginTransaction();
        try {
            // Calculate rates before creating the record
            $rateMapping = [
                'Bronce' => 1.2,
                'Plata' => 1.8,
                'Oro' => 2.5,
                'Platino' => 3.2
            ];
            $dailyRate = $rateMapping[$planTier] ?? 0.5;
            $dailyReturnAmount = ($amount * $dailyRate) / 100;

            $investment = InvestmentPlan::create([
                'user_id' => $user->id,
                'plan_name' => $planName,
                'plan_tier' => $planTier,
                'amount' => $amount,
                'status' => 'active',
                'start_date' => now(),
                'withdrawal_interval_days' => $planLevel->minimum_days,
                'duration_days' => $planLevel->minimum_days, // Set duration same as min days for now
                'minimum_withdrawal_amount' => $planLevel->minimum_withdrawal,
                'meets_withdrawal_requirements' => false,
                // Required fields from original schema
                'name' => $planName,
                'description' => "Inversión en plan {$planTier}",
                'min_amount' => $planLevel->min_investment ?? 0,
                'max_amount' => 1000000, // Default max
                'daily_return_rate' => $dailyRate,
                'total_return_rate' => $dailyRate * $planLevel->minimum_days,
                'risk_level' => 'Low'
            ]);

            // Create UserInvestment for tracking earnings (Added for Simulation/Dashboard)
            \App\Models\UserInvestment::create([
                'user_id' => $user->id,
                'investment_plan_id' => $investment->id,
                'amount' => $amount,
                'daily_return' => $dailyReturnAmount,
                'total_earned' => 0,
                'start_date' => now(),
                'end_date' => now()->addDays(365), // Default 1 year
                'status' => 'active',
                'last_earning_date' => now(),
                'days_completed' => 0,
                'metadata' => ['rate' => $dailyRate]
            ]);

            // Paso 5: Registrar Fecha de Inicio (Start Time)
            // Ya registrado en start_date

            // Paso 6: Guardar en Base de Datos
            // Ya guardado

            // Si tiene patrocinador, distribuir comisiones
            if ($user->sponsor_id) {
                $this->distributeUnilevelCommissions($user->sponsor_id, $amount, $planTier, 1);
            }

            DB::commit();

            return response()->json([
                'message' => 'Paquete Activado',
                'investment' => $investment,
                'plan_details' => [
                    'tier' => $planTier,
                    'name' => $planName,
                    'withdrawal_interval' => $planLevel->minimum_days . ' minutos (Simulación)',
                    'minimum_withdrawal' => '$' . $planLevel->minimum_withdrawal,
                    'unilevel_levels' => $planLevel->max_level,
                    'monthly_cap' => '$' . $planLevel->monthly_cap
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Error al crear inversión: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Clasificar inversión según rango
     */
    private function classifyInvestmentRange($amount): ?PlanLevel
    {
        return PlanLevel::getPlanByAmount($amount);
    }

    /**
     * Distribuir comisiones unilevel siguiendo el diagrama "Reglas del Plan Unilevel"
     */
    private function distributeUnilevelCommissions($sponsorId, $investmentAmount, $investorPlanTier, $currentLevel = 1)
    {
        if ($currentLevel > 10) {
            return; // Máximo 10 niveles
        }

        $sponsor = \App\Models\User::find($sponsorId);
        
        if (!$sponsor || !$sponsor->sponsor_id) {
            return; // Fin de la cadena
        }

        // Obtener el plan del patrocinador
        $sponsorInvestment = InvestmentPlan::where('user_id', $sponsor->id)
            ->where('status', 'active')
            ->orderBy('amount', 'desc')
            ->first();

        if (!$sponsorInvestment) {
            // Si no tiene inversión activa, pasar al siguiente nivel
            $this->distributeUnilevelCommissions($sponsor->sponsor_id, $investmentAmount, $investorPlanTier, $currentLevel + 1);
            return;
        }

        $sponsorPlanTier = $sponsorInvestment->plan_tier;
        $sponsorPlan = PlanLevel::where('plan_name', $sponsorPlanTier)->first();

        if (!$sponsorPlan) {
            // Pasar al siguiente nivel
            $this->distributeUnilevelCommissions($sponsor->sponsor_id, $investmentAmount, $investorPlanTier, $currentLevel + 1);
            return;
        }

        // Paso 1: ¿Su Rango cubre este Nivel?
        if (!$sponsorPlan->canAccessLevel($currentLevel)) {
            // Rango Insuficiente - pasar al siguiente
            $this->distributeUnilevelCommissions($sponsor->sponsor_id, $investmentAmount, $investorPlanTier, $currentLevel + 1);
            return;
        }

        // Paso 2: ¿Ya superó su Tope Mensual?
        $commissionCap = MonthlyCommissionCap::getOrCreateForUser($sponsor->id, $sponsorPlanTier);

        if (!$commissionCap->canEarnMore()) {
            // Tope Alcanzado - pasar al siguiente
            $this->distributeUnilevelCommissions($sponsor->sponsor_id, $investmentAmount, $investorPlanTier, $currentLevel + 1);
            return;
        }

        // Paso 3: Calcular % y Pagar Comisión
        $commissionPercentage = $sponsorPlan->getCommissionForLevel($currentLevel);
        $commissionAmount = ($investmentAmount * $commissionPercentage) / 100;

        // Verificar si puede ganar el monto completo o parcial
        $remainingCap = $commissionCap->getRemainingAmount();
        $actualCommission = min($commissionAmount, $remainingCap);

        if ($actualCommission > 0) {
            // Registrar transacción de comisión
            \App\Models\Transaction::create([
                'user_id' => $sponsor->id,
                'type' => 'unilevel_commission',
                'amount' => $actualCommission,
                'status' => 'completed',
                'description' => "Comisión nivel {$currentLevel} - {$commissionPercentage}%",
                'metadata' => json_encode([
                    'level' => $currentLevel,
                    'percentage' => $commissionPercentage,
                    'investment_amount' => $investmentAmount,
                    'investor_plan' => $investorPlanTier
                ])
            ]);

            // Actualizar balance del patrocinador
            $sponsor->balance += $actualCommission;
            $sponsor->save();

            // Actualizar cap mensual
            $commissionCap->addEarnings($actualCommission);
        }

        // Paso 4: Siguiente Nivel = Nivel + 1
        // Paso 5: Continuar recursivamente
        $this->distributeUnilevelCommissions($sponsor->sponsor_id, $investmentAmount, $investorPlanTier, $currentLevel + 1);
    }

    /**
     * Obtener inversiones del usuario
     */
    public function userInvestments(Request $request)
    {
        $user = $request->user();

        $investments = InvestmentPlan::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($investments);
    }

    /**
     * Ver detalles de una inversión específica
     */
    public function getInvestment(Request $request, $id)
    {
        $user = $request->user();

        $investment = InvestmentPlan::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$investment) {
            return response()->json(['error' => 'Inversión no encontrada'], 404);
        }

        // Calcular información adicional
        $startDate = $investment->start_date ?? $investment->created_at;
        $daysElapsed = Carbon::parse($startDate)->diffInDays(now());
        $canWithdraw = $daysElapsed >= $investment->withdrawal_interval_days &&
                       $investment->amount >= $investment->minimum_withdrawal_amount;

        return response()->json([
            'investment' => $investment,
            'status_info' => [
                'days_elapsed' => $daysElapsed,
                'days_required' => $investment->withdrawal_interval_days,
                'can_withdraw' => $canWithdraw,
                'next_withdrawal_date' => Carbon::parse($startDate)->addDays($investment->withdrawal_interval_days)->toDateString()
            ]
        ]);
    }
}
