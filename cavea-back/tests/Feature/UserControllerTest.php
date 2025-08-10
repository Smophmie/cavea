<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;

class UserControllerTest extends TestCase
{
    use RefreshDatabase;

    public function testCanShowAUser()
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $response = $this->getJson('api/users/' . $user->id);

        $response->assertStatus(200)
                 ->assertJson(['id' => $user->id]);
    }

    public function testCanShowUsers()
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $response = $this->getJson('api/users');

        $response->assertStatus(200);
    }

    public function testCanUpdateAUser()
    {
        $user = User::factory()->create();
        
        $this->actingAs($user);

        $response = $this->putJson('api/users/' . $user->id, [
            'name' => 'New Name',
            'email' => 'new@example.com'
        ]);

        $response->assertStatus(200)
                 ->assertJson(['name' => 'New Name']);

        $this->assertDatabaseHas('users', ['email' => 'new@example.com']);
    }

    
    public function testCanDeleteAUser()
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $response = $this->deleteJson('api/users/' . $user->id);

        $response->assertStatus(200);

        $this->assertDatabaseMissing('users', ['id' => $user->id]);
    }
}