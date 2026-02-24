<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class UserService
{
    public function deleteAccount(User $user): void
    {
        Log::info('[USER_SERVICE] Deleting account', ['user_id' => $user->id]);

        try {
            DB::transaction(function () use ($user) {
                // Revoke all Sanctum tokens before deletion
                $user->tokens()->delete();
                $user->delete();
            });

            Log::info('[USER_SERVICE] Account deleted successfully', ['user_id' => $user->id]);
        } catch (\Exception $e) {
            Log::error('[USER_SERVICE] Failed to delete account', [
                'user_id'       => $user->id,
                'error_message' => $e->getMessage(),
                'error_trace'   => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }
}