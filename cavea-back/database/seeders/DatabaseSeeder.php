<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Colour;
use App\Models\Vintage;
use App\Models\Bottle;
use App\Models\CellarItem;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'firstname' => 'Test User Firstname',
            'email' => 'test@example.com',
        ]);

        $colours = ['Rouge', 'Blanc', 'Rosé', 'Pétillant', 'Orange', 'Autre'];

        foreach ($colours as $colour) {
            Colour::firstOrCreate(['name' => $colour]);
        }

        Vintage::factory()->create([
            'year' => 1995
        ]);

        Bottle::factory()->create([
            'name' => "Les Pampres",
            'domain' => "Mas Laval",
            'colour_id' => Colour::inRandomOrder()->first()->id,
        ]);

        $user = User::first() ?? User::factory()->create();
        $bottle = Bottle::first() ?? Bottle::factory()->create();
        $vintage = Vintage::first() ?? Vintage::factory()->create();

        CellarItem::factory()->create([
            'user_id' => $user->id,
            'bottle_id' => $bottle->id,
            'vintage_id' => $vintage->id,
            'stock' => rand(1, 10),
            'rating' => rand(0, 5),
            'price' => rand(10, 45),
            'shop' => 'Cave locale',
            'offered_by' => 'Ami',
            'drinking_window_start' => 2020,
            'drinking_window_end' => 2030,
        ]);
    }
}
