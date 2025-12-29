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
            // referral_code ya existe, solo agregar sponsor_id
            $table->foreignId('sponsor_id')->nullable()->constrained('users')->after('referred_by');
            $table->string('wallet')->nullable()->after('sponsor_id');
            $table->boolean('wallet_editable')->default(false)->after('wallet');
            $table->timestamp('wallet_last_changed')->nullable()->after('wallet_editable');
            $table->boolean('value_cortyycado')->default(false)->after('wallet_last_changed');
            $table->boolean('requires_invitation')->default(true)->after('value_cortyycado');
            $table->boolean('is_admin')->default(false)->after('requires_invitation');
            $table->decimal('balance', 15, 2)->default(0)->after('is_admin');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'sponsor_id',
                'wallet',
                'wallet_editable',
                'wallet_last_changed',
                'value_cortyycado',
                'requires_invitation',
                'is_admin',
                'balance'
            ]);
        });
    }
};
