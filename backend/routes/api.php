<?php

use Illuminate\Support\Facades\Route;

Route::get('/guest/dashboard', function () {

        return response()->json([
            'message' => 'Welcome to Guest Dashboard',
            'features' => [
                'View public projects',
                'Request access',
                'Read announcements'
            ]
        ]);
    }
);
