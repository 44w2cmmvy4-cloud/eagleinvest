<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class InvestmentPlansSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Plan Básico',
                'description' => 'Perfecto para principiantes. Inversión segura con retornos estables.',
                'min_amount' => 100.00,
                'max_amount' => 1000.00,
                'daily_return_rate' => 1.2,
                'duration_days' => 30,
                'total_return_rate' => 36.0,
                'risk_level' => 'Low',
                'features' => json_encode([
                    'Retorno diario garantizado',
                    'Capital protegido',
                    'Soporte 24/7',
                    'Retiro instantáneo'
                ]),
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Plan Intermedio',
                'description' => 'Mayor rentabilidad para inversores con experiencia.',
                'min_amount' => 1000.00,
                'max_amount' => 5000.00,
                'daily_return_rate' => 1.8,
                'duration_days' => 45,
                'total_return_rate' => 81.0,
                'risk_level' => 'Medium',
                'features' => json_encode([
                    'Retorno diario del 1.8%',
                    'Bonus de bienvenida',
                    'Asesor personal',
                    'Análisis de mercado'
                ]),
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Plan Premium',
                'description' => 'Para inversores experimentados que buscan máxima rentabilidad.',
                'min_amount' => 5000.00,
                'max_amount' => 25000.00,
                'daily_return_rate' => 2.5,
                'duration_days' => 60,
                'total_return_rate' => 150.0,
                'risk_level' => 'High',
                'features' => json_encode([
                    'Retorno diario del 2.5%',
                    'Acceso VIP',
                    'Estrategias exclusivas',
                    'Retiros prioritarios'
                ]),
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Plan Elite',
                'description' => 'El plan más exclusivo para grandes inversores.',
                'min_amount' => 25000.00,
                'max_amount' => 100000.00,
                'daily_return_rate' => 3.2,
                'duration_days' => 90,
                'total_return_rate' => 288.0,
                'risk_level' => 'High',
                'features' => json_encode([
                    'Retorno diario del 3.2%',
                    'Cuenta gerenciada',
                    'Acceso a mercados exclusivos',
                    'Gestor de cuenta dedicado'
                ]),
                'created_at' => now(),
                'updated_at' => now()
            ]
        ];

        DB::table('investment_plans')->insert($plans);
    }
}