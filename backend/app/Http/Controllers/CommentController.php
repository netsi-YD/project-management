<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Comment;

class CommentController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'project_id' => 'required|integer|exists:project,project_id',
            'body' => 'required|string',
        ]);

        $comment = Comment::create([
            'project_id' => $request->project_id,
            'user_id' => $request->user()->user_id,
            'body' => $request->body,
        ]);

        return response()->json([
            'message' => 'Comment added',
            'comment' => $comment,
        ], 201);
    }

    public function index($project_id)
{
    $comments = Comment::where('project_id', $project_id)
        ->with('user:user_id,full_name')
        ->orderBy('created_at', 'asc')
        ->get();

    return response()->json($comments);
}
}