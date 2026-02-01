<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('regions', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->timestamps();
        });

        $regions = [
            'Alsace',
            'Beaujolais',
            'Bordeaux',
            'Bourgogne',
            'Champagne',
            'Corse',
            'Jura',
            'Languedoc',
            'Roussillon',
            'Lorraine',
            'Provence',
            'Savoie et Bugey',
            'Sud-Ouest',
            'Vallée de la Loire',
            'Vallée du Rhône',
            'Île-de-France',
            'Poitou-Charentes',
        ];

        foreach ($regions as $region) {
            DB::table('regions')->insert([
                'name' => $region,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('regions');
    }
};
