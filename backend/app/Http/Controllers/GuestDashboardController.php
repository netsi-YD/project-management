<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\GuestAccess;
use App\Models\Project;

class GuestDashboardController extends Controller
{
    // 1. PUBLIC PROJECTS
    public function projects()
    {
        return Project::where('is_public', true)->get();
    }

    // 2. SUBMIT ACCESS REQUEST
    public function requestAccess(Request $request)
    {
        $guestId = $request->ip(); // guest identity

        $access = GuestAccess::updateOrCreate(
            ['guest_id' => $guestId],
            ['status' => 'pending']
        );

        return response()->json(['status' => 'pending']);
    }

    // 3. CHECK ACCESS STATUS
    public function status(Request $request)
    {
        $guestId = $request->ip();

        $access = GuestAccess::where('guest_id', $guestId)->first();

        return response()->json([
            'status' => $access->status ?? 'none'
        ]);
    }

public function publicProjects(Request $request)
{
    $query = \App\Models\Project::join('user', 'project.student_id', '=', 'user.user_id')
        ->where('project.is_archived', true)
        ->select('project.*', 'user.full_name as student_name', 'user.department');

    // If a department is specified (e.g., for logged‑in students), filter by it
    if ($request->has('department') && $request->department) {
        $query->where('user.department', $request->department);
    }

    $projects = $query->get();

    $grouped = $projects->groupBy('department')->map(function ($items, $dept) {
        return [
            'department' => $dept ?? 'Uncategorized',
            'projects'   => $items->map(function ($p) {
                $report = \App\Models\Submission::where('project_id', $p->project_id)
                    ->where('type', 'final_report')
                    ->latest()
                    ->first();
                return [
                    'project_id' => $p->project_id,
                    'title'      => $p->title,
                    'student'    => $p->student_name,
                    'abstract'   => $p->description,
                    'file_url'   => $report ? url('storage/' . $report->file_path) : null,
                ];
            })->values(),
        ];
    })->values();

    return response()->json($grouped);
}
}