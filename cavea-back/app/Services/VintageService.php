<?php

namespace App\Services;

use App\Models\Vintage;
use Illuminate\Support\Facades\Log;

class VintageService
{
    public function findOrCreate(array $data): Vintage
    {
        Log::info('[VINTAGE_SERVICE] Finding or creating vintage', [
            'vintage_data' => $data,
        ]);

        try {
            $vintage = Vintage::firstOrCreate([
                'year' => $data['year'],
            ]);

            Log::info('[VINTAGE_SERVICE] Vintage operation completed', [
                'vintage_id' => $vintage->id,
                'vintage_year' => $vintage->year,
                'was_created' => $vintage->wasRecentlyCreated,
            ]);

            return $vintage;
        } catch (\Exception $e) {
            Log::error('[VINTAGE_SERVICE] Failed to find or create vintage', [
                'error_message' => $e->getMessage(),
                'error_trace' => $e->getTraceAsString(),
                'vintage_data' => $data,
            ]);

            throw $e;
        }
    }
}
