<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 401);
        }

        $userRoles = $user->roles()->pluck('role_name')->map(fn ($r) => strtolower($r))->toArray();

        foreach ($roles as $role) {
            if (in_array(strtolower($role), $userRoles)) {
                return $next($request);
            }
        }

        return response()->json([
            'message' => 'Forbidden – insufficient role'
        ], 403);
    }
}
