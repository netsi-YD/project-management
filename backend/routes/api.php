<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\GuestDashboardController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\SubmissionController;
use App\Http\Controllers\AdvisorRequestController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\NotificationController;
use App\Models\Submission;
use Smalot\PdfParser\Parser;
use PhpOffice\PhpWord\IOFactory;

// ########################################
// PUBLIC (GUEST) ROUTES
// ########################################
Route::get('/guest/projects', [GuestDashboardController::class, 'projects']);
Route::post('/guest/request-access', [GuestDashboardController::class, 'requestAccess']);
Route::get('/guest/access-status', [GuestDashboardController::class, 'status']);
Route::get('/public-projects', [GuestDashboardController::class, 'publicProjects']);

// ########################################
// AUTH ROUTES
// ########################################
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);

Route::get('/storage/{path}', function ($path) {
    $fullPath = storage_path('app/public/' . $path);

    if (!file_exists($fullPath)) {
        abort(404);
    }

    $contents = file_get_contents($fullPath);
    $mime = mime_content_type($fullPath);

    return response($contents)
        ->header('Content-Type', $mime)
        ->header('Content-Length', strlen($contents));
})->where('path', '.*');

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/student/profile', [StudentController::class, 'profile']);

    Route::post('/projects', [ProjectController::class, 'store']);
    Route::get('/projects', [ProjectController::class, 'index']);

    Route::post('/submit', [SubmissionController::class, 'store']);

    // ── Advisor Requests ────────────────────────────
    /*Route::post('/advisor/request', function (Request $request) {
        $request->validate([
            'advisor_id' => 'required|integer|exists:advisors,advisor_id',
            'message' => 'nullable|string',
        ]);

        $ar = \App\Models\AdvisorRequest::create([
            'student_id' => $request->user()->user_id,
            'advisor_id' => $request->advisor_id,
            'message' => $request->message,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Advisor request sent',
            'request' => $ar,
        ], 201);
    });
*/
    Route::get('/advisor/requests', function (Request $request) {
        $requests = \App\Models\AdvisorRequest::where('advisor_id', $request->user()->user_id)->get();
        return response()->json($requests);
    });

    Route::put('/advisor/request/{request_id}', function (Request $request, $request_id) {
        $advisorRequest = \App\Models\AdvisorRequest::findOrFail($request_id);

        $request->validate([
            'status' => 'required|in:accepted,rejected',
        ]);

        $advisorRequest->update(['status' => $request->status]);

        return response()->json([
            'message' => 'Request ' . $request->status,
            'request' => $advisorRequest,
        ]);
    });

    // ── Comments ────────────────────────────────────
    Route::post('/comments', [CommentController::class, 'store']);
    Route::get('/comments/{project_id}', [CommentController::class, 'index']);

    // ── Advisors list ───────────────────────────────
    Route::get('/advisors', function () {
        $advisors = \App\Models\Advisor::select('advisor_id', 'specialization', 'education_level', 'office_room')->get();
        return response()->json($advisors);
    });

    // ── Student's own submissions ────────────────────
    Route::get('/submissions', function (Request $request) {
        $submissions = Submission::where('student_id', $request->user()->user_id)
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($submissions);
    });

    // ── AI SIMILARITY CHECK ─────────────────────────
    Route::post('/ai/similarity', function (Request $request) {
        $request->validate([
            'file' => 'required|file|mimes:pdf,docx,txt|max:10240',
        ]);

        $file = $request->file('file');
        $extension = $file->getClientOriginalExtension();
        $content = '';

        // 1. Extract text from newly uploaded file
        try {
            if ($extension === 'txt') {
                $content = file_get_contents($file->getRealPath());
            } elseif ($extension === 'pdf') {
                $parser = new Parser();
                $pdf = $parser->parseFile($file->getRealPath());
                $content = $pdf->getText();
            } elseif ($extension === 'docx') {
                $phpWord = IOFactory::load($file->getRealPath());
                $text = '';
                foreach ($phpWord->getSections() as $section) {
                    foreach ($section->getElements() as $element) {
                        if (method_exists($element, 'getText')) {
                            $text .= $element->getText() . ' ';
                        } elseif (method_exists($element, 'getElements')) {
                            foreach ($element->getElements() as $child) {
                                if (method_exists($child, 'getText')) {
                                    $text .= $child->getText() . ' ';
                                }
                            }
                        }
                    }
                }
                $content = $text;
            } else {
                return response()->json(['error' => 'Unsupported file type'], 400);
            }
        } catch (\Exception $e) {
            return response()->json(['error' => 'Could not read file: ' . $e->getMessage()], 500);
        }

        if (empty(trim($content))) {
            return response()->json(['error' => 'No text could be extracted from the file.'], 400);
        }

        // 2. Extract text from ALL previous submissions (using same parsers)
        $previousFiles = Submission::where('student_id', $request->user()->user_id)
            ->get()
            ->filter(function ($sub) {
                return Storage::disk('public')->exists($sub->file_path);
            })
            ->map(function ($sub) {
                $path = storage_path('app/public/' . $sub->file_path);
                $ext = pathinfo($sub->file_path, PATHINFO_EXTENSION);

                try {
                    if ($ext === 'txt') {
                        return file_get_contents($path);
                    } elseif ($ext === 'pdf') {
                        $parser = new Parser();
                        return $parser->parseFile($path)->getText();
                    } elseif ($ext === 'docx') {
                        $phpWord = IOFactory::load($path);
                        $text = '';
                        foreach ($phpWord->getSections() as $section) {
                            foreach ($section->getElements() as $element) {
                                if (method_exists($element, 'getText')) {
                                    $text .= $element->getText() . ' ';
                                } elseif (method_exists($element, 'getElements')) {
                                    foreach ($element->getElements() as $child) {
                                        if (method_exists($child, 'getText')) {
                                            $text .= $child->getText() . ' ';
                                        }
                                    }
                                }
                            }
                        }
                        return $text;
                    }
                    return ''; // skip unsupported extensions
                } catch (\Exception $e) {
                    return '';
                }
            })
            ->filter(fn($text) => strlen(trim($text)) > 0)
            ->toArray();

        if (empty($previousFiles)) {
            return response()->json([
                'similarity_percentage' => 0,
                'message' => 'No previous submissions to compare.',
            ]);
        }

        // 3. Cosine similarity helpers
        function wordCountVector($text) {
            $words = str_word_count(strtolower($text), 1);
            return array_count_values($words);
        }
        function cosineSimilarity($vec1, $vec2) {
            $dot = 0.0; $norm1 = 0.0; $norm2 = 0.0;
            foreach ($vec1 as $word => $count) {
                $norm1 += $count * $count;
                if (isset($vec2[$word])) $dot += $count * $vec2[$word];
            }
            foreach ($vec2 as $count) $norm2 += $count * $count;
            if ($norm1 == 0 || $norm2 == 0) return 0;
            return $dot / (sqrt($norm1) * sqrt($norm2));
        }

        $currentVec = wordCountVector($content);
        $maxSimilarity = 0;
        foreach ($previousFiles as $prevContent) {
            $prevVec = wordCountVector($prevContent);
            $sim = cosineSimilarity($currentVec, $prevVec);
            if ($sim > $maxSimilarity) $maxSimilarity = $sim;
        }
        $percentage = round($maxSimilarity * 100, 2);

        return response()->json([
            'similarity_percentage' => $percentage,
            'message' => $percentage > 30 ? 'High similarity detected. Please revise.' : 'Similarity is within acceptable range.',
        ]);
    });

  Route::post('/ai/title-suggestions', function (Request $request) {
    $request->validate(['keyword' => 'required|string']);
    $kw = trim($request->keyword);

    $response = Http::withHeaders([
        'Authorization' => 'Bearer ' . env('GROQ_API_KEY'),
        'Content-Type'  => 'application/json',
    ])->post('https://api.groq.com/openai/v1/chat/completions', [
        'model' => 'llama-3.1-8b-instant',
        'messages' => [
            [
                'role' => 'system',
                'content' => 'You are a helpful academic advisor. Return ONLY a raw JSON array of strings, no other text.'
            ],
            [
                'role' => 'user',
                'content' => "Suggest exactly 10 unique final-year project titles about \"$kw\". Example: [\"Title 1\",\"Title 2\"]"
            ]
        ],
        'temperature' => 0.9,
        'max_tokens' => 500,
    ]);

    if ($response->failed()) {
        return response()->json([
            'error'   => 'Groq API error',
            'details' => $response->json(),
        ], 500);
    }

    $data = $response->json();
    $rawText = $data['choices'][0]['message']['content'] ?? '[]';

    // Remove markdown fences if present
    $rawText = preg_replace('/^```(?:json)?\s*|\s*```$/m', '', trim($rawText));
    $suggestions = json_decode(trim($rawText), true);

    if (!is_array($suggestions)) {
        return response()->json([
            'error'    => 'Failed to parse AI suggestions',
            'raw_text' => $rawText,
        ], 500);
    }

    return response()->json(['suggestions' => $suggestions]);
});

    // ── Notifications ────────────────────────────────
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);


    Route::get('/advisor/projects', function (Request $request) {
    $roles = $request->user()->roles()->pluck('role_name');
    if (!$roles->contains('Advisor')) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    $advisor = \App\Models\Advisor::where('user_id', $request->user()->user_id)->first();
    if (!$advisor) {
        return response()->json(['message' => 'Advisor profile not found'], 404);
    }


    $projects = \App\Models\Project::where('advisor_id', $advisor->advisor_id)
        ->with('student:user_id,full_name')
        ->get();

    return response()->json($projects);
});
Route::post('/advisor/review', function (Request $request) {
    // 1. Check Advisor role
    $roles = $request->user()->roles()->pluck('role_name');
    if (!$roles->contains(fn($r) => strtolower($r) === 'advisor')) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    // 2. Find the advisor profile linked to the authenticated user
    $advisor = \App\Models\Advisor::where('user_id', $request->user()->user_id)->first();
    if (!$advisor) {
        return response()->json(['message' => 'Advisor profile not found'], 404);
    }

    // 3. Validate input
    $request->validate([
        'project_id' => 'required|integer|exists:project,project_id',
        'comment'    => 'required|string',
        'status'     => 'nullable|in:approved,rejected',
    ]);

    $project = \App\Models\Project::findOrFail($request->project_id);

    // 4. Ensure the advisor is assigned to this project
    if ($project->advisor_id != $advisor->advisor_id) {
        return response()->json(['message' => 'You are not the advisor for this project'], 403);
    }

    // 5. Create the comment (feedback)
    $comment = \App\Models\Comment::create([
        'project_id' => $project->project_id,
        'user_id'    => $request->user()->user_id,
        'body'       => $request->comment,
    ]);

    // 6. Update project status if provided
    if ($request->status) {
        $project->update(['status' => $request->status]);
    }

    return response()->json([
        'message' => 'Review submitted successfully',
        'comment' => $comment,
        'project_status' => $project->status,
    ]);
});

