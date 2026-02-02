<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GuestDashboardController;

Route::get('/guest/dashboard', [GuestDashboardController::class, 'index']);

Route::post('/guest/request-access', [GuestDashboardController::class, 'requestAccess']);
