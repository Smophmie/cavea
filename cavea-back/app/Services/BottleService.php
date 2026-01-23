<?php

namespace App\Services;

use App\Models\Bottle;
use Illuminate\Support\Facades\Log;

class BottleService
{
    public function findOrCreate(array $data): Bottle
    {
        Log::info('[BOTTLE_SERVICE] Finding or creating bottle', [
            'bottle_data' => $data,
        ]);

        try {
            $bottle = Bottle::firstOrCreate([
                'name' => $data['name'],
                'domain' => $data['domain'] ?? null,
                'PDO' => $data['PDO'] ?? null,
                'colour_id' => $data['colour_id'],
            ]);

            Log::info('[BOTTLE_SERVICE] Bottle operation completed', [
                'bottle_id' => $bottle->id,
                'bottle_name' => $bottle->name,
                'was_created' => $bottle->wasRecentlyCreated,
            ]);

            return $bottle;
        } catch (\Exception $e) {
            Log::error('[BOTTLE_SERVICE] Failed to find or create bottle', [
                'error_message' => $e->getMessage(),
                'error_trace' => $e->getTraceAsString(),
                'bottle_data' => $data,
            ]);

            throw $e;
        }
    }
}
