<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use App\Notifications\VerifyEmailNotification;
use Illuminate\Support\Facades\Notification;
use Laravel\Sanctum\Sanctum;

class UserControllerTest extends TestCase
{
    use RefreshDatabase;

    public function testUserCanRegister()
    {
        Notification::fake();

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
            'email_verified_at' => null,
        ]);

        $user = User::where('email', 'testuser@example.com')->first();
        Notification::assertSentTo($user, VerifyEmailNotification::class);
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

    public function testCanGetMe()
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $response = $this->getJson('api/user/me');

        $response->assertStatus(200)
                 ->assertJson(['id' => $user->id, 'email' => $user->email]);
    }

    public function testGetMeRequiresAuth()
    {
        $response = $this->getJson('api/user/me');

        $response->assertStatus(401);
    }

    public function testCanDeleteOwnAccount()
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $response = $this->deleteJson('api/user');

        $response->assertStatus(204);

        $this->assertDatabaseMissing('users', ['id' => $user->id]);
    }

    public function testDeleteAccountRequiresAuth()
    {
        $response = $this->deleteJson('api/user');

        $response->assertStatus(401);
    }

}
