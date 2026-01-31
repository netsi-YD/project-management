<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\GuestProjectController;

// Public route
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);

    // Guest-only routes
    Route::middleware('role:guest')->group(function () {
        Route::get('/guest/projects', [GuestProjectController::class, 'index']);
        Route::get('/guest/projects/{id}', [GuestProjectController::class, 'show']);
    });
});
