<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Comment extends Model
{
    use HasFactory;

    protected $fillable = [
        'date',
        'content',
        'cellar_item_id'
        ];

    public function cellarItem(): BelongsTo
    {
        return $this->belongsTo(CellarItem::class);
    }
}
