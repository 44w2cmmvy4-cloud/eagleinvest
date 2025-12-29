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
        Schema::create('investment_plans', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('description');
            $table->decimal('min_amount', 15, 2);
            $table->decimal('max_amount', 15, 2);
            $table->decimal('daily_return_rate', 5, 2); // Porcentaje diario
            $table->integer('duration_days');
            $table->decimal('total_return_rate', 5, 2); // Porcentaje total
            $table->boolean('is_active')->default(true);
            $table->string('risk_level'); // Low, Medium, High
            $table->json('features')->nullable(); // Características del plan
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('investment_plans');
    }
};