<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GuestDashboardController;

Route::get('/guest/dashboard', [GuestDashboardController::class, 'index']);
