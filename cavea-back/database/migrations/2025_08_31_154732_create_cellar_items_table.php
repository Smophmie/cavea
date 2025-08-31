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
        Schema::create('cellar_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained();
            $table->foreignId('bottle_id')->constrained();
            $table->foreignId('vintage_id')->constrained();
            $table->integer('stock');
            $table->string('rating');
            $table->double('price');
            $table->string('shop');
            $table->string('offered_by');
            $table->year('drinking_window_start');
            $table->year('drinking_window_end');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cellar_items');
    }
};
