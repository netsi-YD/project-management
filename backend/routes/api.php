<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GuestDashboardController;

Route::middleware('auth:sanctum', 'role:guest')->group(function () {

    Route::get('/guest/dashboard', [GuestDashboardController::class, 'index']);
    Route::post('/guest/request', [GuestDashboardController::class, 'requestAccess']);

});
