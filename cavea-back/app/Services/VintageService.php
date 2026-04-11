<?php

namespace App\Services;

use App\Models\Vintage;
use Illuminate\Support\Facades\Log;

class VintageService
{
    public function findOrCreate(array $data): Vintage
    {
        try {
            $vintage = Vintage::firstOrCreate([
                'year' => $data['year'],
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
