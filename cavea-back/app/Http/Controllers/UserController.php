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

    public function destroy(string $id)
    {
        $user = User::find($id);
        $user->delete();
        return 'L\'utilisateur a été supprimé';
    }
}