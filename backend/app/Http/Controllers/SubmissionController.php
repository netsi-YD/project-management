<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Submission;

class SubmissionController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:10240',          // 10MB max, adjust if needed
            'project_id' => 'required|integer',
            'type' => 'required|in:proposal,report,final', // allowed types
        ]);

        $path = $request->file('file')->store('submissions', 'public');

        $submission = Submission::create([
            'project_id' => $request->project_id,
            'student_id'  => $request->user()->user_id,
            'file_path'   => $path,
            'type'        => $request->type,
        ]);

        return response()->json([
            'message' => 'File uploaded successfully',
            'submission' => $submission,
        ], 201);
    }
}