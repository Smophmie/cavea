<?php

namespace App\Services;

use App\Models\Domain;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class DomainService
{
    public function findOrCreate(array $data): Domain
    {
        try {
            $domain = Domain::firstOrCreate([
                'name' => $data['name'],
            ]);

            return $domain;
        } catch (\Exception $e) {
            Log::error('[DOMAIN_SERVICE] Failed to find or create domain', [
                'error_message' => $e->getMessage(),
                'error_trace' => $e->getTraceAsString(),
                'domain_data' => $data,
            ]);

            throw $e;
        }
    }

}
