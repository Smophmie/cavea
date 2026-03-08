<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Notifications\VerifyEmailNotification;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;

class EmailVerificationControllerTest extends TestCase
{
    use RefreshDatabase;

    // -------------------------------------------------------------------------
    // verify()
    // -------------------------------------------------------------------------

    public function testVerifyEmailWithValidLink()
    {
        $user = User::factory()->unverified()->create();

        $url = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $user->id, 'hash' => hash('sha256', $user->email)]
        );

        $response = $this->get($url);

        $response->assertStatus(200);
        $this->assertNotNull($user->fresh()->email_verified_at);
    }

    public function testVerifyEmailWithInvalidHash()
    {
        $user = User::factory()->unverified()->create();

        $url = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $user->id, 'hash' => 'invalid-hash']
        );

        $response = $this->get($url);

        $response->assertStatus(400);
        $this->assertNull($user->fresh()->email_verified_at);
    }

    public function testVerifyEmailAlreadyVerified()
    {
        $user = User::factory()->create();

        $url = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $user->id, 'hash' => hash('sha256', $user->email)]
        );

        $response = $this->get($url);

        $response->assertStatus(200);
        $this->assertNotNull($user->fresh()->email_verified_at);
    }

    public function testVerifyEmailWithExpiredLink()
    {
        $user = User::factory()->unverified()->create();

        $url = URL::temporarySignedRoute(
            'verification.verify',
            now()->subMinutes(1),
            ['id' => $user->id, 'hash' => hash('sha256', $user->email)]
        );

        $response = $this->get($url);

        $response->assertStatus(403);
        $this->assertNull($user->fresh()->email_verified_at);
    }

    public function testVerifyEmailWithInvalidSignature()
    {
        $user = User::factory()->unverified()->create();

        $response = $this->get("/api/email/verify/{$user->id}/" . hash('sha256', $user->email));

        $response->assertStatus(403);
        $this->assertNull($user->fresh()->email_verified_at);
    }

    // -------------------------------------------------------------------------
    // resend()
    // -------------------------------------------------------------------------

    public function testResendVerificationEmail()
    {
        Notification::fake();

        $user = User::factory()->unverified()->create();

        $response = $this->postJson('/api/email/resend', ['email' => $user->email]);

        $response->assertStatus(200)
                 ->assertJson(['message' => 'Email de vérification renvoyé.']);

        Notification::assertSentTo($user, VerifyEmailNotification::class);
    }

    public function testResendFailsForUnknownEmail()
    {
        $response = $this->postJson('/api/email/resend', ['email' => 'unknown@example.com']);

        $response->assertStatus(404)
                 ->assertJson(['message' => 'Aucun compte trouvé avec cet email.']);
    }

    public function testResendFailsForAlreadyVerifiedEmail()
    {
        $user = User::factory()->create();

        $response = $this->postJson('/api/email/resend', ['email' => $user->email]);

        $response->assertStatus(422)
                 ->assertJson(['message' => 'Cet email est déjà vérifié.']);
    }

    public function testResendFailsWithInvalidEmailFormat()
    {
        $response = $this->postJson('/api/email/resend', ['email' => 'not-an-email']);

        $response->assertStatus(422);
    }
}
