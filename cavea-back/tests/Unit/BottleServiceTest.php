<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Bottle;
use App\Models\Colour;
use App\Services\BottleService;
use Illuminate\Foundation\Testing\RefreshDatabase;

class BottleServiceTest extends TestCase
{
    use RefreshDatabase;

    protected BottleService $bottleService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->bottleService = new BottleService();
    }

    public function testFindOrCreateCreatesNewBottle()
    {
        $colour = \App\Models\Colour::factory()->create();

        $data = [
            'name' => 'Château Test',
            'domain' => 'Bordeaux',
            'PDO' => 'AOC Bordeaux',
            'colour_id' => $colour->id,
        ];

        $bottle = $this->bottleService->findOrCreate($data);

        $this->assertDatabaseHas('bottles', $data);
        $this->assertEquals('Château Test', $bottle->name);
    }

    public function testFindOrCreateReturnsExistingBottle()
    {
        $colour = Colour::factory()->create();

        $existing = Bottle::factory()->create([
            'name' => 'Château Test',
            'domain' => 'Bordeaux',
            'PDO' => 'AOC Bordeaux',
            'colour_id' => $colour->id,
        ]);

        $data = [
            'name' => 'Château Test',
            'domain' => 'Bordeaux',
            'PDO' => 'AOC Bordeaux',
            'colour_id' => $colour->id,
        ];

        $bottle = $this->bottleService->findOrCreate($data);

        $this->assertEquals($existing->id, $bottle->id);
        $this->assertDatabaseCount('bottles', 1);
    }
}
