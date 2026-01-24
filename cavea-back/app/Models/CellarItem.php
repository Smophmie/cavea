<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CellarItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'bottle_id',
        'vintage_id',
        'appellation_id',
        'stock',
        'rating',
        'price',
        'shop',
        'offered_by',
        'drinking_window_start',
        'drinking_window_end',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function bottle(): BelongsTo
    {
        return $this->belongsTo(Bottle::class);
    }

    public function vintage(): BelongsTo
    {
        return $this->belongsTo(Vintage::class);
    }

    public function appellation(): BelongsTo
    {
        return $this->belongsTo(Appellation::class);
    }
}
