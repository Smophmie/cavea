<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CellarItem>
 */
class CellarItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'stock' => $this->faker->numberBetween(1, 10),
            'rating' => $this->faker->numberBetween(6, 10),
            'price' => $this->faker->randomFloat(2, 10, 100),
            'shop' => $this->faker->company,
            'offered_by' => $this->faker->name,
            'drinking_window_start' => $this->faker->year(),
            'drinking_window_end' => $this->faker->year(),
        ];
    }
}
