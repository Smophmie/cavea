<?php

namespace App\Services;

use App\Models\Appellation;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class AppellationService
{
    public function findOrCreate(array $data): Appellation
    {
        Log::info('[APPELLATION_SERVICE] Finding or creating appellation', [
            'appellation_data' => $data,
        ]);

        try {
            $appellation = Appellation::firstOrCreate([
                'name' => $data['name'],
            ]);

            Log::info('[APPELLATION_SERVICE] Appellation operation completed', [
                'appellation_id' => $appellation->id,
                'appellation_name' => $appellation->name,
            ]);

            return $appellation;
        } catch (\Exception $e) {
            Log::error('[APPELLATION_SERVICE] Failed to find or create appellation', [
                'error_message' => $e->getMessage(),
                'error_trace' => $e->getTraceAsString(),
                'appellation_data' => $data,
            ]);

            throw $e;
        }
    }
}