<?php

namespace App\Services;

use App\Models\Vintage;

class VintageService
{
    public function findOrCreate(array $data): Vintage
    {
        return Vintage::firstOrCreate([
            'year' => $data['year'],
        ]);
    }
}
