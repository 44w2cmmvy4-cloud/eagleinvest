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
        Schema::create('commissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Quien recibe la comisión
            $table->foreignId('from_user_id')->constrained('users')->onDelete('cascade'); // Quien generó la inversión
            $table->foreignId('investment_id')->nullable()->constrained('user_investments')->onDelete('set null'); // Inversión origen
            $table->integer('level'); // Nivel de la comisión (1-5)
            $table->decimal('investment_amount', 15, 2); // Monto de la inversión que generó la comisión
            $table->decimal('percentage', 5, 2); // Porcentaje de comisión (10.00, 5.00, etc.)
            $table->decimal('amount', 15, 2); // Monto de la comisión
            $table->enum('status', ['pending', 'paid', 'cancelled'])->default('pending');
            $table->timestamp('paid_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Índices para búsquedas rápidas
            $table->index(['user_id', 'status']);
            $table->index(['from_user_id']);
            $table->index(['created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('commissions');
    }
};
