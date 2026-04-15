<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\GuestAccess;
use App\Models\Project;

class GuestController extends Controller
{
    // 1. PUBLIC PROJECTS
    public function projects()
    {
        return Project::where('is_public', true)->get();
    }

    // 2. SUBMIT ACCESS REQUEST
    public function requestAccess(Request $request)
    {
        $guestId = $request->ip(); // guest identity

        $access = GuestAccess::updateOrCreate(
            ['guest_id' => $guestId],
            ['status' => 'pending']
        );

        return response()->json(['status' => 'pending']);
    }

    // 3. CHECK ACCESS STATUS
    public function status(Request $request)
    {
        $guestId = $request->ip();

        $access = GuestAccess::where('guest_id', $guestId)->first();

        return response()->json([
            'status' => $access->status ?? 'none'
        ]);
    }
}