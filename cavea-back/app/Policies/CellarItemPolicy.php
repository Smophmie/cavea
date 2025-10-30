<?php

namespace App\Policies;

use App\Models\CellarItem;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class CellarItemPolicy
{
    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, CellarItem $cellarItem): bool
    {
        return $cellarItem->user_id === $user->id;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, CellarItem $cellarItem): bool
    {
        return $cellarItem->user_id === $user->id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, CellarItem $cellarItem): bool
    {
        return $cellarItem->user_id === $user->id;
    }
}
