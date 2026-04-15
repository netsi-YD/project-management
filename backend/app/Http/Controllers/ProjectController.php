<?php

namespace App\Http\Controllers;

use App\Models\Project;

class ProjectController extends Controller
{
    public function publicProjects()
    {
        return response()->json([
            'status' => 'success',
            'projects' => Project::all()
        ]);
    }
}