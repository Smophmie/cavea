<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Appellation;
use App\Services\AppellationService;
use Illuminate\Foundation\Testing\RefreshDatabase;

class AppellationServiceTest extends TestCase
{
    use RefreshDatabase;

    protected AppellationService $appellationService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->appellationService = new AppellationService();
    }

    public function testFindOrCreateCreatesNewAppellation()
    {
        $data = ['name' => 'AOC Pomerol'];

        $appellation = $this->appellationService->findOrCreate($data);

        $this->assertDatabaseHas('appellations', $data);
        $this->assertEquals('AOC Pomerol', $appellation->name);
    }

    public function testFindOrCreateReturnsExistingAppellation()
    {
        $existing = Appellation::factory()->create(['name' => 'AOC Margaux']);

        $data = ['name' => 'AOC Margaux'];

        $appellation = $this->appellationService->findOrCreate($data);

        $this->assertEquals($existing->id, $appellation->id);
        $this->assertDatabaseCount('appellations', 1);
    }
}
