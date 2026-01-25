<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

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

    public function grapeVarieties(): BelongsToMany
    {
        return $this->belongsToMany(GrapeVariety::class, 'bottle_grape_varieties');
    }
}
