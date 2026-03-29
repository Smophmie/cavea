<?php

namespace App\Services;

use App\Models\Comment;
use App\Models\CellarItem;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class CommentService
{
    public function create(array $data, int $cellarItemId): Comment
    {
        try {
            $comment = Comment::create([
                'cellar_item_id' => $cellarItemId,
                'date' => $data['date'],
                'content' => $data['content'],
            ]);

            return $comment;
        } catch (\Exception $e) {
            Log::error('[COMMENT_SERVICE] Failed to create comment', [
                'cellar_item_id' => $cellarItemId,
                'error_message' => $e->getMessage(),
                'error_trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    public function delete(Comment $comment): void
    {
        $comment->delete();
    }
}
