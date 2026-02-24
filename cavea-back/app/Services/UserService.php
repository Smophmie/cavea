<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class UserService
{
    public function getStats(int $userId): array
    {
        $totalStock = DB::table('cellar_items')
            ->where('user_id', $userId)
            ->sum('stock');

        $totalValue = DB::table('cellar_items')
            ->where('user_id', $userId)
            ->whereNotNull('price')
            ->select(DB::raw('SUM(price * stock) as total'))
            ->value('total');

        // Join through bottles to reach regions, weighted by stock
        $favouriteRegion = DB::table('cellar_items')
            ->join('bottles', 'cellar_items.bottle_id', '=', 'bottles.id')
            ->join('regions', 'bottles.region_id', '=', 'regions.id')
            ->where('cellar_items.user_id', $userId)
            ->select('regions.name as region', DB::raw('SUM(cellar_items.stock) as total_stock'))
            ->groupBy('regions.name')
            ->orderByDesc('total_stock')
            ->first();

        return [
            'total_stock'      => (int) $totalStock,
            'total_value'      => $totalValue !== null ? round((float) $totalValue, 2) : null,
            'favourite_region' => $favouriteRegion?->region,
        ];
    }

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