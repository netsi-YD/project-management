<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    
    public function profile(Request $request)
{
    return response()->json($request->user());
}
}
