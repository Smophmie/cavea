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
            $table->foreignId('user_id')->constrained()->onDelete('cascade');;
            $table->foreignId('bottle_id')->constrained()->onDelete('cascade');;
            $table->foreignId('vintage_id')->constrained()->onDelete('cascade');;
            $table->integer('stock');
            $table->decimal('rating', 2, 1)->nullable();
            $table->double('price')->nullable();
            $table->string('shop')->nullable();
            $table->string('offered_by')->nullable();
            $table->year('drinking_window_start')->nullable();
            $table->year('drinking_window_end')->nullable();
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
