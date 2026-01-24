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
        Schema::create('bottle_grape_varieties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bottle_id')->constrained('bottles')->onDelete('cascade');
            $table->foreignId('grape_variety_id')->constrained('grape_varieties');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bottle_grape_varieties');
    }
};