Route::put('/advisor/request-revision/{project_id}', function (Request $request, $project_id) {
    // 1. Check Advisor role
    $roles = $request->user()->roles()->pluck('role_name');
    if (!$roles->contains(fn($r) => strtolower($r) === 'advisor')) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    // 2. Find advisor profile
    $advisor = \App\Models\Advisor::where('user_id', $request->user()->user_id)->first();
    if (!$advisor) {
        return response()->json(['message' => 'Advisor profile not found'], 404);
    }

    // 3. Find the project and verify the advisor is assigned
    $project = \App\Models\Project::findOrFail($project_id);
    if ($project->advisor_id != $advisor->advisor_id) {
        return response()->json(['message' => 'You are not the advisor for this project'], 403);
    }

    // 4. Update the project status
    $project->update(['status' => 'revision']);

    // 5. Send a notification to the student
    \App\Models\Notification::create([
        'user_id'         => $project->student_id,
        'message_type'    => 'revision',
        'message_content' => "Your project \"{$project->title}\" requires revisions. Please review the feedback.",
        'is_read'         => false,
        'sent_at'         => now(),
    ]);

    return response()->json([
        'message' => 'Revision requested successfully',
        'project' => $project,
    ]);
});

Route::post('/examiner/evaluate', function (Request $request) {
    // Check Examiner role
    $roles = $request->user()->roles()->pluck('role_name');
    if (!$roles->contains(fn($r) => strtolower($r) === 'examiner')) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    // Find examiner profile
    $examiner = \App\Models\Examiner::where('user_id', $request->user()->user_id)->first();
    if (!$examiner) {
        return response()->json(['message' => 'Examiner profile not found'], 404);
    }

    // Validate input
    $request->validate([
        'project_id' => 'required|integer|exists:project,project_id',
        'marks'      => 'required|numeric|min:0|max:100',
        'status'     => 'required|in:approved,rejected',
    ]);

    $project = \App\Models\Project::findOrFail($request->project_id);

    // Update project with marks and status
    $project->update([
        'similarity_score' => $request->marks,
        'status'           => $request->status,
    ]);

    // Notify student
    \App\Models\Notification::create([
        'user_id'         => $project->student_id,
        'message_type'    => 'evaluation',
        'message_content' => "Your project \"{$project->title}\" has been {$request->status}. Marks: {$request->marks}%.",
        'is_read'         => false,
        'sent_at'         => now(),
    ]);

    return response()->json([
        'message' => 'Evaluation submitted successfully',
        'project' => $project,
    ]);
});

