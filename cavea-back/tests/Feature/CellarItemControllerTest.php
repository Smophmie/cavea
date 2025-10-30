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
use App\Services\CellarItemService;
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
    protected $cellarItemService;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();

        // Mock des services
        $this->bottleService = Mockery::mock('App\Services\BottleService');
        $this->vintageService = Mockery::mock('App\Services\VintageService');
        $this->cellarItemService = Mockery::mock(CellarItemService::class);

        $this->app->instance('App\Services\BottleService', $this->bottleService);
        $this->app->instance('App\Services\VintageService', $this->vintageService);
        $this->app->instance(CellarItemService::class, $this->cellarItemService);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
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

        // Mock du service (ce n'est pas lui qu'on teste ici)
        $this->cellarItemService
            ->shouldReceive('getUserItems')
            ->once()
            ->with($this->user->id)
            ->andReturn(collect([$cellarItem->load(['bottle.colour', 'vintage'])]));

        $response = $this->actingAs($this->user)->getJson('api/cellar-items');

        $response->assertOk()
                 ->assertJsonFragment(['id' => $cellarItem->id]);
    }

    public function testCanGetLastAddedCellarItems()
    {
        $bottle = Bottle::factory()->create();
        $vintage = Vintage::factory()->create();

        $items = CellarItem::factory()
            ->count(10)
            ->for($this->user)
            ->for($bottle)
            ->for($vintage)
            ->create()
            ->load(['bottle.colour', 'vintage']);

        // Mock le service
        $this->cellarItemService
            ->shouldReceive('getLastAdded')
            ->once()
            ->with($this->user->id)
            ->andReturn($items);

        $response = $this->actingAs($this->user)->getJson('api/cellar-items/last');

        $response->assertOk();
        $data = $response->json();

        $this->assertCount(10, $data);
        $this->assertArrayHasKey('bottle', $data[0]);
        $this->assertArrayHasKey('vintage', $data[0]);
    }

    public function testCanGetTotalStockForAuthenticatedUser()
    {
        // Mock le service
        $this->cellarItemService
            ->shouldReceive('getTotalStock')
            ->once()
            ->with($this->user->id)
            ->andReturn(10);

        $response = $this->actingAs($this->user)->getJson('api/cellar-items/total-stock');

        $response->assertOk()
                 ->assertJson([
                     'total_stock' => 10
                 ]);
    }

    public function testCanGetStockGroupedByColour()
    {
        $expectedData = collect([
            ['colour' => 'Blanc', 'stock' => 2],
            ['colour' => 'Rouge', 'stock' => 5],
        ]);

        // Mock le service
        $this->cellarItemService
            ->shouldReceive('getStockByColour')
            ->once()
            ->with($this->user->id)
            ->andReturn($expectedData);

        $response = $this->actingAs($this->user)->getJson('api/cellar-items/stock-by-colour');

        $response->assertOk();
        $data = collect($response->json());

        $this->assertTrue($data->contains(fn ($i) => $i['colour'] === 'Rouge' && $i['stock'] === 5));
        $this->assertTrue($data->contains(fn ($i) => $i['colour'] === 'Blanc' && $i['stock'] === 2));
    }

    public function testCanStoreCellarItem()
    {
        $colour = Colour::factory()->create();
        $bottle = Bottle::factory()->create(['colour_id' => $colour->id]);
        $vintage = Vintage::factory()->create();

        $cellarItem = CellarItem::factory()
            ->for($this->user)
            ->for($bottle)
            ->for($vintage)
            ->make(['stock' => 5, 'rating' => 4.5]);

        // Mock BottleService
        $this->bottleService
            ->shouldReceive('findOrCreate')
            ->once()
            ->andReturn($bottle);

        // Mock VintageService
        $this->vintageService
            ->shouldReceive('findOrCreate')
            ->once()
            ->andReturn($vintage);

        // Mock CellarItemService
        $this->cellarItemService
            ->shouldReceive('create')
            ->once()
            ->andReturn($cellarItem->load(['bottle.colour', 'vintage']));

        $payload = [
            'bottle' => ['name' => 'Château Test', 'domain' => 'Test', 'PDO' => 'AOC Test', 'colour_id' => $colour->id],
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
        $cellarItem = CellarItem::factory()
        ->for($this->user)
        ->for(Bottle::factory())
        ->for(Vintage::factory())
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

    public function testShowReturns403IfNotOwner()
    {
        $otherUser = User::factory()->create();
        $bottle = Bottle::factory()->create();
        $vintage = Vintage::factory()->create();

        $cellarItem = CellarItem::factory()
            ->for($otherUser)
            ->for($bottle)
            ->for($vintage)
            ->create();

        $response = $this->actingAs($this->user)->getJson("api/cellar-items/{$cellarItem->id}");

        $response->assertForbidden();
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

        $updatedItem = $cellarItem->replicate();
        $updatedItem->stock = 4;
        $updatedItem->user_id = $this->user->id;

        // Mock CellarItemService
        $this->cellarItemService
            ->shouldReceive('incrementStock')
            ->once()
            ->with(Mockery::on(function ($arg) use ($cellarItem) {
                return $arg->id === $cellarItem->id;
            }))
            ->andReturn($updatedItem);

        $response = $this->actingAs($this->user)->postJson("api/cellar-items/{$cellarItem->id}/increment");

        $response->assertOk()
                ->assertJsonFragment(['stock' => 4]);
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

        // Mock CellarItemService
        $this->cellarItemService
            ->shouldReceive('filterByColour')
            ->once()
            ->with($this->user->id, $red->id)
            ->andReturn(collect([$redItem]));

        $response = $this->actingAs($this->user)
            ->getJson("api/cellar-items/colour/{$bottleRed->colour_id}");

        $response->assertOk();
        $data = $response->json();

        $this->assertCount(1, $data);
        $this->assertEquals($redItem->id, $data[0]['id']);
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

        $updatedItem = $cellarItem->replicate();
        $updatedItem->stock = 2;

        // Mock CellarItemService
        $this->cellarItemService
            ->shouldReceive('decrementStock')
            ->once()
            ->with(Mockery::on(function ($arg) use ($cellarItem) {
                return $arg->id === $cellarItem->id;
            }))
            ->andReturn($updatedItem);

        $response = $this->actingAs($this->user)->postJson("api/cellar-items/{$cellarItem->id}/decrement");

        $response->assertOk()
                ->assertJsonFragment(['stock' => 2]);
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

        // Mock CellarItemService - le stock reste à 0
        $this->cellarItemService
            ->shouldReceive('decrementStock')
            ->once()
            ->with(Mockery::on(function ($arg) use ($cellarItem) {
                return $arg->id === $cellarItem->id;
            }))
            ->andReturn($cellarItem);

        $response = $this->actingAs($this->user)->postJson("api/cellar-items/{$cellarItem->id}/decrement");

        $response->assertOk()
                ->assertJsonFragment(['stock' => 0]);
    }


    public function testCanUpdateCellarItem()
    {
        $cellarItem = CellarItem::factory()
            ->for($this->user)
            ->for(Bottle::factory())
            ->for(Vintage::factory())
            ->create(['stock' => 2]);

        $updatedItem = $cellarItem->replicate();
        $updatedItem->stock = 8;
        $updatedItem->price = 20.0;
        $updatedItem->user_id = $this->user->id;

        // Mock CellarItemService
        $this->cellarItemService
            ->shouldReceive('update')
            ->once()
            ->andReturn($updatedItem);

        $response = $this->actingAs($this->user, 'sanctum')->putJson("api/cellar-items/{$cellarItem->id}", [
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

        $this->assertEquals($this->user->id, $cellarItem->user_id);

        // Mock CellarItemService
        $this->cellarItemService
            ->shouldReceive('delete')
            ->once()
            ->with(Mockery::on(function ($arg) use ($cellarItem) {
                return $arg->id === $cellarItem->id;
            }))
            ->andReturn($cellarItem->setAttribute('user_id', $this->user->id));

        $response = $this->actingAs($this->user, 'sanctum')->deleteJson("api/cellar-items/{$cellarItem->id}");

        $response->assertNoContent();
    }
}
