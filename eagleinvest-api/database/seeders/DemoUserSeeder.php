<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class DemoUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'demo@eagleinvest.com'],
            [
                'name' => 'Juan García Martínez',
                'password' => Hash::make('Demo123456'),
                'email_verified_at' => now(),
                'total_invested' => 15500.00,
                'total_earnings' => 2450.50,
                'earnings_balance' => 2450.50,
                'referral_balance' => 890.25,
                'blocked_balance' => 850.00,
                'total_withdrawn' => 5200.00,
                'active_investments' => 5,
                'total_referrals' => 12,
                'phone' => '+57 301 234 5678',
                'country' => 'Colombia',
                'language' => 'Español',
                'notifications_enabled' => true,
                'two_factor_enabled' => false,
            ]
        );
    }
}
