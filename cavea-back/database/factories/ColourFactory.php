<?php

namespace Database\Factories;

use App\Models\Colour;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Model;

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

    /**
     * Override the create method to always use firstOrCreate
     * This prevents unique constraint violations on the name field
     */
    public function create($attributes = [], ?Model $parent = null)
    {
        $name = $attributes['name'] ?? fake()->randomElement(['Rouge', 'Blanc', 'Rosé', 'Pétillant', 'Orange', 'Autre']);

        return Colour::firstOrCreate(['name' => $name]);
    }

    /**
     * Create or return existing colour by name.
     */
    public function createOne($attributes = []): Colour
    {
        $name = $attributes['name'] ?? fake()->randomElement(['Rouge', 'Blanc', 'Rosé', 'Pétillant', 'Orange', 'Autre']);

        return Colour::firstOrCreate(['name' => $name]);
    }

    /**
     * State for a specific colour
     */
    public function rouge(): static
    {
        return $this->state(fn (array $attributes) => ['name' => 'Rouge']);
    }

    public function blanc(): static
    {
        return $this->state(fn (array $attributes) => ['name' => 'Blanc']);
    }

    public function rose(): static
    {
        return $this->state(fn (array $attributes) => ['name' => 'Rosé']);
    }

    public function petillant(): static
    {
        return $this->state(fn (array $attributes) => ['name' => 'Pétillant']);
    }

    public function orange(): static
    {
        return $this->state(fn (array $attributes) => ['name' => 'Orange']);
    }

    public function autre(): static
    {
        return $this->state(fn (array $attributes) => ['name' => 'Autre']);
    }
}
