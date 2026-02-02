<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\GuestDashboardController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum', 'role:guest')->group(function () {

    Route::get('/guest/dashboard', [GuestDashboardController::class, 'index']);
    Route::post('/guest/request', [GuestDashboardController::class, 'requestAccess']);

});
