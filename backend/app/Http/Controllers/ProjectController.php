<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function publicProjects()
    {
        return response()->json([
            'status' => 'success',
            'projects' => Project::all()
        ]);
    }
   

public function store(Request $request)
{
    $request->validate([
        'title' => 'required|string|max:255',
        'description' => 'required|string',
    ]);

    $project = Project::create([
        'title'            => $request->title,
        'description'      => $request->description,
        'student_id'       => $request->user()->user_id,
        'status'           => 'pending',
        'department_id'    => 1,                  // placeholder
        'advisor_id'       => 1,                  // placeholder – replace with real logic later
        'submission_date'  => now(),
        'similarity_score' => 0,  // optional
    ]);

    return response()->json([
        'message' => 'Project created successfully',
        'project' => $project,
    ], 201);
}
public function index(Request $request)
{
    $projects = Project::where('student_id', $request->user()->user_id)->get();

    return response()->json([
        'projects' => $projects,
    ]);
}
}