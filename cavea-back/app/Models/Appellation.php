<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Appellation extends Model
{
    use HasFactory;

    protected $fillable = ['name'];

     public function cellarItems(): HasMany
    {
        return $this->hasMany(CellarItem::class);
    }
}
