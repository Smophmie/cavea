<?php

namespace Database\Factories;

use App\Models\Region;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Region>
 */
class RegionFactory extends Factory
{
    public function definition(): array
    {
        $existingRegion = \App\Models\Region::inRandomOrder()->first();

        return [
            'name' => $existingRegion ? $existingRegion->name : 'Bordeaux',
        ];
    }
}