<?php

namespace App\Services;

use App\Models\CellarItem;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class CellarItemService
{
    
    /**
     * Get all cellar items for a user
     */
    public function getUserItems(int $userId): Collection
    {
        return CellarItem::with(['bottle.colour', 'vintage'])
            ->where('user_id', $userId)
            ->get();
    }

    /**
     * Get the last added items
     */
    public function getLastAdded(int $userId, int $limit = 10): Collection
    {
        return CellarItem::with(['bottle.colour', 'vintage'])
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
            ->map(fn($item) => [
                'colour' => $item->colour,
                'stock'  => (int) $item->total,
            ]);
    }

    /**
     * Filter cellar items by colour
     */
    public function filterByColour(int $userId, int $colourId): Collection
    {
        return CellarItem::with(['bottle.colour', 'vintage'])
            ->where('user_id', $userId)
            ->whereHas('bottle', fn($query) => $query->where('colour_id', $colourId))
            ->get();
    }

    /**
     * Find an item by ID for a specific user
     */
    public function findByIdAndUser(string $id, int $userId): ?CellarItem
    {
        return CellarItem::with(['bottle.colour', 'vintage'])
            ->where('id', $id)
            ->where('user_id', $userId)
            ->first();
    }

    /**
     * Create a cellar item
     */
    public function create(array $data, int $userId): CellarItem
    {
        $cellarItem = CellarItem::create([
            'user_id' => $userId,
            'bottle_id' => $data['bottle_id'],
            'vintage_id' => $data['vintage_id'],
            'stock' => $data['stock'],
            'rating' => $data['rating'] ?? null,
            'price' => $data['price'] ?? null,
            'shop' => $data['shop'] ?? null,
            'offered_by' => $data['offered_by'] ?? null,
            'drinking_window_start' => $data['drinking_window_start'] ?? null,
            'drinking_window_end' => $data['drinking_window_end'] ?? null,
        ]);

        return $cellarItem->load(['bottle.colour', 'vintage']);
    }

    /**
     * Update a cellar item
     */
    public function update(CellarItem $cellarItem, array $data): CellarItem
    {
        $cellarItem->update($data);
        return $cellarItem->fresh(['bottle.colour', 'vintage']);
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