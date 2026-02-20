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

    }
}