// Examiner's assigned projects (all projects ready for evaluation)
Route::get('/examiner/projects', function (Request $request) {
    $roles = $request->user()->roles()->pluck('role_name');
    if (!$roles->contains(fn($r) => strtolower($r) === 'examiner')) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    // Get projects that are submitted or approved (ready for evaluation)
    $projects = \App\Models\Project::whereIn('status', ['submitted', 'approved'])
        ->with('student:user_id,full_name')
        ->get();

    return response()->json($projects);
});
Route::get('/staff/projects', function (Request $request) {
    $roles = $request->user()->roles()->pluck('role_name');
    $staffRoles = ['advisor', 'examiner', 'department_head', 'project_coordinator'];
    if (!$roles->contains(fn($r) => in_array(strtolower($r), $staffRoles))) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    $projects = \App\Models\Project::with('student:user_id,full_name')
        ->when($request->status, fn($q) => $q->where('status', $request->status))
        ->when($request->search, fn($q) => $q->where('title', 'like', "%{$request->search}%"))
        ->orderBy('project_id', 'desc')    // ✅ sorted by project ID (most recent first)
        ->paginate(20);

    return response()->json($projects);
});
Route::get('/staff/submissions', function (Request $request) {
    $roles = $request->user()->roles()->pluck('role_name');
    $staffRoles = ['advisor', 'examiner', 'department_head', 'project_coordinator'];
    if (!$roles->contains(fn($r) => in_array(strtolower($r), $staffRoles))) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    $submissions = \App\Models\Submission::with('project:project_id,title')
        ->when($request->project_id, fn($q) => $q->where('project_id', $request->project_id))
        ->when($request->type, fn($q) => $q->where('type', $request->type))
        ->orderBy('id', 'desc')
        ->paginate(20);

    return response()->json($submissions);
});

