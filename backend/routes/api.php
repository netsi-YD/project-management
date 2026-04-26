<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GuestDashboardController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\SubmissionController;

Route::get('/guest/projects', [GuestDashboardController::class, 'projects']);
Route::post('/guest/request-access', [GuestDashboardController::class, 'requestAccess']);
Route::get('/guest/access-status', [GuestDashboardController::class, 'status']);
Route::get('/public-projects', [GuestDashboardController::class, 'publicProjects']);

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);
Route::middleware('auth:sanctum')->group(function () {

    // student
    Route::get('/student/profile', [StudentController::class, 'profile']);

    // projects
    Route::post('/projects', [ProjectController::class, 'store']);
    Route::get('/projects', [ProjectController::class, 'index']);

    // submissions
    Route::post('/submit', [SubmissionController::class, 'store']);
});