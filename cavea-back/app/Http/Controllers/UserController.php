<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\UserService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    public function __construct(protected UserService $userService)
    {
    }

    /**
     * Get the authenticated user's information.
     */
    public function me(): JsonResponse
    {
        return response()->json(Auth::user());
    }

    /**
     * Register a new user and return the created user data.
     */
    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => User::RULE_REQUIRED_MAX,
            'firstname' => User::RULE_REQUIRED_MAX,
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => [
                'required',
                'min:8',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]+$/',
                'confirmed',
            ],
            'password_confirmation' => 'required',
        ], [
            'name.required' => 'Le champ nom est obligatoire.',
            'firstname.required' => 'Le champ prénom est obligatoire.',
            'email.required' => 'L\'email est obligatoire.',
            'email.email' => 'Le format de l\'email est invalide.',
            'email.unique' => 'Cet email est déjà utilisé.',
            'password.required' => 'Le mot de passe est obligatoire.',
            'password.min' => 'Le mot de passe doit contenir au moins :min caractères.',
            'password.regex' => 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial.',
            'password.confirmed' => 'La confirmation du mot de passe ne correspond pas.',
            'password_confirmation.required' => 'La confirmation du mot de passe est obligatoire.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreurs de validation.',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $data = $validator->validated();
            $data['password'] = bcrypt($data['password']);

            $user = User::create($data);

            event(new Registered($user));

            return response()->json([
                'message' => 'Compte créé avec succès. Vérifiez votre email pour activer votre compte.',
                'user' => $user,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'La création de compte a échoué.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete the authenticated user's account.
     */
    public function deleteAccount(): JsonResponse
    {
        try {
            $this->userService->deleteAccount(Auth::user());

            return response()->json(null, 204);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'La suppression du compte a échoué.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
