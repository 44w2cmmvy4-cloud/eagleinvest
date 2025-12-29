<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Usuario Administrador
        $admin = User::firstOrCreate(
            ['email' => 'admin@eagleinvest.com'],
            [
                'name' => 'Administrador',
                'password' => Hash::make('Admin123456!'),
                'wallet' => '0xADMIN1234567890ABCDEF',
                'referral_code' => 'ADMIN001',
                'sponsor_id' => null,
                'is_admin' => true,
                'wallet_editable' => true,
                'value_cortyycado' => true,
                'requires_invitation' => false,
                'phone_number' => '+5215512345678',
                'phone_verified' => true,
                'total_invested' => 0,
                'total_earnings' => 0,
                'earnings_balance' => 0,
                'referral_balance' => 0,
                'blocked_balance' => 0,
                'total_withdrawn' => 0,
                'active_investments' => 0,
                'total_referrals' => 0,
            ]
        );

        $this->command->info('✅ Usuario Admin creado:');
        $this->command->info('   Email: admin@eagleinvest.com');
        $this->command->info('   Password: Admin123456!');
        $this->command->info('   Referral Code: ADMIN001');
        $this->command->newLine();

        // Usuario de Prueba 1 (Patrocinador)
        $user1 = User::firstOrCreate(
            ['email' => 'usuario1@test.com'],
            [
                'name' => 'Usuario Prueba 1',
                'password' => Hash::make('Test123456!'),
                'wallet' => '0xUSER0001234567890ABCDEF',
                'referral_code' => 'TEST0001',
                'sponsor_id' => $admin->id,
                'is_admin' => false,
                'wallet_editable' => false,
                'value_cortyycado' => true,
                'requires_invitation' => true,
                'phone_number' => '+5215512345679',
                'phone_verified' => true,
                'total_invested' => 1000,
                'total_earnings' => 150,
                'earnings_balance' => 150,
                'referral_balance' => 0,
                'blocked_balance' => 0,
                'total_withdrawn' => 0,
                'active_investments' => 1,
                'total_referrals' => 0,
            ]
        );

        $this->command->info('✅ Usuario Test 1 creado:');
        $this->command->info('   Email: usuario1@test.com');
        $this->command->info('   Password: Test123456!');
        $this->command->info('   Referral Code: TEST0001');
        $this->command->newLine();

        // Usuario de Prueba 2 (Referido de Usuario 1)
        $user2 = User::firstOrCreate(
            ['email' => 'usuario2@test.com'],
            [
                'name' => 'Usuario Prueba 2',
                'password' => Hash::make('Test123456!'),
                'wallet' => '0xUSER0002234567890ABCDEF',
                'referral_code' => 'TEST0002',
                'sponsor_id' => $user1->id,
                'is_admin' => false,
                'wallet_editable' => false,
                'value_cortyycado' => true,
                'requires_invitation' => true,
                'phone_number' => '+5215512345680',
                'phone_verified' => true,
                'total_invested' => 500,
                'total_earnings' => 50,
                'earnings_balance' => 50,
                'referral_balance' => 0,
                'blocked_balance' => 0,
                'total_withdrawn' => 0,
                'active_investments' => 1,
                'total_referrals' => 0,
            ]
        );

        $this->command->info('✅ Usuario Test 2 creado:');
        $this->command->info('   Email: usuario2@test.com');
        $this->command->info('   Password: Test123456!');
        $this->command->info('   Referral Code: TEST0002');
        $this->command->info('   Sponsor: ' . $user1->name);
        $this->command->newLine();

        // Actualizar contadores
        $admin->update(['total_referrals' => 1]);
        $user1->update(['total_referrals' => 1]);

        $this->command->info('🎉 Usuarios de prueba creados exitosamente!');
        $this->command->newLine();
        $this->command->warn('⚠️  IMPORTANTE: Estos son usuarios de DESARROLLO.');
        $this->command->warn('    En PRODUCCIÓN, elimina este seeder o cambia las contraseñas.');
    }
}
