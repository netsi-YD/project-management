<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AdvisorRequest;

class AdvisorRequestController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'advisor_id' => 'required|integer|exists:advisors,advisor_id',
            'message' => 'nullable|string',
        ]);

        $ar = AdvisorRequest::create([
            'student_id' => $request->user()->user_id,
            'advisor_id' => $request->advisor_id,
            'message' => $request->message,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Advisor request sent',
            'request' => $ar,
        ], 201);
    }

    public function index(Request $request)
    {
        $requests = AdvisorRequest::where('advisor_id', $request->user()->user_id)->get();
        return response()->json($requests);
    }
}