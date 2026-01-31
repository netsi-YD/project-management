<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RoleMiddleware
{
   public function handle(Request $request, Closure $next, $role)
{
    $roles = $request->user()->roles()->pluck('name');

    if (!$roles->contains($role)) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    return $next($request);
}

}
