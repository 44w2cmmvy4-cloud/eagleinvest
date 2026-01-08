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
        Schema::create('referral_network', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Usuario en la red
            $table->foreignId('sponsor_id')->nullable()->constrained('users')->onDelete('set null'); // Patrocinador directo
            $table->integer('level'); // Nivel en la red (1-5)
            $table->string('path')->nullable(); // Ruta en el árbol (ej: "1/5/12/45")
            $table->boolean('is_active')->default(true); // Si tiene inversión activa
            $table->decimal('total_invested', 15, 2)->default(0); // Total invertido por este usuario
            $table->integer('direct_referrals_count')->default(0); // Cantidad de referidos directos
            $table->integer('total_network_count')->default(0); // Total en su red
            $table->enum('rank', ['bronce', 'plata', 'oro', 'platino'])->default('bronce');
            $table->timestamp('last_investment_at')->nullable();
            $table->timestamps();
            
            // Índices
            $table->index(['user_id']);
            $table->index(['sponsor_id', 'level']);
            $table->index(['rank']);
            $table->index(['is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('referral_network');
    }
};
