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
                'domain_id' => $data['domain_id'],
                'colour_id' => $data['colour_id'],
                'region_id' => $data['region_id'] ?? null,
            ]);

            if (!empty($data['grape_variety_ids'])) {
                $bottle->grapeVarieties()->sync($data['grape_variety_ids']);
            }

            Log::info('[BOTTLE_SERVICE] Bottle operation completed', [
                'bottle_id' => $bottle->id,
                'bottle_name' => $bottle->name,
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
