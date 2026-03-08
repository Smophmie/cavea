<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Handle user login and return an API token.
     */
    public function login(Request $request)
    {
        $request->validate([
           'email' => 'required|email',
           'password' => 'required',
        ], [
            'email.required' => 'L’email est obligatoire.',
            'email.email' => 'Format d’email invalide.',
            'password.required' => 'Le mot de passe est obligatoire.',
        ]);

        $user = User::where('email', $request->email)->first();

        $error = $this->getCredentialError($user, $request->password);
        if ($error !== null) {
            return $error;
        }

        $user->tokens()->delete();

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user
        ]);
    }

    private function getCredentialError(?User $user, string $password): ?JsonResponse
    {
        if (! $user) {
            return response()->json(['message' => 'Utilisateur introuvable.'], 404);
        }

        if (Hash::check($password, $user->password)) {
            return $user->hasVerifiedEmail() ? null : response()->json([
                'message' => 'Votre adresse email n\'a pas encore été vérifiée.',
                'email_not_verified' => true,
            ], 403);
        }

        return response()->json(['message' => 'Mot de passe invalide.'], 401);
    }

    /**
     * Handle user logout by revoking the current API token.
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Vous avez été déconnecté.']);
    }
}
