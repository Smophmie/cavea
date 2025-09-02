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
            'firstname' => 'Firstname',
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

    public function testUserCanRegister()
    {
        $userData = [
            'firstname' => 'Test Firstname',
            'name' => 'Test User',
            'email' => 'testuser@example.com',
            'password' => 'Password1!',
            'password_confirmation' => 'Password1!',
        ];

        $response = $this->postJson('/api/register', $userData);

        $response->assertStatus(201)
                ->assertJsonStructure([
                    'user' => [
                        'id',
                        'firstname',
                        'name',
                        'email',
                        'created_at',
                        'updated_at',
                    ],
                ]);

        $this->assertDatabaseHas('users', [
            'email' => 'testuser@example.com',
        ]);
    }

    public function testUserRegisterFailsWithInvalidEmail()
    {
        $userData = [
            'name' => 'Test User',
            'email' => 'invalid-email',
            'password' => 'Password1!',
            'password_confirmation' => 'Password1!',
        ];

        $response = $this->postJson('/api/register', $userData);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['email']);
    }

    public function testUserRegisterFailsWithWeakPassword()
    {
        $userData = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ];

        $response = $this->postJson('/api/register', $userData);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['password']);
    }

    public function testUserRegisterFailsWithDuplicateEmail()
    {
        $existingUser = User::factory()->create([
            'email' => 'duplicate@example.com'
        ]);

        $userData = [
            'name' => 'Another User',
            'email' => 'duplicate@example.com',
            'password' => 'Password1!',
            'password_confirmation' => 'Password1!',
        ];

        $response = $this->postJson('/api/register', $userData);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['email']);
    }
}