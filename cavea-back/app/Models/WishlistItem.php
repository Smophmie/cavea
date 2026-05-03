<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WishlistItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'bottle_id',
        'vintage_id',
        'appellation_id',
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
        return $this->belongsTo(Vintage::class)->withDefault();
    }

    public function appellation(): BelongsTo
    {
        return $this->belongsTo(Appellation::class);
    }
}
