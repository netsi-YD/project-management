<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Submission;
use App\Models\ActivityLog;
use App\Models\Project;
use Illuminate\Support\Facades\Storage;

class SubmissionController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'file'       => 'required|file|max:10240',
            'project_id' => 'required|integer|exists:project,project_id',
            'type'       => 'required|in:proposal,report,final',
        ]);

        $project = Project::findOrFail($request->project_id);
        $userId  = $request->user()->user_id;

        // ── 1. Authorization: must be project owner or group member ──
        $isOwner = $project->student_id == $userId;

        $isGroupMember = false;
        if (!$isOwner) {
            $student = \App\Models\Student::where('user_id', $userId)->first();

            if ($student) {
                $isGroupMember = \App\Models\ProjectGroup::where('project_id', $project->project_id)
                    ->whereHas('members', function ($q) use ($student) {
                        $q->where('group_members.student_id', $student->student_id);
                    })->exists();
            }
        }

        if (!$isOwner && !$isGroupMember) {
            return response()->json([
                'message' => 'You are not authorized to upload files for this project.',
            ], 403);
        }

        // ── 2. One submission per type per project ──
        $existing = Submission::where('project_id', $request->project_id)
            ->where('type', $request->type)
            ->first();

        if ($existing) {
            // Block re-upload unless project is under revision
            if ($project->status !== 'revision') {
                return response()->json([
                    'message' => "A {$request->type} has already been submitted for this project. Re-upload is only allowed when revision is requested.",
                ], 422);
            }

            // Revision re-upload: delete old file from storage and record
            if (Storage::disk('public')->exists($existing->file_path)) {
                Storage::disk('public')->delete($existing->file_path);
            }
            $existing->delete();
        }

        // ── 3. Store the new file ──
        $path = $request->file('file')->store('submissions', 'public');

        $submission = Submission::create([
            'project_id' => $request->project_id,
            'student_id' => $userId,
            'file_path'  => $path,
            'type'       => $request->type,
        ]);

        ActivityLog::create([
            'user_id'    => $userId,
            'action'     => "Uploaded {$request->type} for project ID {$request->project_id}",
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message'    => 'File uploaded successfully',
            'submission' => $submission,
        ], 201);
    }
}