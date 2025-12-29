<?php

namespace Database\Seeders;

use App\Models\PlanLevel;
use Illuminate\Database\Seeder;

class PlanLevelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $plans = [
            [
                'plan_name' => 'Bronce', // Maps to MICRO IMPACTO
                'min_investment' => 10,
                'max_level' => 2,
                'monthly_cap' => 350, // Updated from diagram
                'minimum_days' => 10, // Updated from diagram
                'minimum_withdrawal' => 5, // Updated from diagram
                'level_commissions' => json_encode([
                    '1' => 5,
                    '2' => 3
                ])
            ],
            [
                'plan_name' => 'Plata', // Maps to RÁPIDO SOCIAL
                'min_investment' => 100,
                'max_level' => 5,
                'monthly_cap' => 750,
                'minimum_days' => 10, // Updated from diagram
                'minimum_withdrawal' => 10, // Updated from diagram
                'level_commissions' => json_encode([
                    '1' => 5,
                    '2' => 3,
                    '3' => 2,
                    '4' => 2,
                    '5' => 1
                ])
            ],
            [
                'plan_name' => 'Oro', // Maps to ESTÁNDAR SOLIDARIO
                'min_investment' => 1000,
                'max_level' => 8,
                'monthly_cap' => 2500,
                'minimum_days' => 30, // Updated from diagram
                'minimum_withdrawal' => 200, // Updated from diagram
                'level_commissions' => json_encode([
                    '1' => 5,
                    '2' => 4,
                    '3' => 3,
                    '4' => 3,
                    '5' => 2,
                    '6' => 2,
                    '7' => 1,
                    '8' => 1
                ])
            ],
            [
                'plan_name' => 'Platino', // Maps to PREMIUM HUMANITARIO
                'min_investment' => 5000,
                'max_level' => 10,
                'monthly_cap' => 5000,
                'minimum_days' => 30, // Updated from diagram
                'minimum_withdrawal' => 500, // Updated from diagram
                'level_commissions' => json_encode([
                    '1' => 5,
                    '2' => 4,
                    '3' => 3,
                    '4' => 3,
                    '5' => 3,
                    '6' => 2,
                    '7' => 2,
                    '8' => 2,
                    '9' => 1,
                    '10' => 1
                ])
            ]
        ];

        foreach ($plans as $plan) {
            PlanLevel::updateOrCreate(
                ['plan_name' => $plan['plan_name']],
                $plan
            );
        }
    }
}
