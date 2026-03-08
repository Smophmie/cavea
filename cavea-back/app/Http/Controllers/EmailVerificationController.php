<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class EmailVerificationController extends Controller
{
    private const CONTENT_TYPE_HTML = 'text/html';

    /**
     * Verify the user's email address via signed URL.
     */
    public function verify($id, $hash)
    {
        $user = User::findOrFail($id);

        if (! hash_equals((string) $hash, hash('sha256', $user->getEmailForVerification()))) {
            return response('<h1>Lien invalide</h1><p>Ce lien de vérification est invalide ou a expiré.</p>', 400)
                ->header('Content-Type', self::CONTENT_TYPE_HTML);
        }

        if ($user->hasVerifiedEmail()) {
            return response('<h1>Email déjà vérifié</h1><p>Votre adresse email est déjà vérifiée. Vous pouvez vous connecter sur Cavea.</p>')
                ->header('Content-Type', self::CONTENT_TYPE_HTML);
        }

        $user->markEmailAsVerified();

        return response('<h1>Email vérifié !</h1><p>Votre adresse email a été vérifiée avec succès. Vous pouvez retourner sur Cavea et vous connecter.</p>')
            ->header('Content-Type', self::CONTENT_TYPE_HTML);
    }

    /**
     * Resend the verification email.
     */
    public function resend(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ], [
            'email.required' => 'L\'email est obligatoire.',
            'email.email' => 'Format d\'email invalide.',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user) {
            return response()->json(['message' => 'Aucun compte trouvé avec cet email.'], 404);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Cet email est déjà vérifié.'], 422);
        }

        $user->sendEmailVerificationNotification();

        return response()->json(['message' => 'Email de vérification renvoyé.']);
    }
}
