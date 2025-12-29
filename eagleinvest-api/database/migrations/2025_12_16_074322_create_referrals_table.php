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
        Schema::create('referrals', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('sponsor_id'); // Usuario patrocinador
            $table->unsignedBigInteger('referred_id'); // Usuario referido
            $table->integer('level')->default(1); // Nivel en la red (1-10)
            $table->decimal('commission_earned', 10, 2)->default(0);
            $table->boolean('active')->default(true);
            $table->timestamps();
            
            $table->foreign('sponsor_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('referred_id')->references('id')->on('users')->onDelete('cascade');
            $table->index('sponsor_id');
            $table->index('referred_id');
            $table->index('level');
            $table->unique(['sponsor_id', 'referred_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('referrals');
    }
};
