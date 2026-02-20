<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Bottle;
use App\Models\Colour;
use App\Models\Region;
use App\Models\Domain;
use App\Models\GrapeVariety;
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
        $colour = Colour::factory()->create();
        $region = Region::factory()->create();
        $domain = Domain::factory()->create();

        $data = [
            'name' => 'Château Test',
            'domain_id' => $domain->id,
            'colour_id' => $colour->id,
            'region_id' => $region->id,
        ];

        $bottle = $this->bottleService->findOrCreate($data);

        $this->assertDatabaseHas('bottles', $data);
        $this->assertEquals('Château Test', $bottle->name);
    }

    public function testFindOrCreateReturnsExistingBottle()
    {
        $colour = Colour::factory()->create();
        $region = Region::factory()->create();
        $domain = Domain::factory()->create();

        $existing = Bottle::factory()->create([
            'name' => 'Château Test',
            'domain_id' => $domain->id,
            'colour_id' => $colour->id,
            'region_id' => $region->id,
        ]);

        $data = [
            'name' => 'Château Test',
            'domain_id' => $domain->id,
            'colour_id' => $colour->id,
            'region_id' => $region->id,
        ];

        $bottle = $this->bottleService->findOrCreate($data);

        $this->assertEquals($existing->id, $bottle->id);
        $this->assertDatabaseCount('bottles', 1);
    }

    public function testFindOrCreateAttachesGrapeVarieties()
    {
        $colour = Colour::factory()->create();
        $region = Region::factory()->create();
        $domain = Domain::factory()->create();
        $grapeVariety1 = GrapeVariety::factory()->create();
        $grapeVariety2 = GrapeVariety::factory()->create();

        $data = [
            'name' => 'Château Test',
            'domain_id' => $domain->id,
            'colour_id' => $colour->id,
            'region_id' => $region->id,
            'grape_variety_ids' => [$grapeVariety1->id, $grapeVariety2->id],
        ];

        $bottle = $this->bottleService->findOrCreate($data);

        $this->assertCount(2, $bottle->grapeVarieties);
        $this->assertTrue($bottle->grapeVarieties->contains($grapeVariety1));
        $this->assertTrue($bottle->grapeVarieties->contains($grapeVariety2));
    }

    public function testUpdateBottleGrapeVarieties()
    {
        $bottle = Bottle::factory()->create();
        $grapeVariety1 = GrapeVariety::factory()->create();
        $grapeVariety2 = GrapeVariety::factory()->create();

        $bottle->grapeVarieties()->attach($grapeVariety1->id);

        $updatedBottle = $this->bottleService->update($bottle, [
            'grape_variety_ids' => [$grapeVariety2->id],
        ]);

        $this->assertCount(1, $updatedBottle->grapeVarieties);
        $this->assertTrue($updatedBottle->grapeVarieties->contains($grapeVariety2));
        $this->assertFalse($updatedBottle->grapeVarieties->contains($grapeVariety1));
    }
}
