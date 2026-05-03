<?php

namespace App\Services;

use App\Models\WishlistItem;
use Illuminate\Support\Collection;

class WishlistService
{
    public function getUserItems(int $userId): Collection
    {
        return WishlistItem::with([
            'bottle.colour',
            'bottle.region',
            'bottle.domain',
            'bottle.grapeVarieties',
            'vintage',
            'appellation',
        ])
            ->where('user_id', $userId)
            ->orderByDesc('created_at')
            ->get();
    }

    public function findByIdAndUser(int $id, int $userId): ?WishlistItem
    {
        return WishlistItem::with([
            'bottle.colour',
            'bottle.region',
            'bottle.domain',
            'bottle.grapeVarieties',
            'vintage',
            'appellation',
        ])
            ->where('id', $id)
            ->where('user_id', $userId)
            ->first();
    }

    public function create(array $data, int $userId): WishlistItem
    {
        $wishlistItem = WishlistItem::create([
            'user_id'        => $userId,
            'bottle_id'      => $data['bottle_id'],
            'vintage_id'     => $data['vintage_id'] ?? null,
            'appellation_id' => $data['appellation_id'] ?? null,
        ]);

        $wishlistItem->load([
            'bottle.colour',
            'bottle.region',
            'bottle.domain',
            'bottle.grapeVarieties',
            'vintage',
            'appellation',
        ]);

        return $wishlistItem;
    }

    public function delete(WishlistItem $wishlistItem): void
    {
        $wishlistItem->delete();
    }
}
