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
        Schema::create('plan_levels', function (Blueprint $table) {
            $table->id();
            $table->string('plan_name'); // Bronce, Plata, Oro, Platino
            $table->decimal('min_investment', 15, 2);
            $table->integer('max_level');
            $table->decimal('monthly_cap', 15, 2);
            $table->integer('minimum_days')->default(18);
            $table->decimal('minimum_withdrawal', 15, 2)->default(0);
            $table->json('level_commissions')->nullable(); // {"1": 5, "2": 3, ...}
            $table->timestamps();
            
            $table->unique('plan_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plan_levels');
    }
};
