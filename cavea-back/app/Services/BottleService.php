<?php

namespace App\Services;

use App\Models\Bottle;

class BottleService
{
    public function findOrCreate(array $data): Bottle
    {
        return Bottle::firstOrCreate([
            'name' => $data['name'],
            'domain' => $data['domain'] ?? null,
            'PDO' => $data['PDO'] ?? null,
            'colour_id' => $data['colour_id'],
        ]);
    }
}
