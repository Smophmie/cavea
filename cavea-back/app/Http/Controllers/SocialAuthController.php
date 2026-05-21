<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class SocialAuthController extends Controller
{
    public function handleGoogleToken(Request $request)
    {
        $request->validate(['access_token' => 'required|string'], [
            'access_token.required' => 'Le token Google est obligatoire.',
        ]);

        $googleResponse = Http::get('https://www.googleapis.com/oauth2/v1/userinfo', [
            'access_token' => $request->access_token,
        ]);

        if (! $googleResponse->ok()) {
            return response()->json(['message' => 'Token Google invalide.'], 401);
        }

        $googleUser = $googleResponse->json();

        if (empty($googleUser['email'])) {
            return response()->json(['message' => 'Email introuvable dans le compte Google.'], 422);
        }

        $user = User::firstOrCreate(
            ['email' => $googleUser['email']],
            [
                'name' => $googleUser['family_name'] ?? $googleUser['name'],
                'firstname' => $googleUser['given_name'] ?? $googleUser['name'],
                'google_id' => $googleUser['id'],
                'password' => null,
            ]
        );

        if (! $user->google_id) {
            $user->update(['google_id' => $googleUser['id']]);
        }

        if (! $user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
        }

        $user->tokens()->delete();

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json(['token' => $token, 'user' => $user]);
    }
}
