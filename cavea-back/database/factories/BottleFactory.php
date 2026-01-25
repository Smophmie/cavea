<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Colour;
use App\Models\Region;
use App\Models\Domain;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Bottle>
 */
class BottleFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->words(3, true),
            'colour_id' => Colour::inRandomOrder()->first()?->id ?? Colour::firstOrCreate(['name' => 'Rouge'])->id,
            'region_id' => Region::inRandomOrder()->first()?->id ?? Region::factory()->create()->id,
            'domain_id' => Domain::inRandomOrder()->first()?->id ?? Domain::factory()->create()->id,
        ];
    }
}