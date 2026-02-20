<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\GrapeVariety>
 */
class GrapeVarietyFactory extends Factory
{
    public function definition(): array
    {
        $existingGrapeVariety = \App\Models\GrapeVariety::inRandomOrder()->first();

        return [
            'name' => $existingGrapeVariety ? $existingGrapeVariety->name : 'Cabernet Sauvignon',
        ];
    }
}
