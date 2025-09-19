<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;


class Bottle extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'name',
        'domain',
        'PDO',
    ];

    public function cellarItems(): HasMany
    {
        return $this->hasMany(CellarItem::class);
    }

    public function colour()
    {
        return $this->belongsTo(Colour::class);
    }
}