Route::post('/staff/assign-advisor', function (Request $request) {
    $roles = $request->user()->roles()->pluck('role_name');
    $allowedRoles = ['department_head', 'project_coordinator', 'super_admin'];
    if (!$roles->contains(fn($r) => in_array(strtolower($r), $allowedRoles))) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    $request->validate([
        'project_id' => 'required|integer|exists:project,project_id',
        'advisor_id' => 'required|integer|exists:advisors,advisor_id',
    ]);

    $project = \App\Models\Project::findOrFail($request->project_id);
    $project->update(['advisor_id' => $request->advisor_id]);

    return response()->json([
        'message' => 'Advisor assigned successfully',
        'project' => $project,
    ]);
});

Route::put('/staff/project-status/{project_id}', function (Request $request, $project_id) {
    $roles = $request->user()->roles()->pluck('role_name');
    $allowedRoles = ['department_head', 'project_coordinator', 'super_admin'];
    if (!$roles->contains(fn($r) => in_array(strtolower($r), $allowedRoles))) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    $request->validate([
        'status' => 'required|in:pending,approved,rejected,revision,submitted',
    ]);

    $project = \App\Models\Project::findOrFail($project_id);
    $project->update(['status' => $request->status]);

    return response()->json([
        'message' => 'Project status updated',
        'project' => $project,
    ]);
});

