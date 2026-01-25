<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\CellarItem;
use App\Models\Bottle;
use App\Models\Vintage;
use App\Models\User;
use App\Models\Colour;
use App\Models\Region;
use App\Models\Domain;
use App\Models\Appellation;
use App\Services\BottleService;
use App\Services\VintageService;
use App\Services\CellarItemService;
use App\Services\DomainService;
use App\Services\AppellationService;
use App\Services\CommentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;

class CellarItemControllerTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $bottleService;
    protected $vintageService;
    protected $cellarItemService;
    protected $domainService;
    protected $appellationService;
    protected $commentService;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();

        $this->bottleService = Mockery::mock(BottleService::class);
        $this->vintageService = Mockery::mock(VintageService::class);
        $this->cellarItemService = Mockery::mock(CellarItemService::class);
        $this->domainService = Mockery::mock(DomainService::class);
        $this->appellationService = Mockery::mock(AppellationService::class);
        $this->commentService = Mockery::mock(CommentService::class);

        $this->app->instance(BottleService::class, $this->bottleService);
        $this->app->instance(VintageService::class, $this->vintageService);
        $this->app->instance(CellarItemService::class, $this->cellarItemService);
        $this->app->instance(DomainService::class, $this->domainService);
        $this->app->instance(AppellationService::class, $this->appellationService);
        $this->app->instance(CommentService::class, $this->commentService);
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

        $this->cellarItemService
            ->shouldReceive('getUserItems')
            ->once()
            ->with($this->user->id)
            ->andReturn(collect([$cellarItem->load([
                'bottle.colour',
                'bottle.region',
                'bottle.domain',
                'vintage'
            ])]));

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
            ->load(['bottle.colour', 'bottle.region', 'bottle.domain', 'vintage']);

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
        $region = Region::factory()->create();
        $domain = Domain::factory()->create();
        $bottle = Bottle::factory()->create([
            'colour_id' => $colour->id,
            'region_id' => $region->id,
            'domain_id' => $domain->id,
        ]);
        $vintage = Vintage::factory()->create();

        $cellarItem = CellarItem::factory()
            ->for($this->user)
            ->for($bottle)
            ->for($vintage)
            ->make(['stock' => 5, 'rating' => 4.5]);

        $this->domainService
            ->shouldReceive('findOrCreate')
            ->once()
            ->andReturn($domain);

        $this->bottleService
            ->shouldReceive('findOrCreate')
            ->once()
            ->andReturn($bottle);

        $this->vintageService
            ->shouldReceive('findOrCreate')
            ->once()
            ->andReturn($vintage);

        $this->cellarItemService
            ->shouldReceive('create')
            ->once()
            ->andReturn($cellarItem->load([
                'bottle.colour',
                'bottle.region',
                'bottle.domain',
                'vintage'
            ]));

        $payload = [
            'bottle' => [
                'name' => 'Château Test',
                'domain_name' => 'Domaine Test',
                'colour_id' => $colour->id,
                'region_id' => $region->id,
            ],
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

        $cellarItem = CellarItem::factory()
            ->for($this->user)
            ->for($bottle)
            ->for(Vintage::factory())
            ->create();

        $this->cellarItemService
            ->shouldReceive('findByIdAndUser')
            ->once()
            ->with($cellarItem->id, $this->user->id)
            ->andReturn($cellarItem->load([
                'bottle.colour',
                'bottle.region',
                'bottle.domain',
                'bottle.grapeVarieties',
                'vintage',
                'appellation',
                'comments'
            ]));

        $response = $this->actingAs($this->user)->getJson("api/cellar-items/{$cellarItem->id}");

        $response->assertOk()
                 ->assertJsonFragment(['id' => $cellarItem->id]);
    }

    public function testShowReturns404IfNotFound()
    {
        $this->cellarItemService
            ->shouldReceive('findByIdAndUser')
            ->once()
            ->with(99999, $this->user->id)
            ->andReturn(null);

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

        $this->cellarItemService
            ->shouldReceive('findByIdAndUser')
            ->once()
            ->with($cellarItem->id, $this->user->id)
            ->andReturn(null);

        $response = $this->actingAs($this->user)->getJson("api/cellar-items/{$cellarItem->id}");

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

        $updatedItem = $cellarItem->replicate();
        $updatedItem->stock = 4;
        $updatedItem->user_id = $this->user->id;

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
        $domain = Domain::factory()->create();
        $region = Region::factory()->create();

        $bottleRed = Bottle::factory()->create([
            'colour_id' => $red->id,
            'domain_id' => $domain->id,
            'region_id' => $region->id,
        ]);

        $vintage = Vintage::factory()->create();

        $redItem = CellarItem::factory()
            ->for($this->user)
            ->for($bottleRed)
            ->for($vintage)
            ->create();

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

    public function testCanFilterCellarItemsByRegion()
    {
        $bordeaux = Region::factory()->create(['name' => 'Bordeaux']);
        $domain = Domain::factory()->create();
        $colour = Colour::factory()->create();

        $bottleBordeaux = Bottle::factory()->create([
            'region_id' => $bordeaux->id,
            'domain_id' => $domain->id,
            'colour_id' => $colour->id,
        ]);

        $vintage = Vintage::factory()->create();

        $bordeauxItem = CellarItem::factory()
            ->for($this->user)
            ->for($bottleBordeaux)
            ->for($vintage)
            ->create();

        $this->cellarItemService
            ->shouldReceive('filterByRegion')
            ->once()
            ->with($this->user->id, $bordeaux->id)
            ->andReturn(collect([$bordeauxItem]));

        $response = $this->actingAs($this->user)
            ->getJson("api/cellar-items/region/{$bordeaux->id}");

        $response->assertOk();
        $data = $response->json();

        $this->assertCount(1, $data);
        $this->assertEquals($bordeauxItem->id, $data[0]['id']);
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
        $bottle = Bottle::factory()->create();

        $cellarItem = CellarItem::factory()
            ->for($this->user)
            ->for($bottle)
            ->for(Vintage::factory())
            ->create(['stock' => 2]);

        $updatedItem = $cellarItem->replicate();
        $updatedItem->stock = 8;
        $updatedItem->price = 20.0;
        $updatedItem->user_id = $this->user->id;

        $this->cellarItemService
            ->shouldReceive('update')
            ->once()
            ->andReturn($updatedItem);

        $response = $this->actingAs($this->user)->putJson("api/cellar-items/{$cellarItem->id}", [
            'stock' => 8,
            'price' => 20.0,
        ]);

        $response->assertOk()
                 ->assertJsonFragment(['stock' => 8, 'price' => 20.0]);
    }

    public function testCanUpdateCellarItemWithGrapeVarieties()
    {
        $bottle = Bottle::factory()->create();
        $cellarItem = CellarItem::factory()
            ->for($this->user)
            ->for($bottle)
            ->for(Vintage::factory())
            ->create();

        $this->bottleService
            ->shouldReceive('update')
            ->once()
            ->with(
                Mockery::on(fn($b) => $b->id === $bottle->id),
                Mockery::on(fn($data) => isset($data['grape_variety_ids']))
            )
            ->andReturn($bottle);

        $this->cellarItemService
            ->shouldReceive('update')
            ->once()
            ->andReturn($cellarItem);

        $response = $this->actingAs($this->user)->putJson("api/cellar-items/{$cellarItem->id}", [
            'bottle' => [
                'grape_variety_ids' => [1, 2]
            ]
        ]);

        $response->assertOk();
    }

    public function testCanDeleteCellarItem()
    {
        $bottle = Bottle::factory()->create();

        $cellarItem = CellarItem::factory()
            ->for($this->user)
            ->for($bottle)
            ->for(Vintage::factory())
            ->create();

        $this->cellarItemService
            ->shouldReceive('delete')
            ->once()
            ->with(Mockery::on(function ($arg) use ($cellarItem) {
                return $arg->id === $cellarItem->id;
            }))
            ->andReturn($cellarItem->setAttribute('user_id', $this->user->id));

        $response = $this->actingAs($this->user)->deleteJson("api/cellar-items/{$cellarItem->id}");

        $response->assertNoContent();
    }
}