<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->decimal('total_invested', 15, 2)->default(0)->after('password');
            $table->decimal('total_earnings', 15, 2)->default(0)->after('total_invested');
            $table->decimal('earnings_balance', 15, 2)->default(0)->after('total_earnings');
            $table->decimal('referral_balance', 15, 2)->default(0)->after('earnings_balance');
            $table->decimal('blocked_balance', 15, 2)->default(0)->after('referral_balance');
            $table->decimal('total_withdrawn', 15, 2)->default(0)->after('blocked_balance');
            $table->integer('active_investments')->default(0)->after('total_withdrawn');
            $table->integer('total_referrals')->default(0)->after('active_investments');
            $table->string('phone')->nullable()->after('email');
            $table->string('country')->default('Colombia')->after('phone');
            $table->string('language')->default('Español')->after('country');
            $table->boolean('notifications_enabled')->default(true)->after('language');
            $table->boolean('two_factor_enabled')->default(false)->after('notifications_enabled');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'total_invested',
                'total_earnings',
                'earnings_balance',
                'referral_balance',
                'blocked_balance',
                'total_withdrawn',
                'active_investments',
                'total_referrals',
                'phone',
                'country',
                'language',
                'notifications_enabled',
                'two_factor_enabled'
            ]);
        });
    }
};
