<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class WithdrawalsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $withdrawals = [
            // Retiro completado hace 2 meses
            [
                'user_id' => 1,
                'amount' => 1500.00,
                'payment_method' => 'Bank Transfer',
                'account_details' => 'Bancolombia - ***1234',
                'status' => 'completed',
                'reference_id' => 'WD-' . strtoupper(uniqid()),
                'admin_notes' => 'Procesado exitosamente. Cliente VIP.',
                'processed_at' => Carbon::now()->subDays(60),
                'fee' => 25.00,
                'net_amount' => 1475.00,
                'created_at' => Carbon::now()->subDays(62),
                'updated_at' => Carbon::now()->subDays(60)
            ],
            // Retiro completado hace 1 mes
            [
                'user_id' => 1,
                'amount' => 2500.00,
                'payment_method' => 'PayPal',
                'account_details' => 'carlos.vargas@email.com',
                'status' => 'completed',
                'reference_id' => 'WD-' . strtoupper(uniqid()),
                'admin_notes' => 'Retiro express procesado en 24h.',
                'processed_at' => Carbon::now()->subDays(30),
                'fee' => 75.00,
                'net_amount' => 2425.00,
                'created_at' => Carbon::now()->subDays(32),
                'updated_at' => Carbon::now()->subDays(30)
            ],
            // Retiro completado hace 2 semanas
            [
                'user_id' => 1,
                'amount' => 800.00,
                'payment_method' => 'Crypto Wallet',
                'account_details' => 'USDT - TRC20: TXn7...89kL',
                'status' => 'completed',
                'reference_id' => 'WD-' . strtoupper(uniqid()),
                'admin_notes' => 'Transferencia blockchain confirmada.',
                'processed_at' => Carbon::now()->subDays(14),
                'fee' => 10.00,
                'net_amount' => 790.00,
                'created_at' => Carbon::now()->subDays(15),
                'updated_at' => Carbon::now()->subDays(14)
            ],
            // Retiro en proceso (pendiente)
            [
                'user_id' => 1,
                'amount' => 1200.00,
                'payment_method' => 'Bank Transfer',
                'account_details' => 'Davivienda - ***5678',
                'status' => 'processing',
                'reference_id' => 'WD-' . strtoupper(uniqid()),
                'admin_notes' => 'En verificación por departamento financiero.',
                'processed_at' => null,
                'fee' => 30.00,
                'net_amount' => 1170.00,
                'created_at' => Carbon::now()->subDays(2),
                'updated_at' => Carbon::now()->subDays(1)
            ],
            // Retiro solicitado ayer
            [
                'user_id' => 1,
                'amount' => 500.00,
                'payment_method' => 'PayPal',
                'account_details' => 'carlos.vargas@email.com',
                'status' => 'pending',
                'reference_id' => 'WD-' . strtoupper(uniqid()),
                'admin_notes' => null,
                'processed_at' => null,
                'fee' => 15.00,
                'net_amount' => 485.00,
                'created_at' => Carbon::now()->subDay(),
                'updated_at' => Carbon::now()->subDay()
            ],
            // Retiros de otros usuarios para completar datos
            [
                'user_id' => 2,
                'amount' => 300.00,
                'payment_method' => 'Bank Transfer',
                'account_details' => 'Banco Popular - ***9876',
                'status' => 'completed',
                'reference_id' => 'WD-' . strtoupper(uniqid()),
                'admin_notes' => 'Usuario regular - procesado normalmente.',
                'processed_at' => Carbon::now()->subDays(7),
                'fee' => 15.00,
                'net_amount' => 285.00,
                'created_at' => Carbon::now()->subDays(9),
                'updated_at' => Carbon::now()->subDays(7)
            ],
            [
                'user_id' => 3,
                'amount' => 450.00,
                'payment_method' => 'Nequi',
                'account_details' => '+57 318 987 6543',
                'status' => 'completed',
                'reference_id' => 'WD-' . strtoupper(uniqid()),
                'admin_notes' => 'Transferencia instantánea completada.',
                'processed_at' => Carbon::now()->subDays(5),
                'fee' => 5.00,
                'net_amount' => 445.00,
                'created_at' => Carbon::now()->subDays(6),
                'updated_at' => Carbon::now()->subDays(5)
            ]
        ];

        DB::table('withdrawals')->insert($withdrawals);
    }
}
