<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Colour>
 */
class ColourFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $colours = ['Rouge', 'Blanc', 'Rosé', 'Pétillant', 'Orange', 'Autre'];

        return [
            'name' => fake()->randomElement($colours),
        ];
    }
}