Route::put('/coordinator/approve-proposal/{project_id}', function (Request $request, $project_id) {
    $roles = $request->user()->roles()->pluck('role_name');
    if (!$roles->contains(fn($r) => strtolower($r) === 'project_coordinator')) {
        return response()->json(['message' => 'Unauthorized – Coordinator role required'], 403);
    }

    $request->validate(['status' => 'required|in:approved,rejected']);

    $project = \App\Models\Project::findOrFail($project_id);
    $project->update(['status' => $request->status]);

    // Notify the student
    \App\Models\Notification::create([
        'user_id'         => $project->student_id,
        'message_type'    => 'proposal_status',
        'message_content' => "Your project {$project->title} has been {$request->status} by the coordinator.",
        'is_read'         => false,
        'sent_at'         => now(),
    ]);

    return response()->json(['message' => 'Proposal updated', 'project' => $project]);
});
Route::post('/coordinator/request-advisor-acceptance/{project_id}', function (Request $request, $project_id) {
    $roles = $request->user()->roles()->pluck('role_name');
    if (!$roles->contains(fn($r) => strtolower($r) === 'project_coordinator')) {
        return response()->json(['message' => 'Unauthorized – Coordinator role required'], 403);
    }

    $project = \App\Models\Project::findOrFail($project_id);
    if (!$project->advisor_id) {
        return response()->json(['message' => 'No advisor assigned yet'], 400);
    }

    $project->update(['advisor_request_status' => 'pending']);

    // Find advisor's user and send notification
    $advisor = \App\Models\Advisor::find($project->advisor_id);
    if ($advisor && $advisor->user_id) {
        \App\Models\Notification::create([
            'user_id'         => $advisor->user_id,
            'message_type'    => 'advisor_acceptance_request',
            'message_content' => "You have been assigned to supervise project \"{$project->title}\". Please accept or reject the assignment.",
            'is_read'         => false,
            'sent_at'         => now(),
        ]);
    }

    return response()->json(['message' => 'Advisor acceptance request sent']);
});
Route::put('/advisor/respond-assignment/{project_id}', function (Request $request, $project_id) {
    // 1. Ensure the user is an advisor
    $roles = $request->user()->roles()->pluck('role_name');
    if (!$roles->contains(fn($r) => strtolower($r) === 'advisor')) {
        return response()->json(['message' => 'Unauthorized – Advisor role required'], 403);
    }

    // 2. Find the advisor record linked to the authenticated user
    $advisor = \App\Models\Advisor::where('user_id', $request->user()->user_id)->first();
    if (!$advisor) {
        return response()->json(['message' => 'Advisor profile not found'], 404);
    }

    // 3. Find the project and verify this advisor is the one assigned
    $project = \App\Models\Project::findOrFail($project_id);
    if ($project->advisor_id != $advisor->advisor_id) {
        return response()->json(['message' => 'You are not the assigned advisor for this project'], 403);
    }

    // 4. Validate the response
    $request->validate(['status' => 'required|in:accepted,rejected']);

    // 5. Update the project's advisor request status
    $project->update(['advisor_request_status' => $request->status]);

    // 6. Optionally notify the coordinator (later)

    return response()->json([
        'message' => 'Assignment ' . $request->status,
        'project' => $project,
    ]);
});

