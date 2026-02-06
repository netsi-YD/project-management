<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\AccessRequest;

class GuestAccessApproved
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $approved = AccessRequest::where('user_id', $user->user_id)
            ->where('status', 'approved')
            ->exists();

        if (!$approved) {
            return response()->json(['message' => 'Access not approved'], 403);
        }

        return $next($request);
    }
}
