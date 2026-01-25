<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use App\Services\CellarItemService;
use App\Models\CellarItem;
use App\Models\User;
use App\Models\Bottle;
use App\Models\Vintage;
use App\Models\Colour;
use App\Models\Region;
use App\Models\Domain;
use App\Models\Appellation;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CellarItemServiceTest extends TestCase
{
    use RefreshDatabase;

    protected CellarItemService $service;
    protected User $user;
    protected User $otherUser;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = new CellarItemService();
        $this->user = User::factory()->create();
        $this->otherUser = User::factory()->create();
    }

    public function testCanGetAllUserItems()
    {
        $bottle = Bottle::factory()->create();
        $vintage = Vintage::factory()->create();

        $userItems = CellarItem::factory()
            ->count(3)
            ->for($this->user)
            ->for($bottle)
            ->for($vintage)
            ->create();

        CellarItem::factory()
            ->count(2)
            ->for($this->otherUser)
            ->for($bottle)
            ->for($vintage)
            ->create();

        $result = $this->service->getUserItems($this->user->id);

        $this->assertCount(3, $result);
        $this->assertTrue($result->every(fn ($item) => $item->user_id === $this->user->id));
        $this->assertTrue($result->first()->relationLoaded('bottle'));
        $this->assertTrue($result->first()->relationLoaded('vintage'));
        $this->assertTrue($result->first()->bottle->relationLoaded('region'));
        $this->assertTrue($result->first()->bottle->relationLoaded('domain'));
    }

    public function testCanGetLastAddedItems()
    {
        $bottle = Bottle::factory()->create();
        $vintage = Vintage::factory()->create();

        CellarItem::factory()
            ->count(15)
            ->for($this->user)
            ->for($bottle)
            ->for($vintage)
            ->create();

        $result = $this->service->getLastAdded($this->user->id);

        $this->assertCount(10, $result);
    }

    public function testCanCalculateTotalStock()
    {
        $bottle = Bottle::factory()->create();
        $vintage = Vintage::factory()->create();

        CellarItem::factory()->for($this->user)->for($bottle)->for($vintage)->create(['stock' => 5]);
        CellarItem::factory()->for($this->user)->for($bottle)->for($vintage)->create(['stock' => 3]);
        CellarItem::factory()->for($this->user)->for($bottle)->for($vintage)->create(['stock' => 7]);

        CellarItem::factory()->for($this->otherUser)->for($bottle)->for($vintage)->create(['stock' => 100]);

        $total = $this->service->getTotalStock($this->user->id);

        $this->assertEquals(15, $total);
    }

    public function testItReturnsZeroWhenUserHasNoItems()
    {
        $total = $this->service->getTotalStock($this->user->id);

        $this->assertEquals(0, $total);
    }

    public function testCanGetStockByColour()
    {
        $red = Colour::factory()->create(['name' => 'Rouge']);
        $white = Colour::factory()->create(['name' => 'Blanc']);
        $domain = Domain::factory()->create();
        $region = Region::factory()->create();

        $bottleRed = Bottle::factory()->create([
            'colour_id' => $red->id,
            'domain_id' => $domain->id,
            'region_id' => $region->id,
        ]);
        $bottleWhite = Bottle::factory()->create([
            'colour_id' => $white->id,
            'domain_id' => $domain->id,
            'region_id' => $region->id,
        ]);

        $vintage = Vintage::factory()->create();

        CellarItem::factory()->for($this->user)->for($bottleRed)->for($vintage)->create(['stock' => 5]);
        CellarItem::factory()->for($this->user)->for($bottleRed)->for($vintage)->create(['stock' => 3]);

        CellarItem::factory()->for($this->user)->for($bottleWhite)->for($vintage)->create(['stock' => 10]);

        CellarItem::factory()->for($this->otherUser)->for($bottleRed)->for($vintage)->create(['stock' => 100]);

        $result = $this->service->getStockByColour($this->user->id);

        $this->assertCount(2, $result);

        $blanc = $result->firstWhere('colour', 'Blanc');
        $rouge = $result->firstWhere('colour', 'Rouge');

        $this->assertEquals(10, $blanc['stock']);
        $this->assertEquals(8, $rouge['stock']);
    }

    public function testItReturnsNothingWhenNoStock()
    {
        $result = $this->service->getStockByColour($this->user->id);

        $this->assertCount(0, $result);
    }

    public function testCanFilterItemsByColour()
    {
        $red = Colour::factory()->create(['name' => 'Rouge']);
        $white = Colour::factory()->create(['name' => 'Blanc']);
        $domain = Domain::factory()->create();
        $region = Region::factory()->create();

        $bottleRed = Bottle::factory()->create([
            'colour_id' => $red->id,
            'domain_id' => $domain->id,
            'region_id' => $region->id,
        ]);
        $bottleWhite = Bottle::factory()->create([
            'colour_id' => $white->id,
            'domain_id' => $domain->id,
            'region_id' => $region->id,
        ]);

        $vintage = Vintage::factory()->create();

        $redItem1 = CellarItem::factory()->for($this->user)->for($bottleRed)->for($vintage)->create();
        $redItem2 = CellarItem::factory()->for($this->user)->for($bottleRed)->for($vintage)->create();

        CellarItem::factory()->for($this->user)->for($bottleWhite)->for($vintage)->create();

        $result = $this->service->filterByColour($this->user->id, $red->id);

        $this->assertCount(2, $result);
        $this->assertTrue($result->contains($redItem1));
        $this->assertTrue($result->contains($redItem2));
        $this->assertTrue($result->every(fn ($item) => $item->bottle->colour_id === $red->id));
    }

    public function testCanFilterItemsByRegion()
    {
        $bordeaux = Region::factory()->create(['name' => 'Bordeaux']);
        $bourgogne = Region::factory()->create(['name' => 'Bourgogne']);
        $domain = Domain::factory()->create();
        $colour = Colour::factory()->create();

        $bottleBordeaux = Bottle::factory()->create([
            'region_id' => $bordeaux->id,
            'domain_id' => $domain->id,
            'colour_id' => $colour->id,
        ]);
        $bottleBourgogne = Bottle::factory()->create([
            'region_id' => $bourgogne->id,
            'domain_id' => $domain->id,
            'colour_id' => $colour->id,
        ]);

        $vintage = Vintage::factory()->create();

        $bordeauxItem = CellarItem::factory()->for($this->user)->for($bottleBordeaux)->for($vintage)->create();
        CellarItem::factory()->for($this->user)->for($bottleBourgogne)->for($vintage)->create();

        $result = $this->service->filterByRegion($this->user->id, $bordeaux->id);

        $this->assertCount(1, $result);
        $this->assertTrue($result->contains($bordeauxItem));
    }

    public function it_only_returns_user_items_when_filtering_by_colour()
    {
        $red = Colour::factory()->create(['name' => 'Rouge']);
        $domain = Domain::factory()->create();
        $region = Region::factory()->create();
        $bottleRed = Bottle::factory()->create([
            'colour_id' => $red->id,
            'domain_id' => $domain->id,
            'region_id' => $region->id,
        ]);
        $vintage = Vintage::factory()->create();

        CellarItem::factory()->for($this->user)->for($bottleRed)->for($vintage)->create();
        CellarItem::factory()->for($this->otherUser)->for($bottleRed)->for($vintage)->create();

        $result = $this->service->filterByColour($this->user->id, $red->id);

        $this->assertCount(1, $result);
        $this->assertEquals($this->user->id, $result->first()->user_id);
    }

    public function testCanFindItem()
    {
        $bottle = Bottle::factory()->create();
        $vintage = Vintage::factory()->create();

        $cellarItem = CellarItem::factory()
            ->for($this->user)
            ->for($bottle)
            ->for($vintage)
            ->create();

        $result = $this->service->findByIdAndUser($cellarItem->id, $this->user->id);

        $this->assertNotNull($result);
        $this->assertEquals($cellarItem->id, $result->id);
        $this->assertTrue($result->relationLoaded('bottle'));
        $this->assertTrue($result->relationLoaded('vintage'));
        $this->assertTrue($result->relationLoaded('appellation'));
        $this->assertTrue($result->relationLoaded('comments'));
        $this->assertTrue($result->bottle->relationLoaded('grapeVarieties'));
    }

    public function testItReturnsNullWhenNotFound()
    {
        $result = $this->service->findByIdAndUser(999, $this->user->id);

        $this->assertNull($result);
    }

    public function testItReturnsNullWhenItemBelongsToAnotherUser()
    {
        $bottle = Bottle::factory()->create();
        $vintage = Vintage::factory()->create();

        $cellarItem = CellarItem::factory()
            ->for($this->otherUser)
            ->for($bottle)
            ->for($vintage)
            ->create();

        $result = $this->service->findByIdAndUser($cellarItem->id, $this->user->id);

        $this->assertNull($result);
    }

    public function testCanCreateACellarItem()
    {
        $bottle = Bottle::factory()->create();
        $vintage = Vintage::factory()->create();
        $appellation = Appellation::factory()->create();

        $data = [
            'bottle_id' => $bottle->id,
            'vintage_id' => $vintage->id,
            'appellation_id' => $appellation->id,
            'stock' => 12,
            'rating' => 4.5,
            'price' => 25.50,
            'shop' => 'Cave du Château',
            'offered_by' => 'Jean',
            'drinking_window_start' => 2025,
            'drinking_window_end' => 2030,
        ];

        $result = $this->service->create($data, $this->user->id);

        $this->assertInstanceOf(CellarItem::class, $result);
        $this->assertEquals($this->user->id, $result->user_id);
        $this->assertEquals($bottle->id, $result->bottle_id);
        $this->assertEquals($vintage->id, $result->vintage_id);
        $this->assertEquals($appellation->id, $result->appellation_id);
        $this->assertEquals(12, $result->stock);
        $this->assertEquals(4.5, $result->rating);
        $this->assertEquals(25.50, $result->price);
        $this->assertEquals('Cave du Château', $result->shop);
        $this->assertEquals('Jean', $result->offered_by);
        $this->assertEquals(2025, $result->drinking_window_start);
        $this->assertEquals(2030, $result->drinking_window_end);

        $this->assertTrue($result->relationLoaded('bottle'));
        $this->assertTrue($result->relationLoaded('vintage'));
        $this->assertTrue($result->relationLoaded('appellation'));

        $this->assertDatabaseHas('cellar_items', [
            'user_id' => $this->user->id,
            'bottle_id' => $bottle->id,
            'stock' => 12,
        ]);
    }

    public function testCanUpdateCellarItem()
    {
        $appellation = Appellation::factory()->create();

        $cellarItem = CellarItem::factory()
            ->for($this->user)
            ->for(Bottle::factory())
            ->for(Vintage::factory())
            ->create([
                'stock' => 5,
                'rating' => 3.0,
                'price' => 15.00,
            ]);

        $data = [
            'stock' => 10,
            'rating' => 4.5,
            'price' => 20.00,
            'appellation_id' => $appellation->id,
        ];

        $result = $this->service->update($cellarItem, $data);

        $this->assertEquals(10, $result->stock);
        $this->assertEquals(4.5, $result->rating);
        $this->assertEquals(20.00, $result->price);
        $this->assertEquals($appellation->id, $result->appellation_id);

        $this->assertDatabaseHas('cellar_items', [
            'id' => $cellarItem->id,
            'stock' => 10,
            'rating' => 4.5,
            'price' => 20.00,
            'appellation_id' => $appellation->id,
        ]);
    }

    public function testCanIncrementStock()
    {
        $cellarItem = CellarItem::factory()
            ->for($this->user)
            ->for(Bottle::factory())
            ->for(Vintage::factory())
            ->create(['stock' => 5]);

        $result = $this->service->incrementStock($cellarItem);

        $this->assertEquals(6, $result->stock);
        $this->assertDatabaseHas('cellar_items', [
            'id' => $cellarItem->id,
            'stock' => 6,
        ]);
    }

    public function testCanDecrementStock()
    {
        $cellarItem = CellarItem::factory()
            ->for($this->user)
            ->for(Bottle::factory())
            ->for(Vintage::factory())
            ->create(['stock' => 5]);

        $result = $this->service->decrementStock($cellarItem);

        $this->assertEquals(4, $result->stock);
        $this->assertDatabaseHas('cellar_items', [
            'id' => $cellarItem->id,
            'stock' => 4,
        ]);
    }

    public function testCannotDecrementStockBelowZero()
    {
        $cellarItem = CellarItem::factory()
            ->for($this->user)
            ->for(Bottle::factory())
            ->for(Vintage::factory())
            ->create(['stock' => 0]);

        $result = $this->service->decrementStock($cellarItem);

        $this->assertEquals(0, $result->stock);
        $this->assertDatabaseHas('cellar_items', [
            'id' => $cellarItem->id,
            'stock' => 0,
        ]);
    }

    public function testCanDeleteACellarItem()
    {
        $cellarItem = CellarItem::factory()
            ->for($this->user)
            ->for(Bottle::factory())
            ->for(Vintage::factory())
            ->create();

        $itemId = $cellarItem->id;

        $this->service->delete($cellarItem);

        $this->assertDatabaseMissing('cellar_items', [
            'id' => $itemId,
        ]);
    }
}
