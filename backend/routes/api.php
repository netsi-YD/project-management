<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GuestController;

Route::get('/guest/projects', [GuestController::class, 'projects']);
Route::post('/guest/request-access', [GuestController::class, 'requestAccess']);
Route::get('/guest/access-status', [GuestController::class, 'status']);

Route::get('/public-projects', [GuestController::class, 'publicProjects']);