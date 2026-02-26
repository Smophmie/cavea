<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TestUserSeeder extends Seeder
{
    /**
     * Create a test user for Google Play Store review.
     * Credentials are loaded from environment variables.
     */
    public function run(): void
    {
        $email = env('TEST_USER_EMAIL');
        $password = env('TEST_USER_PASSWORD');

        if (!$email || !$password) {
            $this->command->warn('TEST_USER_EMAIL or TEST_USER_PASSWORD is not set. Skipping test user creation.');
            return;
        }

        User::updateOrCreate(
            ['email' => $email],
            [
                'name' => 'Google',
                'firstname' => 'Reviewer',
                'password' => Hash::make($password),
            ]
        );

        $this->command->info("Test user created or updated: {$email}");
    }
}
