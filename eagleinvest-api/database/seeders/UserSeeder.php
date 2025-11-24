<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Usuario de prueba principal
        DB::table('users')->insert([
            'id' => 1,
            'name' => 'Carlos Eduardo Vargas',
            'email' => 'demo@eagleinvest.com',
            'phone' => '+57 310 456 7890',
            'country' => 'Colombia',
            'language' => 'Español',
            'email_verified_at' => now(),
            'password' => Hash::make('123456'),
            'referral_code' => 'CARLOS'.strtoupper(substr(md5(1), 0, 6)),
            'referred_by' => null,
            'total_invested' => 15750.00,
            'total_earnings' => 8420.50,
            'earnings_balance' => 3240.75,
            'referral_balance' => 850.00,
            'blocked_balance' => 0.00,
            'total_withdrawn' => 4329.75,
            'active_investments' => 3,
            'total_referrals' => 7,
            'notifications_enabled' => true,
            'two_factor_enabled' => false,
            'created_at' => now()->subMonths(8),
            'updated_at' => now()
        ]);

        // Algunos usuarios referidos para hacer más realista
        $referredUsers = [
            [
                'name' => 'María González',
                'email' => 'maria.gonzalez@gmail.com',
                'phone' => '+57 315 123 4567',
                'country' => 'Colombia',
                'total_invested' => 2500.00,
                'total_earnings' => 920.30,
                'earnings_balance' => 450.15,
                'active_investments' => 1,
                'created_at' => now()->subMonths(5)
            ],
            [
                'name' => 'Juan Carlos Pérez',
                'email' => 'juan.perez@outlook.com',
                'phone' => '+57 318 987 6543',
                'country' => 'Colombia',
                'total_invested' => 1800.00,
                'total_earnings' => 675.40,
                'earnings_balance' => 320.20,
                'active_investments' => 2,
                'created_at' => now()->subMonths(4)
            ],
            [
                'name' => 'Ana Sofia Rodríguez',
                'email' => 'ana.rodriguez@yahoo.com',
                'phone' => '+57 300 555 1234',
                'country' => 'Colombia',
                'total_invested' => 5200.00,
                'total_earnings' => 2140.80,
                'earnings_balance' => 890.40,
                'active_investments' => 2,
                'created_at' => now()->subMonths(6)
            ],
            [
                'name' => 'Roberto Martínez',
                'email' => 'roberto.martinez@gmail.com',
                'phone' => '+57 312 876 5432',
                'country' => 'Colombia',
                'total_invested' => 950.00,
                'total_earnings' => 285.75,
                'earnings_balance' => 142.85,
                'active_investments' => 1,
                'created_at' => now()->subMonths(3)
            ],
            [
                'name' => 'Laura Fernández',
                'email' => 'laura.fernandez@hotmail.com',
                'phone' => '+57 317 345 6789',
                'country' => 'Colombia',
                'total_invested' => 3300.00,
                'total_earnings' => 1485.60,
                'earnings_balance' => 620.25,
                'active_investments' => 2,
                'created_at' => now()->subMonths(7)
            ]
        ];

        foreach ($referredUsers as $index => $user) {
            DB::table('users')->insert([
                'id' => $index + 2,
                'name' => $user['name'],
                'email' => $user['email'],
                'phone' => $user['phone'],
                'country' => $user['country'],
                'language' => 'Español',
                'email_verified_at' => $user['created_at'],
                'password' => Hash::make('password123'),
                'referral_code' => 'REF'.strtoupper(substr(md5($index + 2), 0, 6)),
                'referred_by' => 1, // Todos referidos por el usuario principal
                'total_invested' => $user['total_invested'],
                'total_earnings' => $user['total_earnings'],
                'earnings_balance' => $user['earnings_balance'],
                'referral_balance' => 0.00,
                'blocked_balance' => 0.00,
                'total_withdrawn' => $user['total_earnings'] - $user['earnings_balance'],
                'active_investments' => $user['active_investments'],
                'total_referrals' => 0,
                'notifications_enabled' => true,
                'two_factor_enabled' => false,
                'created_at' => $user['created_at'],
                'updated_at' => now()
            ]);
        }
    }
}