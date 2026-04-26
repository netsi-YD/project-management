<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{

   public function register(Request $request)
{
    $request->validate([
        'full_name' => 'required',
        'email' => 'required|email|unique:user,email',
        'password' => 'required|min:6',
        'phone_number' => 'nullable',
        'gender' => 'nullable'
    ]);

    $user = User::create([
        'full_name' => $request->full_name,
        'email' => $request->email,
        'password' => bcrypt($request->password),
        'phone_number' => $request->phone_number,
        'gender' => $request->gender,
        'status' => 'active'
    ]);

    $token = $user->createToken('auth_token')->plainTextToken;

    return response()->json([
        'message' => 'User registered successfully',
        'token' => $token,
        'user' => $user
    ]);
}
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
    return response()->json([
        'message' => 'User not found',
    ], 404);
}
        $roles = $user->roles()->pluck('role_name');

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'roles' => $roles,
            'full_name' => $user->full_name
        ]);
    }

    
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }
}