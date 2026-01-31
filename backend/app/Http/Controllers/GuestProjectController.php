<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;

class GuestProjectController extends Controller
{
    // Get all published projects
    public function index()
    {
        return Project::where('status', 'published')
            ->select('id','title','department','year')
            ->get();
    }

    // Get single project
    public function show($id)
    {
        return Project::where('id', $id)
            ->where('status', 'published')
            ->firstOrFail();
    }
}
