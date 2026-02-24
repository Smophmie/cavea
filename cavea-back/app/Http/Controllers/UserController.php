<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    public function __construct(protected UserService $userService) {}

    public function index(): JsonResponse
    {
        return response()->json(User::all());
    }

    public function show(string $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $this->authorize('view', $user);

        return response()->json($user);
    }

    public function me(): JsonResponse
    {
        return response()->json(Auth::user());
    }

    public function stats(): JsonResponse
    {
        return response()->json($this->userService->getStats(Auth::id()));
    }

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

            return response()->json([
                'message' => 'Compte créé avec succès.',
                'user' => $user,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'La création de compte a échoué.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $this->authorize('update', $user);

        $request->validate([
            'name' => User::RULE_REQUIRED_MAX,
            'firstname' => User::RULE_REQUIRED_MAX,
            'email' => 'required|email|unique:users,email,' . $id,
        ]);

        $user->update($request->all());

        return response()->json($user);
    }

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

    public function destroy(string $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $this->authorize('delete', $user);

        $user->delete();

        return response()->json(['message' => 'L\'utilisateur a été supprimé']);
    }
}