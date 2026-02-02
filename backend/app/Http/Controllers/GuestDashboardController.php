<?php

namespace App\Http\Controllers;

use App\Models\Guest;
use Carbon\Carbon;

class GuestDashboardController extends Controller
{
    public function index()
    {
        // Get only active (non-expired) guests
        $guests = Guest::where('expiry_date', '>', Carbon::now())
            ->orderBy('expiry_date', 'asc')
            ->get([
                'guest_id',
                'visit_reason',
                'organization',
                'privileges',
                'expiry_date'
            ]);

        return response()->json([
            'status' => 'success',
            'role' => 'guest',
            'active_guest_count' => $guests->count(),
            'guests' => $guests
        ]);
    }
}
