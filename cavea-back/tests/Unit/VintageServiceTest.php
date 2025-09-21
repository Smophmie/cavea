<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Vintage;
use App\Services\VintageService;
use Illuminate\Foundation\Testing\RefreshDatabase;

class VintageServiceTest extends TestCase
{
    use RefreshDatabase;

    protected VintageService $vintageService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->vintageService = new VintageService();
    }

    public function testFindOrCreateCreatesNewVintage()
    {
        $data = ['year' => 1998];

        $vintage = $this->vintageService->findOrCreate($data);

        $this->assertDatabaseHas('vintages', $data);
        $this->assertEquals(1998, $vintage->year);
    }

    public function testFindOrCreateReturnsExistingVintage()
    {
        $existing = Vintage::factory()->create(['year' => 2005]);

        $data = ['year' => 2005];

        $vintage = $this->vintageService->findOrCreate($data);

        $this->assertEquals($existing->id, $vintage->id);
        $this->assertDatabaseCount('vintages', 1);
    }
}
