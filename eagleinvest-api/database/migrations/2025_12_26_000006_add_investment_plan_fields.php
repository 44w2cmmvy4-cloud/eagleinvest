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
        // Primero verificar si ya existen las columnas
        if (!Schema::hasColumn('investment_plans', 'user_id')) {
            Schema::table('investment_plans', function (Blueprint $table) {
                $table->foreignId('user_id')->nullable()->constrained()->after('id');
            });
        }
        
        if (!Schema::hasColumn('investment_plans', 'plan_name')) {
            Schema::table('investment_plans', function (Blueprint $table) {
                $table->string('plan_name')->nullable()->after('user_id');
            });
        }
        
        if (!Schema::hasColumn('investment_plans', 'amount')) {
            Schema::table('investment_plans', function (Blueprint $table) {
                $table->decimal('amount', 15, 2)->nullable()->after('plan_name');
            });
        }
        
        if (!Schema::hasColumn('investment_plans', 'status')) {
            Schema::table('investment_plans', function (Blueprint $table) {
                $table->enum('status', ['active', 'inactive', 'completed'])->default('active')->after('amount');
            });
        }
        
        if (!Schema::hasColumn('investment_plans', 'start_date')) {
            Schema::table('investment_plans', function (Blueprint $table) {
                $table->timestamp('start_date')->nullable()->after('status');
                $table->integer('withdrawal_interval_days')->default(18)->after('start_date');
                $table->decimal('minimum_withdrawal_amount', 15, 2)->default(0)->after('withdrawal_interval_days');
                $table->string('plan_tier')->nullable()->after('minimum_withdrawal_amount');
                $table->boolean('meets_withdrawal_requirements')->default(false)->after('plan_tier');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('investment_plans', function (Blueprint $table) {
            $table->dropColumn([
                'start_date',
                'withdrawal_interval_days',
                'minimum_withdrawal_amount',
                'plan_tier',
                'meets_withdrawal_requirements'
            ]);
        });
    }
};
