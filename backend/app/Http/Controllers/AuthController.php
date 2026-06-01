<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'full_name'       => 'required|string|max:255',
            'email'           => 'required|email|unique:user,email',
            'phone_number'    => 'nullable|string|max:20',
            'gender'          => 'nullable|in:male,female',
            'institution_id'  => 'required|string|max:50',
            'department'      => 'required|string|max:100',
            'requested_roles' => 'required|array',
            'requested_roles.*' => 'string|in:Student,Advisor,Examiner,Department_Head,Project_Coordinator',
            'year_of_study'   => 'nullable|in:1st,2nd,3rd,4th,5th',
        ]);

        if (in_array('Student', $request->requested_roles) && !$request->year_of_study) {
            return response()->json(['message' => 'Year of study is required for students.'], 422);
        }

        $user = User::create([
            'full_name'       => $request->full_name,
            'email'           => $request->email,
            'password'        => bcrypt(''),
            'phone_number'    => $request->phone_number,
            'gender'          => $request->gender,
            'institution_id'  => $request->institution_id,
            'department'      => $request->department,
            'year_of_study'   => $request->year_of_study,
            'requested_role'  => implode(', ', $request->requested_roles),
            'status'          => 'pending',
        ]);

        return response()->json([
            'message' => 'Registration submitted. Await admin approval.',
        ], 201);
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

    // Block deactivated accounts
    if ($user->status !== 'active') {
        return response()->json([
            'message' => 'Account is deactivated. Contact administrator.',
        ], 403);
    }

    if (!Hash::check($request->password, $user->password)) {
        return response()->json(['message' => 'Invalid credentials'], 401);
    }

    $roles = $user->roles()->pluck('role_name');
    $token = $user->createToken('auth_token')->plainTextToken;

    ActivityLog::create([
        'user_id'    => $user->user_id,
        'action'     => 'User logged in',
        'ip_address' => $request->ip(),
    ]);

    return response()->json([
        'token'     => $token,
        'roles'     => $roles,
        'full_name' => $user->full_name,
        'user_id'   => $user->user_id,
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