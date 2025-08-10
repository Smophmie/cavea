<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Laravel\Sanctum\Sanctum;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

class AuthControllerTest extends TestCase
{
    use RefreshDatabase;

    public function testUserCanLogin()
    {
        $user = User::factory()->create([
            'password' => Hash::make('Password123!')
        ]);

        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'Password123!',
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure(['token', 'user']);
    }

    public function testUserCanNotLoginWithWrongPassword()
    {
        $user = User::factory()->create([
            'password' => Hash::make('password123')
        ]);

        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401)
                 ->assertJson(['message' => 'Mot de passe incorrect.']);
    }

    public function testAuthenticatedUserCanAccessProtectedRoutes()
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/users/' . $user->id);

        $response->assertStatus(200)
                 ->assertJson(['id' => $user->id]);
    }

    public function testGuestCanNotAccessProtectedRoute()
    {
        $user = User::factory()->create();

        $response = $this->getJson('/api/users/' . $user->id);

        $response->assertStatus(401); 
    }

    public function testAuthenticatedUserCanLogout()
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/logout');

        $response->assertStatus(200)
                 ->assertJson(['message' => 'Vous avez été déconnecté.']);
    }
}
