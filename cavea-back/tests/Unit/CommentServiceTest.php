<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Comment;
use App\Models\CellarItem;
use App\Models\User;
use App\Models\Bottle;
use App\Models\Vintage;
use App\Services\CommentService;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CommentServiceTest extends TestCase
{
    use RefreshDatabase;

    protected CommentService $commentService;
    protected CellarItem $cellarItem;

    protected function setUp(): void
    {
        parent::setUp();
        $this->commentService = new CommentService();

        $this->cellarItem = CellarItem::factory()
            ->for(User::factory())
            ->for(Bottle::factory())
            ->for(Vintage::factory())
            ->create();
    }

    public function testCanCreateComment()
    {
        $data = [
            'date' => '2024-01-15',
            'content' => 'Excellent vin, très fruité avec des tanins souples.',
        ];

        $comment = $this->commentService->create($data, $this->cellarItem->id);

        $this->assertInstanceOf(Comment::class, $comment);
        $this->assertEquals($this->cellarItem->id, $comment->cellar_item_id);
        $this->assertEquals('2024-01-15', $comment->date);
        $this->assertEquals('Excellent vin, très fruité avec des tanins souples.', $comment->content);

        $this->assertDatabaseHas('comments', [
            'cellar_item_id' => $this->cellarItem->id,
            'content' => 'Excellent vin, très fruité avec des tanins souples.',
        ]);
    }

    public function testCanDeleteComment()
    {
        $comment = Comment::factory()
            ->for($this->cellarItem)
            ->create();

        $commentId = $comment->id;

        $this->commentService->delete($comment);

        $this->assertDatabaseMissing('comments', [
            'id' => $commentId,
        ]);
    }
}
