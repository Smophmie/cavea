<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use App\Models\User;


class UserController extends Controller
{
    public function index()
    {
        $users = User::all();
        return $users;
    }

    
    public function show($id)
    {
        $user = User::find($id);
        return $user;
    }

    
    public function register(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|max:255',
            'email' => [
                'required', 
                'email',
                'unique:users,email'
            ],
            'password' => [
                'required', 
                'min:8',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]+$/',                
                'confirmed'
            ],
            'password_confirmation' => 'required',
        ]);
        try {
            $user = User::create($validatedData);
    
            return response()->json([
                'user' => $user,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'La création de compte n\'a pas fonctionné!',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    
    public function login(Request $request)
    {
        try {
            $validateUser = Validator::make($request->all(), 
            [
                'email' => 'required|email',
                'password' => 'required'
            ]);

            if($validateUser->fails()){
                return response()->json([
                    'status' => false,
                    'message' => 'Erreur de validation',
                    'errors' => $validateUser->errors()
                ], 401);
            }

            if(!Auth::attempt($request->only(['email', 'password']))){
                return response()->json([
                    'status' => false,
                    'message' => "L'e-mail ou le mot de passe est incorrect.",
                ], 401);
            }

            $user = User::where('email', $request->email)->first();

            if(auth('sanctum')->check()){
                auth()->user()->tokens()->delete();
             }

            return response()->json([
                'status' => true,
                'message' => 'Utilisateur connecté.',
                'token' => $user->createToken("API TOKEN")->plainTextToken,
                'is_admin' => $user->is_admin,
                'name'=> $user->name,
                'city' => $user->city
            ], 200);

        } catch (\Throwable $th) {
            return response()->json([
                'status' => false,
                'message' => 'Une erreur est survenue lors de la connexion. Veuillez réessayer plus tard.'
            ], 500);
        }
    }

    
    public function update(Request $request, string $id)
    {
        $request->validate([
            'name' => 'required|max:255',
            'email' => 'required|email|unique:users,email,' . $id,
          ]);
          $user = User::find($id);
          $user->update($request->all());
          return $user;
    }

   
    public function connectedUser()
    {
        $user = Auth::user();
        return $user;
    }

    
    public function logout(Request $request)
    {
        $user = Auth::user();
        if ($user) {
            $user->tokens()->delete();

            return response()->json([
                'status' => true,
            ]);
        }

        return response()->json([
            'status' => false,
            'message' => 'Utilisateur non déconnecté',
        ], 401);
    }

    
    public function destroy(string $id)
    {
        $user = User::find($id);
        $user->delete();
        return 'L\'utilisateur a été supprimé';
    }
}