<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AccessRequest;

class AccessRequestController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'requested_role' => 'required|string'
        ]);

        $accessRequest = AccessRequest::create([
            'user_id' => auth()->id(),
            'requested_role' => $request->requested_role,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Access request submitted successfully',
            'data' => $accessRequest
        ], 201);
    }
}
