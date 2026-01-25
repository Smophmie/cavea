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
        Schema::create('grape_varieties', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->timestamps();
        });

        $grapeVarieties = [
            'Cabernet Sauvignon',
            'Cabernet Franc',
            'Merlot',
            'Pinot Noir',
            'Gamay',
            'Syrah',
            'Grenache',
            'Mourvèdre',
            'Cinsault',
            'Carignan',
            'Malbec',
            'Petit Verdot',
            'Tannat',
            'Négrette',
            'Fer Servadou',
            'Counoise',
            'Mondeuse',
            'Poulsard',
            'Trousseau',
            'Aramon',
            'Chardonnay',
            'Sauvignon Blanc',
            'Chenin Blanc',
            'Sémillon',
            'Ugni Blanc',
            'Viognier',
            'Roussanne',
            'Marsanne',
            'Clairette',
            'Grenache Blanc',
            'Bourboulenc',
            'Picpoul',
            'Aligoté',
            'Melon de Bourgogne',
            'Folle Blanche',
            'Mauzac',
            'Gros Manseng',
            'Petit Manseng',
            'Colombard',
            'Rolle (Vermentino)',
            'Riesling',
            'Gewurztraminer',
            'Pinot Gris',
            'Pinot Blanc',
            'Sylvaner',
            'Jacquère',
            'Savagnin',
            'Chasselas',
            'Muscat Blanc à Petits Grains',
            'Muscat d’Alexandrie',
        ];

        foreach ($grapeVarieties as $grape) {
            DB::table('grape_varieties')->insert([
                'name' => $grape
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('grape_varieties');
    }
};
