<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\WishlistItem;
use App\Models\Bottle;
use App\Models\Vintage;
use App\Models\User;
use App\Services\WishlistService;
use Illuminate\Foundation\Testing\RefreshDatabase;

class WishlistServiceTest extends TestCase
{
    use RefreshDatabase;

    protected WishlistService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new WishlistService();
    }

    public function testGetUserItemsReturnsOnlyUserItems(): void
    {
        $user      = User::factory()->create();
        $otherUser = User::factory()->create();
        $bottle    = Bottle::factory()->create();
        $vintage   = Vintage::factory()->create();

        WishlistItem::factory()->for($user)->for($bottle)->for($vintage)->create();
        WishlistItem::factory()->for($user)->for($bottle)->for($vintage)->create();
        WishlistItem::factory()->for($otherUser)->for($bottle)->for($vintage)->create();

        $items = $this->service->getUserItems($user->id);

        $this->assertCount(2, $items);
        $items->each(fn ($item) => $this->assertEquals($user->id, $item->user_id));
    }

    public function testGetUserItemsLoadsRelations(): void
    {
        $user    = User::factory()->create();
        $bottle  = Bottle::factory()->create();
        $vintage = Vintage::factory()->create();

        WishlistItem::factory()->for($user)->for($bottle)->for($vintage)->create();

        $items = $this->service->getUserItems($user->id);

        $this->assertTrue($items->first()->relationLoaded('bottle'));
        $this->assertTrue($items->first()->relationLoaded('vintage'));
    }

    public function testGetUserItemsOrderedByCreatedAtDesc(): void
    {
        $user    = User::factory()->create();
        $bottle  = Bottle::factory()->create();
        $vintage = Vintage::factory()->create();

        $first  = WishlistItem::factory()->for($user)->for($bottle)->for($vintage)->create(['created_at' => now()->subDay()]);
        $second = WishlistItem::factory()->for($user)->for($bottle)->for($vintage)->create(['created_at' => now()]);

        $items = $this->service->getUserItems($user->id);

        $this->assertEquals($second->id, $items->first()->id);
        $this->assertEquals($first->id, $items->last()->id);
    }

    public function testFindByIdAndUserReturnsItemForCorrectUser(): void
    {
        $user    = User::factory()->create();
        $bottle  = Bottle::factory()->create();
        $vintage = Vintage::factory()->create();

        $item = WishlistItem::factory()->for($user)->for($bottle)->for($vintage)->create();

        $found = $this->service->findByIdAndUser($item->id, $user->id);

        $this->assertNotNull($found);
        $this->assertEquals($item->id, $found->id);
    }

    public function testFindByIdAndUserReturnsNullForWrongUser(): void
    {
        $user      = User::factory()->create();
        $otherUser = User::factory()->create();
        $bottle    = Bottle::factory()->create();
        $vintage   = Vintage::factory()->create();

        $item = WishlistItem::factory()->for($otherUser)->for($bottle)->for($vintage)->create();

        $found = $this->service->findByIdAndUser($item->id, $user->id);

        $this->assertNull($found);
    }

    public function testFindByIdAndUserReturnsNullWhenNotExists(): void
    {
        $user = User::factory()->create();

        $found = $this->service->findByIdAndUser(99999, $user->id);

        $this->assertNull($found);
    }

    public function testCreatePersistsWishlistItem(): void
    {
        $user    = User::factory()->create();
        $bottle  = Bottle::factory()->create();
        $vintage = Vintage::factory()->create();

        $wishlistItem = $this->service->create([
            'bottle_id'  => $bottle->id,
            'vintage_id' => $vintage->id,
        ], $user->id);

        $this->assertInstanceOf(WishlistItem::class, $wishlistItem);
        $this->assertEquals($user->id, $wishlistItem->user_id);
        $this->assertEquals($bottle->id, $wishlistItem->bottle_id);
        $this->assertEquals($vintage->id, $wishlistItem->vintage_id);
        $this->assertNull($wishlistItem->appellation_id);
        $this->assertDatabaseHas('wishlist_items', ['id' => $wishlistItem->id]);
    }

    public function testCreateWithoutVintage(): void
    {
        $user   = User::factory()->create();
        $bottle = Bottle::factory()->create();

        $wishlistItem = $this->service->create([
            'bottle_id' => $bottle->id,
        ], $user->id);

        $this->assertNull($wishlistItem->vintage_id);
        $this->assertDatabaseHas('wishlist_items', [
            'id'         => $wishlistItem->id,
            'vintage_id' => null,
        ]);
    }

    public function testCreateWithAppellationId(): void
    {
        $user        = User::factory()->create();
        $bottle      = Bottle::factory()->create();
        $vintage     = Vintage::factory()->create();
        $appellation = \App\Models\Appellation::factory()->create();

        $wishlistItem = $this->service->create([
            'bottle_id'      => $bottle->id,
            'vintage_id'     => $vintage->id,
            'appellation_id' => $appellation->id,
        ], $user->id);

        $this->assertEquals($appellation->id, $wishlistItem->appellation_id);
    }

    public function testCreateLoadsRelations(): void
    {
        $user    = User::factory()->create();
        $bottle  = Bottle::factory()->create();
        $vintage = Vintage::factory()->create();

        $wishlistItem = $this->service->create([
            'bottle_id'  => $bottle->id,
            'vintage_id' => $vintage->id,
        ], $user->id);

        $this->assertTrue($wishlistItem->relationLoaded('bottle'));
        $this->assertTrue($wishlistItem->relationLoaded('vintage'));
        $this->assertTrue($wishlistItem->relationLoaded('appellation'));
    }

    public function testDeleteRemovesWishlistItem(): void
    {
        $user    = User::factory()->create();
        $bottle  = Bottle::factory()->create();
        $vintage = Vintage::factory()->create();

        $item = WishlistItem::factory()->for($user)->for($bottle)->for($vintage)->create();

        $this->assertDatabaseHas('wishlist_items', ['id' => $item->id]);

        $this->service->delete($item);

        $this->assertDatabaseMissing('wishlist_items', ['id' => $item->id]);
    }
}
