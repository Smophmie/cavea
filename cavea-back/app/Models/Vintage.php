<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Vintage extends Model
{
    use HasFactory;

    protected $fillable = [
        'year',
    ];

    public function cellarItems(): HasMany
    {
        return $this->hasMany(CellarItem::class);
    }
}
