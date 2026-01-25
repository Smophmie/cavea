<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Appellation>
 */
class AppellationFactory extends Factory
{
    public function definition(): array
    {
        $appellations = [
            'AOC Bordeaux',
            'AOC Bourgogne',
            'AOC Champagne'
        ];

        return [
            'name' => fake()->randomElement($appellations),
        ];
    }
}
