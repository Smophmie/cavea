<?php

namespace App\Services;

use App\Models\CellarItem;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CellarItemService
{
    /**
     * Get all cellar items for a user
     */
    public function getUserItems(int $userId): Collection
    {
        return CellarItem::with([
            'bottle.colour',
            'bottle.region',
            'bottle.domain',
            'vintage'
        ])
            ->where('user_id', $userId)
            ->get();
    }

    /**
     * Get the last added items
     */
    public function getLastAdded(int $userId, int $limit = 10): Collection
    {
        return CellarItem::with([
            'bottle.colour',
            'bottle.region',
            'bottle.domain',
            'vintage'
            ])
            ->where('user_id', $userId)
            ->orderByDesc('created_at')
            ->take($limit)
            ->get();
    }

    /**
     * Get total stock for a user
     */
    public function getTotalStock(int $userId): int
    {
        return CellarItem::where('user_id', $userId)
            ->sum('stock');
    }

    /**
     * Get stock grouped by colour
     */
    public function getStockByColour(int $userId): Collection
    {
        return CellarItem::join('bottles', 'cellar_items.bottle_id', '=', 'bottles.id')
            ->join('colours', 'bottles.colour_id', '=', 'colours.id')
            ->where('cellar_items.user_id', $userId)
            ->select('colours.name as colour', DB::raw('SUM(cellar_items.stock) as total'))
            ->groupBy('colours.name')
            ->orderBy('colours.name')
            ->get()
            ->map(fn ($item) => [
                'colour' => $item->colour,
                'stock'  => (int) $item->total,
            ]);
    }

    /**
     * Filter cellar items by colour
     */
    public function filterByColour(int $userId, int $colourId): Collection
    {
        return CellarItem::with([
            'bottle.colour',
            'bottle.region',
            'bottle.domain',
            'vintage'
        ])
            ->where('user_id', $userId)
            ->whereHas('bottle', fn ($query) => $query->where('colour_id', $colourId))
            ->get();
    }

    /**
     * Filter cellar items by region
     */
    public function filterByRegion(int $userId, int $regionId): Collection
    {
        return CellarItem::with([
            'bottle.colour',
            'bottle.region',
            'bottle.domain',
            'vintage'
        ])
            ->where('user_id', $userId)
            ->whereHas('bottle', fn ($query) => $query->where('region_id', $regionId))
            ->get();
    }

    /**
     * Find an item by ID for a specific user
     */
    public function findByIdAndUser(string $id, int $userId): ?CellarItem
    {
        return CellarItem::with([
            'bottle.colour',
            'bottle.region',
            'bottle.domain',
            'bottle.grapeVarieties',
            'vintage',
            'appellation',
            'comments'
        ])
            ->where('id', $id)
            ->where('user_id', $userId)
            ->first();
    }

    /**
     * Create a cellar item
     */
    public function create(array $data, int $userId): CellarItem
    {
        Log::info('[CELLAR_ITEM_SERVICE] Creating cellar item', [
            'user_id' => $userId,
            'bottle_id' => $data['bottle_id'] ?? null,
            'vintage_id' => $data['vintage_id'] ?? null,
            'stock' => $data['stock'] ?? null,
            'data' => $data,
        ]);

        try {
            $cellarItem = CellarItem::create([
                'user_id' => $userId,
                'bottle_id' => $data['bottle_id'],
                'vintage_id' => $data['vintage_id'],
                'appellation_id' => $data['appellation_id'] ?? null,
                'stock' => $data['stock'],
                'rating' => $data['rating'] ?? null,
                'price' => $data['price'] ?? null,
                'shop' => $data['shop'] ?? null,
                'offered_by' => $data['offered_by'] ?? null,
                'drinking_window_start' => $data['drinking_window_start'] ?? null,
                'drinking_window_end' => $data['drinking_window_end'] ?? null,
            ]);

            Log::info('[CELLAR_ITEM_SERVICE] Cellar item created in database', [
                'cellar_item_id' => $cellarItem->id,
            ]);

            $cellarItem->load([
                'bottle.colour',
                'bottle.region',
                'bottle.domain',
                'bottle.grapeVarieties',
                'vintage',
                'appellation'
            ]);

            Log::info('[CELLAR_ITEM_SERVICE] Relationships loaded successfully', [
                'user_id' => $userId,
                'cellar_item_id' => $cellarItem->id,
                'bottle_name' => $cellarItem->bottle->name ?? null,
                'colour_name' => $cellarItem->bottle->colour->name ?? null,
                'vintage_year' => $cellarItem->vintage->year ?? null,
            ]);

            return $cellarItem;
        } catch (\Exception $e) {
            Log::error('[CELLAR_ITEM_SERVICE] Failed to create cellar item', [
                'user_id' => $userId,
                'error_message' => $e->getMessage(),
                'error_trace' => $e->getTraceAsString(),
                'data' => $data,
            ]);

            throw $e;
        }
    }

    /**
     * Update a cellar item
     */
    public function update(CellarItem $cellarItem, array $data): CellarItem
    {
        $cellarItem->update([
            'stock' => $data['stock'] ?? $cellarItem->stock,
            'rating' => $data['rating'] ?? $cellarItem->rating,
            'price' => $data['price'] ?? $cellarItem->price,
            'shop' => $data['shop'] ?? $cellarItem->shop,
            'offered_by' => $data['offered_by'] ?? $cellarItem->offered_by,
            'drinking_window_start' => $data['drinking_window_start'] ?? $cellarItem->drinking_window_start,
            'drinking_window_end' => $data['drinking_window_end'] ?? $cellarItem->drinking_window_end,
            'appellation_id' => $data['appellation_id'] ?? $cellarItem->appellation_id,
        ]);

        return $cellarItem->fresh([
            'bottle.colour',
            'bottle.region',
            'bottle.domain',
            'bottle.grapeVarieties',
            'vintage',
            'appellation'
        ]);
    }

    /**
     * Increment stock
     */
    public function incrementStock(CellarItem $cellarItem): CellarItem
    {
        $cellarItem->increment('stock');
        return $cellarItem->fresh();
    }

    /**
     * Decrement stock (only if stock > 0)
     */
    public function decrementStock(CellarItem $cellarItem): CellarItem
    {
        if ($cellarItem->stock > 0) {
            $cellarItem->decrement('stock');
        }
        return $cellarItem->fresh();
    }

    /**
     * Delete a cellar item
     */
    public function delete(CellarItem $cellarItem): void
    {
        $cellarItem->delete();
    }
}
