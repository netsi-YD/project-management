<?php

namespace App\Http\Controllers;

use App\Models\Guest;
use Illuminate\Http\Request;
use Carbon\Carbon;

class GuestDashboardController extends Controller
{
    // GET: Guest Dashboard
    public function index()
    {
        $now = Carbon::now();

        $activeGuests = Guest::where('expiry_date', '>', $now)
            ->orderBy('expiry_date', 'asc')
            ->get();

        $expiredGuestsCount = Guest::where('expiry_date', '<=', $now)->count();

        return response()->json([
            'status' => 'success',
            'role' => 'guest',
            'active_guest_count' => $activeGuests->count(),
            'expired_guest_count' => $expiredGuestsCount,
            'active_guests' => $activeGuests
        ]);
    }

    // POST: Request Guest Access
    public function requestAccess(Request $request)
    {
        $existingGuest = Guest::where('organization', $request->organization)
    ->where('visit_reason', $request->visit_reason)
    ->where('expiry_date', '>', now())
    ->first();

if ($existingGuest) {
    return response()->json([
        'message' => 'You already have an active guest request'
    ], 409);
}

        $validated = $request->validate([
            'visit_reason' => 'required|string|max:255',
            'organization' => 'required|string|max:255',
        ]);

        $guest = Guest::create([
            'visit_reason' => $validated['visit_reason'],
            'organization' => $validated['organization'],
            'privileges' => 'read-only',
            'expiry_date' => Carbon::now()->addDays(7),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Guest access request submitted successfully',
            'guest_id' => $guest->guest_id,
            'expires_at' => $guest->expiry_date
        ], 201);
    }
}
