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
        Schema::table('cellar_items', function (Blueprint $table) {
            $table->foreignId('appellation_id')->nullable()->constrained();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cellar_items', function (Blueprint $table) {
            $table->dropForeign(['appellation_id']);
            $table->dropColumn('appellation_id');
        });
    }
};
