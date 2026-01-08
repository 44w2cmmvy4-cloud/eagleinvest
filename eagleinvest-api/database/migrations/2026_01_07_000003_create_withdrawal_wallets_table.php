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
        Schema::create('withdrawal_wallets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('wallet_type'); // 'usdt_trc20', 'bitcoin', 'ethereum', etc.
            $table->string('wallet_address');
            $table->string('wallet_label')->nullable(); // Etiqueta personalizada
            $table->boolean('is_verified')->default(false);
            $table->boolean('is_primary')->default(false); // Wallet principal
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();
            
            // Índices
            $table->index(['user_id', 'is_primary']);
            $table->index(['wallet_address']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('withdrawal_wallets');
    }
};
