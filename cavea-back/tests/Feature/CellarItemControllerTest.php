<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\CellarItem;
use App\Models\Bottle;
use App\Models\Vintage;
use App\Models\User;
use App\Models\Colour;
use App\Services\BottleService;
use App\Services\VintageService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Mockery;

class CellarItemControllerTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $bottleService;
    protected $vintageService;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();

        // Mock des services
        $this->bottleService = Mockery::mock('App\Services\BottleService');
        $this->vintageService = Mockery::mock('App\Services\VintageService');

        $this->app->instance('App\Services\BottleService', $this->bottleService);
        $this->app->instance('App\Services\VintageService', $this->vintageService);
    }

    public function testCanShowUsersCellarItems()
    {
        $bottle = Bottle::factory()->create();
        $vintage = Vintage::factory()->create();

        $cellarItem = CellarItem::factory()
            ->for($this->user)
            ->for($bottle)
            ->for($vintage)
            ->create();

        $response = $this->actingAs($this->user)->getJson('api/cellar-items');

        $response->assertOk()
                 ->assertJsonFragment(['id' => $cellarItem->id]);
    }

    public function testCanStoreCellarItem()
    {
        $this->bottleService->shouldReceive('findOrCreate')
            ->once()
            ->andReturn(Bottle::factory()->create());
        $this->vintageService->shouldReceive('findOrCreate')
            ->once()
            ->andReturn(Vintage::factory()->create());

        $payload = [
            'bottle' => ['name' => 'Château Test', 'domain' => 'Test', 'PDO' => 'AOC Test', 'colour_id' => 1],
            'vintage' => ['year' => 2020],
            'stock' => 5,
            'rating' => 4.5,
            'price' => 15.5,
            'shop' => 'Carrefour',
        ];

        $response = $this->actingAs($this->user)->postJson('api/cellar-items', $payload);

        $response->assertCreated()
                 ->assertJsonFragment(['stock' => 5, 'rating' => 4.5]);
    }

    public function testCanShowCellarItem()
    {
        $bottle = Bottle::factory()->create();
        $vintage = Vintage::factory()->create();

        $cellarItem = CellarItem::factory()
            ->for($this->user)
            ->for($bottle)
            ->for($vintage)
            ->create();

        $response = $this->actingAs($this->user)->getJson("api/cellar-items/{$cellarItem->id}");

        $response->assertOk()
                 ->assertJsonFragment(['id' => $cellarItem->id]);
    }

    public function testShowReturns404IfNotFound()
    {
        $response = $this->actingAs($this->user)->getJson("api/cellar-items/99999");

        $response->assertNotFound();
    }

    public function testCanIncrementStock()
    {
        $bottle = Bottle::factory()->create();
        $vintage = Vintage::factory()->create();

        $cellarItem = CellarItem::factory()
            ->for($this->user)
            ->for($bottle)
            ->for($vintage)
            ->create(['stock' => 3]);

        $response = $this->actingAs($this->user)->postJson("api/cellar-items/{$cellarItem->id}/increment");

        $response->assertOk()
                ->assertJsonFragment(['stock' => 4]); // stock +1

        $this->assertDatabaseHas('cellar_items', [
            'id' => $cellarItem->id,
            'stock' => 4,
        ]);
    }

    public function testCanFilterCellarItemsByColour()
    {
        $red = Colour::factory()->create(['name' => 'Red']);
        $white = Colour::factory()->create(['name' => 'White']);

        $bottleRed = Bottle::factory()->create(['colour_id' => $red->id]);
        $bottleWhite = Bottle::factory()->create(['colour_id' => $white->id]);
        
        $vintage = Vintage::factory()->create();

        $redItem = CellarItem::factory()
            ->for($this->user)
            ->for($bottleRed)
            ->for($vintage)
            ->create();

        $whiteItem = CellarItem::factory()
            ->for($this->user)
            ->for($bottleWhite)
            ->for($vintage)
            ->create();

        $response = $this->actingAs($this->user)
            ->getJson("api/cellar-items/colour/{$bottleRed->colour_id}");

        $response->assertOk();

        $response->assertJsonFragment(['id' => $redItem->id])
                ->assertJsonMissing(['id' => $whiteItem->id]);
    }

    public function testCanDecrementStock()
    {
        $bottle = Bottle::factory()->create();
        $vintage = Vintage::factory()->create();

        $cellarItem = CellarItem::factory()
            ->for($this->user)
            ->for($bottle)
            ->for($vintage)
            ->create(['stock' => 3]);

        $response = $this->actingAs($this->user)->postJson("api/cellar-items/{$cellarItem->id}/decrement");

        $response->assertOk()
                ->assertJsonFragment(['stock' => 2]); // stock -1

        $this->assertDatabaseHas('cellar_items', [
            'id' => $cellarItem->id,
            'stock' => 2,
        ]);
    }

    public function testCannotDecrementStockBelowZero()
    {
        $bottle = Bottle::factory()->create();
        $vintage = Vintage::factory()->create();

        $cellarItem = CellarItem::factory()
            ->for($this->user)
            ->for($bottle)
            ->for($vintage)
            ->create(['stock' => 0]);

        $response = $this->actingAs($this->user)->postJson("api/cellar-items/{$cellarItem->id}/decrement");

        $response->assertOk()
                ->assertJsonFragment(['stock' => 0]); // reste à 0

        $this->assertDatabaseHas('cellar_items', [
            'id' => $cellarItem->id,
            'stock' => 0,
        ]);
    }


    public function testCanUpdateCellarItem()
    {
        $cellarItem = CellarItem::factory()
            ->for($this->user)
            ->for(Bottle::factory())
            ->for(Vintage::factory())
            ->create(['stock' => 2]);

        $response = $this->actingAs($this->user)->putJson("api/cellar-items/{$cellarItem->id}", [
            'stock' => 8,
            'price' => 20.0,
        ]);

        $response->assertOk()
                 ->assertJsonFragment(['stock' => 8, 'price' => 20.0]);
    }

    public function testCanDeleteCellarItem()
    {
        $cellarItem = CellarItem::factory()
            ->for($this->user)
            ->for(Bottle::factory())
            ->for(Vintage::factory())
            ->create();

        $response = $this->actingAs($this->user)->deleteJson("api/cellar-items/{$cellarItem->id}");

        $response->assertNoContent();
        $this->assertDatabaseMissing('cellar_items', ['id' => $cellarItem->id]);
    }
}