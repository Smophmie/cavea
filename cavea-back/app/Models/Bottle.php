<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Bottle extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'colour_id',
        'region_id',
        'domain_id'
    ];

    public function cellarItems(): HasMany
    {
        return $this->hasMany(CellarItem::class);
    }

    public function colour()
    {
        return $this->belongsTo(Colour::class);
    }

    public function region()
    {
        return $this->belongsTo(Region::class);
    }

    public function domain()
    {
        return $this->belongsTo(Domain::class);
    }
}
