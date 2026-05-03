<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\WishlistItem;
use App\Models\Bottle;
use App\Models\Vintage;
use App\Models\User;
use App\Models\Colour;
use App\Models\Region;
use App\Models\Domain;
use App\Models\Appellation;
use App\Services\WishlistService;
use App\Services\BottleService;
use App\Services\VintageService;
use App\Services\DomainService;
use App\Services\AppellationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;

class WishlistControllerTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $wishlistService;
    protected $bottleService;
    protected $vintageService;
    protected $domainService;
    protected $appellationService;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();

        $this->wishlistService    = Mockery::mock(WishlistService::class);
        $this->bottleService      = Mockery::mock(BottleService::class);
        $this->vintageService     = Mockery::mock(VintageService::class);
        $this->domainService      = Mockery::mock(DomainService::class);
        $this->appellationService = Mockery::mock(AppellationService::class);

        $this->app->instance(WishlistService::class, $this->wishlistService);
        $this->app->instance(BottleService::class, $this->bottleService);
        $this->app->instance(VintageService::class, $this->vintageService);
        $this->app->instance(DomainService::class, $this->domainService);
        $this->app->instance(AppellationService::class, $this->appellationService);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function testIndexRequiresAuthentication(): void
    {
        $response = $this->getJson('api/wishlist-items');

        $response->assertUnauthorized();
    }

    public function testCanListWishlistItems(): void
    {
        $bottle  = Bottle::factory()->create();
        $vintage = Vintage::factory()->create();

        $item = WishlistItem::factory()
            ->for($this->user)
            ->for($bottle)
            ->for($vintage)
            ->create();

        $this->wishlistService
            ->shouldReceive('getUserItems')
            ->once()
            ->with($this->user->id)
            ->andReturn(collect([$item->load([
                'bottle.colour', 'bottle.region', 'bottle.domain',
                'bottle.grapeVarieties', 'vintage', 'appellation',
            ])]));

        $response = $this->actingAs($this->user)->getJson('api/wishlist-items');

        $response->assertOk()
                 ->assertJsonFragment(['id' => $item->id]);
    }

    public function testCanStoreWishlistItem(): void
    {
        $colour  = Colour::factory()->create();
        $region  = Region::factory()->create();
        $domain  = Domain::factory()->create();
        $bottle  = Bottle::factory()->create([
            'colour_id' => $colour->id,
            'region_id' => $region->id,
            'domain_id' => $domain->id,
        ]);
        $vintage = Vintage::factory()->create(['year' => 2020]);

        $wishlistItem = WishlistItem::factory()
            ->for($this->user)
            ->for($bottle)
            ->for($vintage)
            ->make();

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

        $this->wishlistService
            ->shouldReceive('create')
            ->once()
            ->andReturn($wishlistItem->load([
                'bottle.colour', 'bottle.region', 'bottle.domain',
                'bottle.grapeVarieties', 'vintage', 'appellation',
            ]));

        $payload = [
            'bottle' => [
                'name'        => 'Château Test',
                'domain_name' => 'Domaine Test',
                'colour_id'   => $colour->id,
                'region_id'   => $region->id,
            ],
            'vintage' => ['year' => 2020],
        ];

        $response = $this->actingAs($this->user)->postJson('api/wishlist-items', $payload);

        $response->assertCreated();
    }

    public function testStoreRequiresAuthentication(): void
    {
        $response = $this->postJson('api/wishlist-items', []);

        $response->assertUnauthorized();
    }

    public function testStoreValidatesRequiredFields(): void
    {
        $response = $this->actingAs($this->user)->postJson('api/wishlist-items', []);

        $response->assertUnprocessable()
                 ->assertJsonFragment(['message' => 'Les données fournies ne sont pas valides'])
                 ->assertJsonPath('errors.bottle\.name', fn ($v) => !empty($v))
                 ->assertJsonPath('errors.bottle\.domain_name', fn ($v) => !empty($v))
                 ->assertJsonPath('errors.bottle\.colour_id', fn ($v) => !empty($v))
                 ->assertJsonPath('errors.bottle\.region_id', fn ($v) => !empty($v))
                 ->assertJsonPath('errors.vintage\.year', fn ($v) => !empty($v));
    }

    public function testStoreValidatesVintageYear(): void
    {
        $colour = Colour::factory()->create();
        $region = Region::factory()->create();

        $response = $this->actingAs($this->user)->postJson('api/wishlist-items', [
            'bottle' => [
                'name'        => 'Test',
                'domain_name' => 'Domaine Test',
                'colour_id'   => $colour->id,
                'region_id'   => $region->id,
            ],
            'vintage' => ['year' => 1800],
        ]);

        $response->assertUnprocessable()
                 ->assertJsonPath('errors.vintage\.year', fn ($v) => !empty($v));
    }

    public function testCanShowWishlistItem(): void
    {
        $bottle  = Bottle::factory()->create();
        $vintage = Vintage::factory()->create();

        $item = WishlistItem::factory()
            ->for($this->user)
            ->for($bottle)
            ->for($vintage)
            ->create();

        $this->wishlistService
            ->shouldReceive('findByIdAndUser')
            ->once()
            ->with($item->id, $this->user->id)
            ->andReturn($item->load([
                'bottle.colour', 'bottle.region', 'bottle.domain',
                'bottle.grapeVarieties', 'vintage', 'appellation',
            ]));

        $response = $this->actingAs($this->user)->getJson("api/wishlist-items/{$item->id}");

        $response->assertOk()
                 ->assertJsonFragment(['id' => $item->id]);
    }

    public function testShowReturns404WhenNotFound(): void
    {
        $this->wishlistService
            ->shouldReceive('findByIdAndUser')
            ->once()
            ->with(99999, $this->user->id)
            ->andReturn(null);

        $response = $this->actingAs($this->user)->getJson('api/wishlist-items/99999');

        $response->assertNotFound();
    }

    public function testShowReturns404ForAnotherUsersItem(): void
    {
        $otherUser = User::factory()->create();
        $bottle    = Bottle::factory()->create();
        $vintage   = Vintage::factory()->create();

        $item = WishlistItem::factory()
            ->for($otherUser)
            ->for($bottle)
            ->for($vintage)
            ->create();

        $this->wishlistService
            ->shouldReceive('findByIdAndUser')
            ->once()
            ->with($item->id, $this->user->id)
            ->andReturn(null);

        $response = $this->actingAs($this->user)->getJson("api/wishlist-items/{$item->id}");

        $response->assertNotFound();
    }

    public function testCanDeleteWishlistItem(): void
    {
        $bottle  = Bottle::factory()->create();
        $vintage = Vintage::factory()->create();

        $item = WishlistItem::factory()
            ->for($this->user)
            ->for($bottle)
            ->for($vintage)
            ->create();

        $this->wishlistService
            ->shouldReceive('delete')
            ->once()
            ->with(Mockery::on(fn ($arg) => $arg->id === $item->id));

        $response = $this->actingAs($this->user)->deleteJson("api/wishlist-items/{$item->id}");

        $response->assertNoContent();
    }

    public function testDeleteRequiresAuthentication(): void
    {
        $bottle  = Bottle::factory()->create();
        $vintage = Vintage::factory()->create();

        $item = WishlistItem::factory()
            ->for($this->user)
            ->for($bottle)
            ->for($vintage)
            ->create();

        $response = $this->deleteJson("api/wishlist-items/{$item->id}");

        $response->assertUnauthorized();
    }

    public function testCannotDeleteAnotherUsersWishlistItem(): void
    {
        $otherUser = User::factory()->create();
        $bottle    = Bottle::factory()->create();
        $vintage   = Vintage::factory()->create();

        $item = WishlistItem::factory()
            ->for($otherUser)
            ->for($bottle)
            ->for($vintage)
            ->create();

        $response = $this->actingAs($this->user)->deleteJson("api/wishlist-items/{$item->id}");

        $response->assertForbidden();
    }

    public function testStoreWithAppellationCreatesAppellation(): void
    {
        $colour      = Colour::factory()->create();
        $region      = Region::factory()->create();
        $domain      = Domain::factory()->create();
        $bottle      = Bottle::factory()->create([
            'colour_id' => $colour->id,
            'region_id' => $region->id,
            'domain_id' => $domain->id,
        ]);
        $vintage     = Vintage::factory()->create(['year' => 2021]);
        $appellation = Appellation::factory()->create(['name' => 'AOP Languedoc']);

        $wishlistItem = WishlistItem::factory()
            ->for($this->user)
            ->for($bottle)
            ->for($vintage)
            ->for($appellation)
            ->make();

        $this->domainService->shouldReceive('findOrCreate')->once()->andReturn($domain);
        $this->appellationService->shouldReceive('findOrCreate')->once()->andReturn($appellation);
        $this->bottleService->shouldReceive('findOrCreate')->once()->andReturn($bottle);
        $this->vintageService->shouldReceive('findOrCreate')->once()->andReturn($vintage);

        $this->wishlistService
            ->shouldReceive('create')
            ->once()
            ->with(
                Mockery::on(fn ($data) => $data['appellation_id'] === $appellation->id),
                $this->user->id
            )
            ->andReturn($wishlistItem);

        $response = $this->actingAs($this->user)->postJson('api/wishlist-items', [
            'bottle' => [
                'name'        => 'Château Test',
                'domain_name' => 'Domaine Test',
                'colour_id'   => $colour->id,
                'region_id'   => $region->id,
            ],
            'vintage'          => ['year' => 2021],
            'appellation_name' => 'AOP Languedoc',
        ]);

        $response->assertCreated();
    }
}
