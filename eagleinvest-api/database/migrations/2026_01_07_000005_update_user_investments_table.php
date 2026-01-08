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
        Schema::table('user_investments', function (Blueprint $table) {
            // Verificar si las columnas no existen
            if (!Schema::hasColumn('user_investments', 'daily_return_amount')) {
                $table->decimal('daily_return_amount', 15, 2)->default(0)->after('amount');
            }
            if (!Schema::hasColumn('user_investments', 'total_returned')) {
                $table->decimal('total_returned', 15, 2)->default(0)->after('daily_return_amount');
            }
            if (!Schema::hasColumn('user_investments', 'days_completed')) {
                $table->integer('days_completed')->default(0)->after('total_returned');
            }
            if (!Schema::hasColumn('user_investments', 'next_withdrawal_date')) {
                $table->timestamp('next_withdrawal_date')->nullable()->after('days_completed');
            }
            if (!Schema::hasColumn('user_investments', 'last_return_date')) {
                $table->timestamp('last_return_date')->nullable()->after('next_withdrawal_date');
            }
            if (!Schema::hasColumn('user_investments', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('last_return_date');
            }
            if (!Schema::hasColumn('user_investments', 'completed_at')) {
                $table->timestamp('completed_at')->nullable()->after('is_active');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_investments', function (Blueprint $table) {
            $columns = [
                'daily_return_amount', 'total_returned', 'days_completed',
                'next_withdrawal_date', 'last_return_date', 'is_active', 'completed_at'
            ];
            
            foreach ($columns as $column) {
                if (Schema::hasColumn('user_investments', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
