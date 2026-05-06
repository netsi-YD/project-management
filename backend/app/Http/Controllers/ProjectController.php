<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Carbon\Carbon;
use App\Models\Notification;

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
    'department_id'    => 1,                  // keep placeholder for department
    'advisor_id'       => null,               // no default advisor
    'submission_date'  => now(),
    'similarity_score' => 0,
]);

    return response()->json([
        'message' => 'Project created successfully',
        'project' => $project,
    ], 201);
}
public function index(Request $request)
{
    $projects = Project::where('student_id', $request->user()->user_id)->get();

    foreach ($projects as $project) {
        $isDelayed = $project->deadline
            && Carbon::parse($project->deadline)->isPast()
            && !in_array($project->status, ['approved', 'completed']);

        if ($isDelayed && !$project->is_delay_notified) {
            Notification::create([
                'user_id'         => $project->student_id,
                'message_type'    => 'delay',
                'message_content' => "Your project \"{$project->title}\" is behind schedule.",
                'is_read'         => false,
                'sent_at'         => now(),
            ]);
            $project->update(['is_delay_notified' => true]);
        }

        $project->is_delayed = $isDelayed;
    }

    return response()->json([
        'projects' => $projects,
    ]);
}
}