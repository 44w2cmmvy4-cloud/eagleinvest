<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class UserInvestmentsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $userInvestments = [
            // Inversión activa en Plan Intermedio
            [
                'user_id' => 1,
                'investment_plan_id' => 2, // Plan Intermedio
                'amount' => 2500.00,
                'daily_return' => 45.00, // 1.8% diario de 2500
                'total_earned' => 1350.00, // 30 días de ganancias
                'start_date' => Carbon::now()->subDays(30),
                'end_date' => Carbon::now()->addDays(15),
                'status' => 'active',
                'last_earning_date' => Carbon::now()->subDay(),
                'days_completed' => 30,
                'metadata' => json_encode(['auto_reinvest' => false, 'notes' => 'Primera inversión del usuario']),
                'created_at' => Carbon::now()->subDays(30),
                'updated_at' => Carbon::now()
            ],
            // Inversión activa en Plan Premium
            [
                'user_id' => 1,
                'investment_plan_id' => 3, // Plan Premium
                'amount' => 8500.00,
                'daily_return' => 212.50, // 2.5% diario de 8500
                'total_earned' => 4462.50, // 21 días de ganancias
                'start_date' => Carbon::now()->subDays(21),
                'end_date' => Carbon::now()->addDays(39),
                'status' => 'active',
                'last_earning_date' => Carbon::now()->subDay(),
                'days_completed' => 21,
                'metadata' => json_encode(['auto_reinvest' => true, 'bonus_applied' => '5% welcome bonus']),
                'created_at' => Carbon::now()->subDays(21),
                'updated_at' => Carbon::now()
            ],
            // Inversión completada en Plan Básico
            [
                'user_id' => 1,
                'investment_plan_id' => 1, // Plan Básico
                'amount' => 750.00,
                'daily_return' => 9.00, // 1.2% diario de 750
                'total_earned' => 270.00, // 30 días completos
                'start_date' => Carbon::now()->subDays(90),
                'end_date' => Carbon::now()->subDays(60),
                'status' => 'completed',
                'last_earning_date' => Carbon::now()->subDays(60),
                'days_completed' => 30,
                'metadata' => json_encode(['completion_bonus' => 25.00, 'performance' => 'excellent']),
                'created_at' => Carbon::now()->subDays(90),
                'updated_at' => Carbon::now()->subDays(60)
            ],
            // Inversión activa reciente en Plan Elite
            [
                'user_id' => 1,
                'investment_plan_id' => 4, // Plan Elite
                'amount' => 25000.00,
                'daily_return' => 800.00, // 3.2% diario de 25000
                'total_earned' => 2400.00, // 3 días de ganancias
                'start_date' => Carbon::now()->subDays(3),
                'end_date' => Carbon::now()->addDays(87),
                'status' => 'active',
                'last_earning_date' => Carbon::now()->subDay(),
                'days_completed' => 3,
                'metadata' => json_encode(['vip_account' => true, 'dedicated_manager' => 'Sofia Martinez']),
                'created_at' => Carbon::now()->subDays(3),
                'updated_at' => Carbon::now()
            ],
            // Inversión completada anterior
            [
                'user_id' => 1,
                'investment_plan_id' => 2, // Plan Intermedio
                'amount' => 1500.00,
                'daily_return' => 27.00, // 1.8% diario de 1500
                'total_earned' => 1215.00, // 45 días completos
                'start_date' => Carbon::now()->subDays(180),
                'end_date' => Carbon::now()->subDays(135),
                'status' => 'completed',
                'last_earning_date' => Carbon::now()->subDays(135),
                'days_completed' => 45,
                'metadata' => json_encode(['referral_bonus' => 75.00, 'loyalty_bonus' => 50.00]),
                'created_at' => Carbon::now()->subDays(180),
                'updated_at' => Carbon::now()->subDays(135)
            ]
        ];

        DB::table('user_investments')->insert($userInvestments);

        // Agregar algunas inversiones para otros usuarios
        $otherUserInvestments = [
            [
                'user_id' => 2,
                'investment_plan_id' => 1,
                'amount' => 500.00,
                'daily_return' => 6.00,
                'total_earned' => 180.00,
                'start_date' => Carbon::now()->subDays(30),
                'end_date' => Carbon::now(),
                'status' => 'completed',
                'last_earning_date' => Carbon::now(),
                'days_completed' => 30,
                'created_at' => Carbon::now()->subDays(30),
                'updated_at' => Carbon::now()
            ],
            [
                'user_id' => 3,
                'investment_plan_id' => 2,
                'amount' => 1800.00,
                'daily_return' => 32.40,
                'total_earned' => 648.00,
                'start_date' => Carbon::now()->subDays(20),
                'end_date' => Carbon::now()->addDays(25),
                'status' => 'active',
                'last_earning_date' => Carbon::now()->subDay(),
                'days_completed' => 20,
                'created_at' => Carbon::now()->subDays(20),
                'updated_at' => Carbon::now()
            ]
        ];

        DB::table('user_investments')->insert($otherUserInvestments);
    }
}