Route::post('/coordinator/assign-examiner', function (Request $request) {
    $roles = $request->user()->roles()->pluck('role_name');
    if (!$roles->contains(fn($r) => strtolower($r) === 'project_coordinator')) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    $request->validate([
        'project_id' => 'required|integer|exists:project,project_id',
        'examiner_id' => 'required|integer|exists:examiners,examiner_id',
    ]);

    $exists = DB::table('examiner_project')
        ->where('examiner_id', $request->examiner_id)
        ->where('project_id', $request->project_id)
        ->exists();

    if (!$exists) {
        DB::table('examiner_project')->insert([
            'examiner_id' => $request->examiner_id,
            'project_id'  => $request->project_id,
        ]);
    }

    return response()->json(['message' => 'Examiner assigned to project']);
});
Route::delete('/coordinator/remove-examiner', function (Request $request) {
    $roles = $request->user()->roles()->pluck('role_name');
    if (!$roles->contains(fn($r) => strtolower($r) === 'project_coordinator')) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    $request->validate([
        'project_id' => 'required|integer|exists:project,project_id',
        'examiner_id' => 'required|integer|exists:examiners,examiner_id',
    ]);

    DB::table('examiner_project')
        ->where('examiner_id', $request->examiner_id)
        ->where('project_id', $request->project_id)
        ->delete();

    return response()->json(['message' => 'Examiner removed from project']);
});

Route::get('/advisor/pending-assignments', function (Request $request) {
    $roles = $request->user()->roles()->pluck('role_name');
    if (!$roles->contains(fn($r) => strtolower($r) === 'advisor')) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }
    $advisor = \App\Models\Advisor::where('user_id', $request->user()->user_id)->first();
    if (!$advisor) {
        return response()->json(['message' => 'Advisor profile not found'], 404);
    }
    $projects = \App\Models\Project::where('advisor_id', $advisor->advisor_id)
        ->where('advisor_request_status', 'pending')
        ->with('student:user_id,full_name')
        ->get();
    return response()->json($projects);
});

Route::get('/advisor/submissions', function (Request $request) {
    $roles = $request->user()->roles()->pluck('role_name');
    if (!$roles->contains(fn($r) => strtolower($r) === 'advisor')) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }
    $advisor = \App\Models\Advisor::where('user_id', $request->user()->user_id)->first();
    if (!$advisor) {
        return response()->json(['message' => 'Advisor profile not found'], 404);
    }
    $submissions = \App\Models\Submission::whereHas('project', function ($q) use ($advisor) {
        $q->where('advisor_id', $advisor->advisor_id);
    })->with('project:project_id,title')->orderBy('created_at', 'desc')->get();
    return response()->json($submissions);
});

Route::get('/examiner/projects', function (Request $request) {
    $roles = $request->user()->roles()->pluck('role_name');
    if (!$roles->contains(fn($r) => strtolower($r) === 'examiner')) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }
    $examiner = \App\Models\Examiner::where('user_id', $request->user()->user_id)->first();
    if (!$examiner) {
        return response()->json(['message' => 'Examiner profile not found'], 404);
    }
    $projectIds = DB::table('examiner_project')->where('examiner_id', $examiner->examiner_id)->pluck('project_id');
    $projects = \App\Models\Project::whereIn('project_id', $projectIds)->with('student:user_id,full_name')->get();
    return response()->json($projects);
});

Route::put('/coordinator/request-revision/{project_id}', function (Request $request, $project_id) {
    $roles = $request->user()->roles()->pluck('role_name');
    if (!$roles->contains(fn($r) => strtolower($r) === 'project_coordinator')) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    $request->validate([
        'comment' => 'nullable|string',
    ]);

    $project = \App\Models\Project::findOrFail($project_id);
    $project->update(['status' => 'revision']);

    // Build notification message
    $message = "Your project \"{$project->title}\" requires revisions.";
    if ($request->comment) {
        $message .= " Coordinator's comments: " . $request->comment;
    }

    \App\Models\Notification::create([
        'user_id'         => $project->student_id,
        'message_type'    => 'revision',
        'message_content' => $message,
        'is_read'         => false,
        'sent_at'         => now(),
    ]);

    return response()->json(['message' => 'Revision requested', 'project' => $project]);
});


Route::get('/coordinator/examiners', function () {
    $examiners = \App\Models\Examiner::select('examiner_id', 'expertise_area', 'education_level')->get();
    return response()->json($examiners);
});

