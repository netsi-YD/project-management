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

    public function store(Request $request)
    {
        $request->validate([
            'title1'                  => 'required|string|max:255',
            'title2'                  => 'required|string|max:255',
            'title3'                  => 'required|string|max:255',
            'description'             => 'nullable|string',
            'preferred_advisor_ids'   => 'nullable|array|max:3',
            'preferred_advisor_ids.*' => 'integer|exists:advisors,advisor_id',
            'group_id'                => 'nullable|integer|exists:project_group,group_id',
        ]);

        $user = $request->user();
        $student = \App\Models\Student::where('user_id', $user->user_id)->first();
        $group = null;

        if ($request->group_id) {
            $group = \App\Models\ProjectGroup::find($request->group_id);
            if (!$group) {
                return response()->json(['message' => 'Group not found.'], 404);
            }

            $isMember = $group->members()->where('group_members.student_id', $student->student_id)->exists();
            if (!$isMember) {
                return response()->json(['message' => 'You are not a member of this group.'], 403);
            }

            if ($group->project_id) {
                $existingProject = Project::find($group->project_id);
                if ($existingProject) {
                    if ($existingProject->status === 'pending') {
                        return response()->json(['message' => 'Your group already has a pending proposal. Please wait for coordinator review.'], 422);
                    }
                    $allowedStatuses = ['rejected', 'revision'];
                    if (!in_array($existingProject->status, $allowedStatuses)) {
                        return response()->json(['message' => 'Your group already has an active project. Resubmission is only allowed after rejection or revision request.'], 422);
                    }

                    $advisorNames = null;
                    if ($request->filled('preferred_advisor_ids')) {
                        $advisorNames = \App\Models\Advisor::whereIn('advisor_id', $request->preferred_advisor_ids)
                            ->pluck('specialization')
                            ->implode(', ');
                    }

                    $project = $existingProject;
                    $project->update([
                        'title'                   => $request->title1,
                        'description'             => $request->description,
                        'preferred_titles'        => json_encode([$request->title1, $request->title2, $request->title3]),
                        'preferred_advisors'      => $request->preferred_advisor_ids ? json_encode($request->preferred_advisor_ids) : null,
                        'preferred_advisor_names' => $advisorNames,
                        'status'                  => 'pending',
                    ]);

                    ActivityLog::create([
                        'user_id'    => $user->user_id,
                        'action'     => "Resubmitted project: {$project->title}",
                        'ip_address' => $request->ip(),
                    ]);

                    return response()->json(['message' => 'Project resubmitted', 'project' => $project], 201);
                }
            }
        }

        $advisorNames = null;
        if ($request->filled('preferred_advisor_ids')) {
            $advisorNames = \App\Models\Advisor::whereIn('advisor_id', $request->preferred_advisor_ids)
                ->pluck('specialization')
                ->implode(', ');
        }

        $project = Project::create([
            'title'                   => $request->title1,
            'description'             => $request->description,
            'preferred_titles'        => json_encode([$request->title1, $request->title2, $request->title3]),
            'preferred_advisors'      => $request->preferred_advisor_ids ? json_encode($request->preferred_advisor_ids) : null,
            'student_id'              => $user->user_id,
            'status'                  => 'pending',
            'department_id'           => 1,
            'advisor_id'              => null,
            'submission_date'         => now(),
            'similarity_score'        => 0,
            'preferred_advisor_names' => $advisorNames,
        ]);

        if (empty($project->preferred_titles)) {
            $project->update(['preferred_titles' => json_encode([$request->title1, $request->title2, $request->title3])]);
        }

        if ($request->group_id && $group) {
            $group->update(['project_id' => $project->project_id]);
        }

        $coordinators = \App\Models\User::whereHas('roles', function ($q) {
            $q->where('role_name', 'Project_Coordinator');
        })->get();

        foreach ($coordinators as $coordinator) {
            Notification::create([
                'user_id'         => $coordinator->user_id,
                'message_type'    => 'proposal',
                'message_content' => "New project proposal \"{$project->title}\" submitted by {$user->full_name}.",
                'is_read'         => false,
                'sent_at'         => now(),
            ]);
        }

        ActivityLog::create([
            'user_id'    => $user->user_id,
            'action'     => "Created project: {$project->title}",
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Project created successfully',
            'project' => $project,
        ], 201);
    }
}