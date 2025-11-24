<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class TransactionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $transactions = [
            // Depósitos iniciales
            [
                'user_id' => 1,
                'investment_id' => null,
                'type' => 'deposit',
                'amount' => 1000.00,
                'description' => 'Depósito inicial - Transferencia bancaria',
                'status' => 'completed',
                'reference_id' => 'DEP-' . strtoupper(uniqid()),
                'metadata' => json_encode(['payment_method' => 'bank_transfer', 'bank' => 'Bancolombia']),
                'processed_at' => Carbon::now()->subDays(90),
                'created_at' => Carbon::now()->subDays(90),
                'updated_at' => Carbon::now()->subDays(90)
            ],
            [
                'user_id' => 1,
                'investment_id' => null,
                'type' => 'deposit',
                'amount' => 2500.00,
                'description' => 'Depósito - Tarjeta de crédito Visa',
                'status' => 'completed',
                'reference_id' => 'DEP-' . strtoupper(uniqid()),
                'metadata' => json_encode(['payment_method' => 'credit_card', 'card_last4' => '4532']),
                'processed_at' => Carbon::now()->subDays(85),
                'created_at' => Carbon::now()->subDays(85),
                'updated_at' => Carbon::now()->subDays(85)
            ],
            [
                'user_id' => 1,
                'investment_id' => null,
                'type' => 'deposit',
                'amount' => 8500.00,
                'description' => 'Depósito Premium - Transferencia internacional',
                'status' => 'completed',
                'reference_id' => 'DEP-' . strtoupper(uniqid()),
                'metadata' => json_encode(['payment_method' => 'wire_transfer', 'swift' => 'COBACOL***']),
                'processed_at' => Carbon::now()->subDays(21),
                'created_at' => Carbon::now()->subDays(21),
                'updated_at' => Carbon::now()->subDays(21)
            ],
            [
                'user_id' => 1,
                'investment_id' => null,
                'type' => 'deposit',
                'amount' => 25000.00,
                'description' => 'Depósito Elite - Cuenta VIP',
                'status' => 'completed',
                'reference_id' => 'DEP-' . strtoupper(uniqid()),
                'metadata' => json_encode(['payment_method' => 'vip_transfer', 'manager' => 'Sofia Martinez']),
                'processed_at' => Carbon::now()->subDays(3),
                'created_at' => Carbon::now()->subDays(3),
                'updated_at' => Carbon::now()->subDays(3)
            ],

            // Inversiones realizadas (investment_id debe ser NULL para este tipo)
            [
                'user_id' => 1,
                'investment_id' => null,
                'type' => 'investment',
                'amount' => -750.00,
                'description' => 'Inversión en Plan Básico - 30 días',
                'status' => 'completed',
                'reference_id' => 'INV-' . strtoupper(uniqid()),
                'metadata' => json_encode(['plan' => 'Básico', 'duration' => 30, 'daily_return' => '1.2%']),
                'processed_at' => Carbon::now()->subDays(90),
                'created_at' => Carbon::now()->subDays(90),
                'updated_at' => Carbon::now()->subDays(90)
            ],
            [
                'user_id' => 1,
                'investment_id' => null,
                'type' => 'investment',
                'amount' => -2500.00,
                'description' => 'Inversión en Plan Intermedio - 45 días',
                'status' => 'completed',
                'reference_id' => 'INV-' . strtoupper(uniqid()),
                'metadata' => json_encode(['plan' => 'Intermedio', 'duration' => 45, 'daily_return' => '1.8%']),
                'processed_at' => Carbon::now()->subDays(30),
                'created_at' => Carbon::now()->subDays(30),
                'updated_at' => Carbon::now()->subDays(30)
            ],
            [
                'user_id' => 1,
                'investment_id' => null,
                'type' => 'investment',
                'amount' => -8500.00,
                'description' => 'Inversión en Plan Premium - 60 días',
                'status' => 'completed',
                'reference_id' => 'INV-' . strtoupper(uniqid()),
                'metadata' => json_encode(['plan' => 'Premium', 'duration' => 60, 'daily_return' => '2.5%', 'bonus' => '5%']),
                'processed_at' => Carbon::now()->subDays(21),
                'created_at' => Carbon::now()->subDays(21),
                'updated_at' => Carbon::now()->subDays(21)
            ],
            [
                'user_id' => 1,
                'investment_id' => null,
                'type' => 'investment',
                'amount' => -25000.00,
                'description' => 'Inversión en Plan Elite - 90 días',
                'status' => 'completed',
                'reference_id' => 'INV-' . strtoupper(uniqid()),
                'metadata' => json_encode(['plan' => 'Elite', 'duration' => 90, 'daily_return' => '3.2%', 'vip_account' => true]),
                'processed_at' => Carbon::now()->subDays(3),
                'created_at' => Carbon::now()->subDays(3),
                'updated_at' => Carbon::now()->subDays(3)
            ],

            // Ganancias diarias (últimos 7 días)
            [
                'user_id' => 1,
                'investment_id' => null,
                'type' => 'earnings',
                'amount' => 45.00,
                'description' => 'Ganancia diaria - Plan Intermedio (1.8%)',
                'status' => 'completed',
                'reference_id' => 'EARN-' . strtoupper(uniqid()),
                'metadata' => json_encode(['daily_rate' => '1.8%', 'investment_plan' => 'Intermedio']),
                'processed_at' => Carbon::now()->subDays(1),
                'created_at' => Carbon::now()->subDays(1),
                'updated_at' => Carbon::now()->subDays(1)
            ],
            [
                'user_id' => 1,
                'investment_id' => null,
                'type' => 'earnings',
                'amount' => 212.50,
                'description' => 'Ganancia diaria - Plan Premium (2.5%)',
                'status' => 'completed',
                'reference_id' => 'EARN-' . strtoupper(uniqid()),
                'metadata' => json_encode(['daily_rate' => '2.5%', 'investment_plan' => 'Premium']),
                'processed_at' => Carbon::now()->subDays(1),
                'created_at' => Carbon::now()->subDays(1),
                'updated_at' => Carbon::now()->subDays(1)
            ],
            [
                'user_id' => 1,
                'investment_id' => null,
                'type' => 'earnings',
                'amount' => 800.00,
                'description' => 'Ganancia diaria - Plan Elite (3.2%)',
                'status' => 'completed',
                'reference_id' => 'EARN-' . strtoupper(uniqid()),
                'metadata' => json_encode(['daily_rate' => '3.2%', 'investment_plan' => 'Elite']),
                'processed_at' => Carbon::now()->subDays(1),
                'created_at' => Carbon::now()->subDays(1),
                'updated_at' => Carbon::now()->subDays(1)
            ],

            // Bonos y referidos
            [
                'user_id' => 1,
                'investment_id' => null,
                'type' => 'referral',
                'amount' => 125.00,
                'description' => 'Comisión por referido - María González',
                'status' => 'completed',
                'reference_id' => 'REF-' . strtoupper(uniqid()),
                'metadata' => json_encode(['referred_user' => 'María González', 'commission_rate' => '5%']),
                'processed_at' => Carbon::now()->subDays(10),
                'created_at' => Carbon::now()->subDays(10),
                'updated_at' => Carbon::now()->subDays(10)
            ],
            [
                'user_id' => 1,
                'investment_id' => null,
                'type' => 'bonus',
                'amount' => 425.00,
                'description' => 'Bonus de bienvenida Plan Premium',
                'status' => 'completed',
                'reference_id' => 'BONUS-' . strtoupper(uniqid()),
                'metadata' => json_encode(['bonus_type' => 'welcome', 'percentage' => '5%']),
                'processed_at' => Carbon::now()->subDays(21),
                'created_at' => Carbon::now()->subDays(21),
                'updated_at' => Carbon::now()->subDays(21)
            ],
            [
                'user_id' => 1,
                'investment_id' => null,
                'type' => 'referral',
                'amount' => 90.00,
                'description' => 'Comisión por referido - Juan Carlos Pérez',
                'status' => 'completed',
                'reference_id' => 'REF-' . strtoupper(uniqid()),
                'metadata' => json_encode(['referred_user' => 'Juan Carlos Pérez', 'commission_rate' => '5%']),
                'processed_at' => Carbon::now()->subDays(15),
                'created_at' => Carbon::now()->subDays(15),
                'updated_at' => Carbon::now()->subDays(15)
            ]
        ];

        // Generar más ganancias históricas para hacer más realista
        for ($i = 2; $i <= 30; $i++) {
            // Ganancias del Plan Intermedio
            $transactions[] = [
                'user_id' => 1,
                'investment_id' => null,
                'type' => 'earnings',
                'amount' => 45.00,
                'description' => 'Ganancia diaria - Plan Intermedio (1.8%)',
                'status' => 'completed',
                'reference_id' => 'EARN-' . strtoupper(uniqid()),
                'metadata' => json_encode(['daily_rate' => '1.8%', 'investment_plan' => 'Intermedio']),
                'processed_at' => Carbon::now()->subDays($i),
                'created_at' => Carbon::now()->subDays($i),
                'updated_at' => Carbon::now()->subDays($i)
            ];
        }

        for ($i = 2; $i <= 21; $i++) {
            // Ganancias del Plan Premium
            $transactions[] = [
                'user_id' => 1,
                'investment_id' => null,
                'type' => 'earnings',
                'amount' => 212.50,
                'description' => 'Ganancia diaria - Plan Premium (2.5%)',
                'status' => 'completed',
                'reference_id' => 'EARN-' . strtoupper(uniqid()),
                'metadata' => json_encode(['daily_rate' => '2.5%', 'investment_plan' => 'Premium']),
                'processed_at' => Carbon::now()->subDays($i),
                'created_at' => Carbon::now()->subDays($i),
                'updated_at' => Carbon::now()->subDays($i)
            ];
        }

        for ($i = 2; $i <= 3; $i++) {
            // Ganancias del Plan Elite
            $transactions[] = [
                'user_id' => 1,
                'investment_id' => null,
                'type' => 'earnings',
                'amount' => 800.00,
                'description' => 'Ganancia diaria - Plan Elite (3.2%)',
                'status' => 'completed',
                'reference_id' => 'EARN-' . strtoupper(uniqid()),
                'metadata' => json_encode(['daily_rate' => '3.2%', 'investment_plan' => 'Elite']),
                'processed_at' => Carbon::now()->subDays($i),
                'created_at' => Carbon::now()->subDays($i),
                'updated_at' => Carbon::now()->subDays($i)
            ];
        }

        DB::table('transactions')->insert($transactions);
    }
}