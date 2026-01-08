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
        Schema::table('withdrawals', function (Blueprint $table) {
            // Verificar si las columnas no existen antes de agregarlas
            if (!Schema::hasColumn('withdrawals', 'fee')) {
                $table->decimal('fee', 15, 2)->default(0)->after('amount');
            }
            if (!Schema::hasColumn('withdrawals', 'net_amount')) {
                $table->decimal('net_amount', 15, 2)->after('fee'); // amount - fee
            }
            if (!Schema::hasColumn('withdrawals', 'withdrawal_method')) {
                $table->string('withdrawal_method')->nullable()->after('net_amount'); // 'usdt_trc20', 'bank', etc.
            }
            if (!Schema::hasColumn('withdrawals', 'wallet_address')) {
                $table->string('wallet_address')->nullable()->after('withdrawal_method');
            }
            if (!Schema::hasColumn('withdrawals', 'plan_type')) {
                $table->string('plan_type')->nullable()->after('wallet_address'); // 'basico', 'intermedio', 'premium', 'elite'
            }
            if (!Schema::hasColumn('withdrawals', 'transaction_hash')) {
                $table->string('transaction_hash')->nullable()->after('plan_type');
            }
            if (!Schema::hasColumn('withdrawals', 'admin_notes')) {
                $table->text('admin_notes')->nullable()->after('transaction_hash');
            }
            if (!Schema::hasColumn('withdrawals', 'approved_at')) {
                $table->timestamp('approved_at')->nullable()->after('admin_notes');
            }
            if (!Schema::hasColumn('withdrawals', 'processed_at')) {
                $table->timestamp('processed_at')->nullable()->after('approved_at');
            }
            if (!Schema::hasColumn('withdrawals', 'completed_at')) {
                $table->timestamp('completed_at')->nullable()->after('processed_at');
            }
            if (!Schema::hasColumn('withdrawals', 'rejected_at')) {
                $table->timestamp('rejected_at')->nullable()->after('completed_at');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('withdrawals', function (Blueprint $table) {
            $columns = [
                'fee', 'net_amount', 'withdrawal_method', 'wallet_address', 
                'plan_type', 'transaction_hash', 'admin_notes',
                'approved_at', 'processed_at', 'completed_at', 'rejected_at'
            ];
            
            foreach ($columns as $column) {
                if (Schema::hasColumn('withdrawals', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
