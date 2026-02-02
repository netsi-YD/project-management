<?php

namespace App\Http\Controllers;

use App\Models\Guest;
use Carbon\Carbon;

class GuestDashboardController extends Controller
{
    public function index()
{
    $now = now();

    $activeGuests = Guest::where('expiry_date', '>', $now)->get();
    $expiredGuests = Guest::where('expiry_date', '<=', $now)->count();

    return response()->json([
        'status' => 'success',
        'role' => 'guest',
        'active_guest_count' => $activeGuests->count(),
        'expired_guest_count' => $expiredGuests,
        'active_guests' => $activeGuests
    ]);
}

}
