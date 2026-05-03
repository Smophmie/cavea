<?php

namespace App\Policies;

use App\Models\User;
use App\Models\WishlistItem;

class WishlistItemPolicy
{
    public function view(User $user, WishlistItem $wishlistItem): bool
    {
        return $wishlistItem->user_id === $user->id;
    }

    public function delete(User $user, WishlistItem $wishlistItem): bool
    {
        return $wishlistItem->user_id === $user->id;
    }
}