// GET /api/coordinator/proposals
Route::get('/coordinator/proposals', function (Request $request) {
    $roles = $request->user()->roles()->pluck('role_name');
    if (!$roles->contains(fn($r) => strtolower($r) === 'project_coordinator')) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }
        return response()->json(
        \App\Models\Project::where('status', 'pending')
            ->with([
                'student:user_id,full_name',
                'submissions' => function ($q) {
                    $q->where('type', 'proposal')->latest();
                }
            ])
            ->get()
    );
});

// GET /api/coordinator/examiners
Route::get('/coordinator/examiners', function () {
    return response()->json(
        \App\Models\Examiner::select('examiner_id', 'expertise_area')->get()
    );
});

// GET /api/advisors (already exists, but double‑check)
Route::get('/advisors', function () {
    return response()->json(
        \App\Models\Advisor::select('advisor_id', 'specialization')->get()
    );
});

Route::post('/evaluation/submit', function (Request $request) {
    $user = $request->user();
    $roles = $user->roles()->pluck('role_name')->map(fn($r) => strtolower($r));

    if (!$roles->contains('advisor') && !$roles->contains('examiner')) {
        return response()->json(['message' => 'Unauthorized – Advisor or Examiner role required'], 403);
    }

    $request->validate([
        'project_id'          => 'required|exists:project,project_id',
        'evaluator_type'      => 'required|in:advisor,examiner',
        'detailed_marks'      => 'required|array',
        'student_comments'    => 'nullable|string',
        'coordinator_remarks' => 'nullable|string',
        'submit'              => 'nullable|boolean',    // if true, set status to 'submitted'
    ]);

    // Ensure the user has the role they're trying to evaluate as
    if ($request->evaluator_type === 'advisor' && !$roles->contains('advisor')) {
        return response()->json(['message' => 'You are not an Advisor'], 403);
    }
    if ($request->evaluator_type === 'examiner' && !$roles->contains('examiner')) {
        return response()->json(['message' => 'You are not an Examiner'], 403);
    }

    // Compute total marks
    $total = array_sum(array_values($request->detailed_marks));

    $evaluation = \App\Models\Evaluation::updateOrCreate(
        [
            'project_id'      => $request->project_id,
            'evaluator_id'    => $user->user_id,
            'evaluator_type'  => $request->evaluator_type,
        ],
        [
            'detailed_marks'       => $request->detailed_marks,
            'total_marks'          => $total,
            'student_comments'     => $request->student_comments,
            'coordinator_remarks'  => $request->coordinator_remarks,
            'status'               => $request->has('submit') && $request->submit ? 'submitted' : 'draft',
        ]
    );

    return response()->json([
        'message'    => 'Evaluation saved',
        'evaluation' => $evaluation,
    ]);
});

Route::get('/coordinator/evaluations/{project_id}', function (Request $request, $project_id) {
    $roles = $request->user()->roles()->pluck('role_name')->map(fn($r) => strtolower($r));
    if (!$roles->contains('project_coordinator')) {
        return response()->json(['message' => 'Unauthorized – Coordinator role required'], 403);
    }

    $evaluations = \App\Models\Evaluation::where('project_id', $project_id)->get();
    return response()->json($evaluations);
});

Route::put('/coordinator/forward-evaluation/{evaluation_id}', function (Request $request, $evaluation_id) {
    $roles = $request->user()->roles()->pluck('role_name')->map(fn($r) => strtolower($r));
    if (!$roles->contains('project_coordinator')) {
        return response()->json(['message' => 'Unauthorized – Coordinator role required'], 403);
    }

    $evaluation = \App\Models\Evaluation::findOrFail($evaluation_id);
    $evaluation->update(['status' => 'forwarded_to_dept_head']);

    return response()->json(['message' => 'Forwarded to department head', 'evaluation' => $evaluation]);
});

Route::get('/coordinator/projects-for-assignment', function (Request $request) {
    $roles = $request->user()->roles()->pluck('role_name');
    if (!$roles->contains(fn($r) => strtolower($r) === 'project_coordinator')) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }
    return response()->json(
        \App\Models\Project::where('status', 'approved')
            ->whereNull('advisor_id')
            ->with('student:user_id,full_name')
            ->get()
    );
});

});