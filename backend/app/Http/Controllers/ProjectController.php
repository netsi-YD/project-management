<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Carbon\Carbon;
use App\Models\Notification;
use App\Models\ActivityLog;

class ProjectController extends Controller
{
    public function publicProjects()
    {
        return response()->json([
            'status'   => 'success',
            'projects' => Project::all(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title'                   => 'required|string|max:255',
            'description'             => 'required|string',
            'group_id'                => 'nullable|integer|exists:project_group,group_id',
            'preferred_advisor_ids'   => 'nullable|array',
            'preferred_advisor_ids.*' => 'integer|exists:advisors,advisor_id',
        ]);

        // If a group is provided, make sure the current user actually belongs to it
        if ($request->group_id) {
            $student = \App\Models\Student::where('user_id', $request->user()->user_id)->first();

            $isMember = \App\Models\ProjectGroup::where('group_id', $request->group_id)
                ->whereHas('members', function ($q) use ($student) {
                    $q->where('group_members.student_id', $student->student_id);
                })->exists();

            if (!$isMember) {
                return response()->json([
                    'message' => 'You are not a member of the selected group.',
                ], 403);
            }

            // A group can only be linked to one project
            $alreadyLinked = \App\Models\ProjectGroup::where('group_id', $request->group_id)
                ->whereNotNull('project_id')
                ->exists();

            if ($alreadyLinked) {
                return response()->json([
                    'message' => 'This group already has a project linked to it.',
                ], 422);
            }
        }

        $advisorNames = null;
        if ($request->filled('preferred_advisor_ids')) {
            $advisorNames = \App\Models\Advisor::whereIn('advisor_id', $request->preferred_advisor_ids)
                ->pluck('specialization')
                ->implode(', ');
        }

        $project = Project::create([
            'title'                   => $request->title,
            'description'             => $request->description,
            'student_id'              => $request->user()->user_id,
            'status'                  => 'pending',
            'department_id'           => 1,
            'advisor_id'              => null,
            'submission_date'         => now(),
            'similarity_score'        => 0,
            'preferred_advisor_names' => $advisorNames,
        ]);

        // Link the group to this project
        if ($request->group_id) {
            \App\Models\ProjectGroup::where('group_id', $request->group_id)
                ->update(['project_id' => $project->project_id]);
        }

        ActivityLog::create([
            'user_id'    => $request->user()->user_id,
            'action'     => "Created project: {$project->title}",
            'ip_address' => $request->ip(),
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