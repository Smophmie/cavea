<?php

namespace App\Services;

use App\Models\Domain;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class DomainService
{
    public function findOrCreate(array $data): Domain
    {
        Log::info('[DOMAIN_SERVICE] Finding or creating domain', [
            'domain_data' => $data,
        ]);

        try {
            $domain = Domain::firstOrCreate([
                'name' => $data['name'],
            ]);

            Log::info('[DOMAIN_SERVICE] Domain operation completed', [
                'domain_id' => $domain->id,
                'domain_name' => $domain->name,
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