<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\GuestDashboardController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\SubmissionController;
use App\Http\Controllers\AdvisorRequestController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\NotificationController;
use App\Models\Submission;
use App\Models\ActivityLog;
use Smalot\PdfParser\Parser;
use PhpOffice\PhpWord\IOFactory;

Route::get('/guest/projects', [GuestDashboardController::class, 'projects']);
Route::post('/guest/request-access', [GuestDashboardController::class, 'requestAccess']);
Route::get('/guest/access-status', [GuestDashboardController::class, 'status']);
Route::get('/public-projects', [GuestDashboardController::class, 'publicProjects']);

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

    Route::post('/advisor/request', function (Request $request) {
        $request->validate([
            'advisor_id' => 'required|integer|exists:advisors,advisor_id',
            'message'    => 'nullable|string',
            'project_id' => 'nullable|integer|exists:project,project_id',
        ]);

        $ar = \App\Models\AdvisorRequest::create([
            'student_id' => $request->user()->user_id,
            'advisor_id' => $request->advisor_id,
            'message'    => $request->message,
            'status'     => 'pending',
        ]);

        ActivityLog::create([
            'user_id'    => $request->user()->user_id,
            'action'     => "Sent advisor request to advisor ID {$request->advisor_id}",
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Advisor request sent',
            'request' => $ar,
        ], 201);
    });

    Route::put('/advisor/request/{request_id}/respond', function (Request $request, $request_id) {
        $roles = $request->user()->roles()->pluck('role_name');
        if (!$roles->contains(fn($r) => strtolower($r) === 'advisor')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $advisorRequest = \App\Models\AdvisorRequest::findOrFail($request_id);
        $request->validate(['status' => 'required|in:accepted,rejected']);

        $advisorRequest->update(['status' => $request->status]);

        if ($request->status === 'accepted' && $advisorRequest->project_id) {
            $project = \App\Models\Project::find($advisorRequest->project_id);
            if ($project && is_null($project->advisor_id)) {
                $project->update(['advisor_id' => $advisorRequest->advisor_id]);

                \App\Models\Notification::create([
                    'user_id'         => $project->student_id,
                    'message_type'    => 'advisor_assigned',
                    'message_content' => "Your advisor request for project \"{$project->title}\" has been accepted.",
                    'is_read'         => false,
                    'sent_at'         => now(),
                ]);
            }
        }

        return response()->json(['message' => 'Request ' . $request->status]);
    });

    Route::get('/advisor/requests', function (Request $request) {
        $requests = \App\Models\AdvisorRequest::where('advisor_id', $request->user()->user_id)
            ->with('student:user_id,full_name')
            ->latest()
            ->get();
        return response()->json($requests);
    });

    Route::post('/comments', [CommentController::class, 'store']);
    Route::get('/comments/{project_id}', [CommentController::class, 'index']);

    Route::get('/advisors', function () {
        $advisors = \App\Models\Advisor::select('advisor_id', 'specialization', 'education_level', 'office_room')->get();
        return response()->json($advisors);
    });

    Route::get('/submissions', function (Request $request) {
        $submissions = Submission::where('student_id', $request->user()->user_id)
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($submissions);
    });

    Route::post('/ai/similarity', function (Request $request) {
        $request->validate(['file' => 'required|file|mimes:pdf,docx,txt|max:10240']);
        $file = $request->file('file');
        $extension = $file->getClientOriginalExtension();
        $content = '';
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
                    return '';
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
                    'content' => 'You are a helpful academic advisor. Return ONLY a raw JSON array of strings, no other text. Order the titles from most relevant to least relevant based on the keyword.'
                ],
                [
                    'role' => 'user',
                    'content' => "Suggest exactly 10 unique final-year project titles about \"$kw\". Order them from most relevant to least relevant based on the keyword. Example: [\"Most relevant title\",\"Next relevant title\",...]"
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
            ->with([
                'student:user_id,full_name',
                'group.members.user:user_id,full_name',
                'submissions'
            ])
            ->get()
            ->map(function ($project) {
                $groupData = null;
                if ($project->group) {
                    $groupData = [
                        'group_id'     => $project->group->group_id,
                        'group_number' => $project->group->group_number,
                        'members'      => $project->group->members->map(function ($member) {
                            return [
                                'student_id' => $member->student_id,
                                'full_name'  => $member->user->full_name ?? 'Unknown',
                            ];
                        }),
                    ];
                }

                $latestSub = $project->submissions->sortByDesc('created_at')->first();
                $latestSubmission = null;
                if ($latestSub) {
                    $latestSubmission = [
                        'id'         => $latestSub->id,
                        'type'       => $latestSub->type,
                        'file_url'   => $latestSub->file_path
                                        ? url('storage/' . $latestSub->file_path)
                                        : null,
                        'created_at' => $latestSub->created_at,
                    ];
                }

                return [
                    'project_id'       => $project->project_id,
                    'title'            => $project->title,
                    'status'           => $project->status,
                    'student_name'     => $project->student->full_name ?? 'N/A',
                    'group'            => $groupData,
                    'latest_submission'=> $latestSubmission,
                ];
            });

        return response()->json($projects);
    });

    Route::post('/advisor/review', function (Request $request) {
        $roles = $request->user()->roles()->pluck('role_name');
        if (!$roles->contains(fn($r) => strtolower($r) === 'advisor')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $advisor = \App\Models\Advisor::where('user_id', $request->user()->user_id)->first();
        if (!$advisor) {
            return response()->json(['message' => 'Advisor profile not found'], 404);
        }
        $request->validate([
            'project_id' => 'required|integer|exists:project,project_id',
            'comment'    => 'required|string',
            'status'     => 'nullable|in:approved,rejected,revision',
        ]);
        $project = \App\Models\Project::findOrFail($request->project_id);
        if ($project->advisor_id != $advisor->advisor_id) {
            return response()->json(['message' => 'You are not the advisor for this project'], 403);
        }
        $comment = \App\Models\Comment::create([
            'project_id' => $project->project_id,
            'user_id'    => $request->user()->user_id,
            'body'       => $request->comment,
        ]);
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
        $roles = $request->user()->roles()->pluck('role_name');
        if (!$roles->contains(fn($r) => strtolower($r) === 'advisor')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $advisor = \App\Models\Advisor::where('user_id', $request->user()->user_id)->first();
        if (!$advisor) {
            return response()->json(['message' => 'Advisor profile not found'], 404);
        }
        $project = \App\Models\Project::findOrFail($project_id);
        if ($project->advisor_id != $advisor->advisor_id) {
            return response()->json(['message' => 'You are not the advisor for this project'], 403);
        }
        $project->update(['status' => 'revision']);
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
        $roles = $request->user()->roles()->pluck('role_name');
        if (!$roles->contains(fn($r) => strtolower($r) === 'examiner')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $examiner = \App\Models\Examiner::where('user_id', $request->user()->user_id)->first();
        if (!$examiner) {
            return response()->json(['message' => 'Examiner profile not found'], 404);
        }
        $request->validate([
            'project_id' => 'required|integer|exists:project,project_id',
            'marks'      => 'required|numeric|min:0|max:100',
            'status'     => 'required|in:approved,rejected',
        ]);
        $project = \App\Models\Project::findOrFail($request->project_id);
        $project->update([
            'similarity_score' => $request->marks,
            'status'           => $request->status,
        ]);
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

    Route::get('/staff/projects', function (Request $request) {
        $roles = $request->user()->roles()->pluck('role_name');
        $staffRoles = ['advisor', 'examiner', 'department_head', 'project_coordinator'];
        if (!$roles->contains(fn($r) => in_array(strtolower($r), $staffRoles))) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $projects = \App\Models\Project::with('student:user_id,full_name')
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->search, fn($q) => $q->where('title', 'like', "%{$request->search}%"))
            ->orderBy('project_id', 'desc')
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
        $project->update(['advisor_request_status' => 'pending']);
        $advisor = \App\Models\Advisor::find($request->advisor_id);
        if ($advisor && $advisor->user_id) {
            \App\Models\Notification::create([
                'user_id'          => $advisor->user_id,
                'message_type'     => 'advisor_acceptance_request',
                'message_content'  => "You have been assigned to supervise project \"{$project->title}\". Please accept or reject.",
                'is_read'          => false,
                'sent_at'          => now(),
            ]);
        }
        ActivityLog::create([
            'user_id'    => $request->user()->user_id,
            'action'     => "Assigned advisor (ID {$request->advisor_id}) to project ID {$request->project_id}",
            'ip_address' => $request->ip(),
        ]);
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
        $request->validate(['status' => 'required|in:pending,approved,rejected,revision,submitted']);
        $project = \App\Models\Project::findOrFail($project_id);
        $project->update(['status' => $request->status]);
        ActivityLog::create([
            'user_id'    => $request->user()->user_id,
            'action'     => "Changed project ID {$project_id} status to {$request->status}",
            'ip_address' => $request->ip(),
        ]);
        return response()->json(['message' => 'Project status updated', 'project' => $project]);
    });

    Route::put('/coordinator/approve-proposal/{project_id}', function (Request $request, $project_id) {
        $roles = $request->user()->roles()->pluck('role_name');
        if (!$roles->contains(fn($r) => strtolower($r) === 'project_coordinator')) {
            return response()->json(['message' => 'Unauthorized – Coordinator role required'], 403);
        }
        $request->validate(['status' => 'required|in:approved,rejected']);
        $project = \App\Models\Project::findOrFail($project_id);
        $project->update(['status' => $request->status]);
        \App\Models\Notification::create([
            'user_id'         => $project->student_id,
            'message_type'    => 'proposal_status',
            'message_content' => "Your project {$project->title} has been {$request->status} by the coordinator.",
            'is_read'         => false,
            'sent_at'         => now(),
        ]);
        ActivityLog::create([
            'user_id'    => $request->user()->user_id,
            'action'     => "Coordinator {$request->status} project ID {$project_id}",
            'ip_address' => $request->ip(),
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
        $roles = $request->user()->roles()->pluck('role_name');
        if (!$roles->contains(fn($r) => strtolower($r) === 'advisor')) {
            return response()->json(['message' => 'Unauthorized – Advisor role required'], 403);
        }
        $advisor = \App\Models\Advisor::where('user_id', $request->user()->user_id)->first();
        if (!$advisor) {
            return response()->json(['message' => 'Advisor profile not found'], 404);
        }
        $project = \App\Models\Project::findOrFail($project_id);
        if ($project->advisor_id != $advisor->advisor_id) {
            return response()->json(['message' => 'You are not the assigned advisor for this project'], 403);
        }
        $request->validate(['status' => 'required|in:accepted,rejected']);
        $project->update(['advisor_request_status' => $request->status]);

        if ($request->status === 'accepted') {
            $studentGroup = \App\Models\ProjectGroup::whereHas('members', function ($q) use ($project) {
                $q->where('students.user_id', $project->student_id);
            })->first();

            if ($studentGroup) {
                $studentGroup->update(['project_id' => $project->project_id]);
            }
        }

        return response()->json([
            'message' => 'Assignment ' . $request->status,
            'project' => $project,
        ]);
    });

    Route::get('/advisor/projects/{project}', function (Request $request, $project) {
        $roles = $request->user()->roles()->pluck('role_name');
        if (!$roles->contains('Advisor')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $advisor = \App\Models\Advisor::where('user_id', $request->user()->user_id)->first();
        if (!$advisor) {
            return response()->json(['message' => 'Advisor profile not found'], 404);
        }

        $project = \App\Models\Project::where('project_id', $project)
            ->where('advisor_id', $advisor->advisor_id)
            ->with([
                'student:user_id,full_name',
                'group.members.user:user_id,full_name',
                'submissions' => function ($q) {
                    $q->orderBy('created_at', 'desc');
                },
            ])
            ->first();

        if (!$project) {
            return response()->json(['message' => 'Project not found or not yours'], 404);
        }

        if (!$project->group) {
            $studentGroup = \App\Models\ProjectGroup::whereHas('members', function ($q) use ($project) {
                $q->where('students.user_id', $project->student_id);
            })->first();

            if ($studentGroup) {
                $studentGroup->update(['project_id' => $project->project_id]);
                $project->load('group.members.user:user_id,full_name');
            }
        }

        $project->submissions->transform(function ($sub) {
            $sub->file_url = $sub->file_path ? url('storage/' . $sub->file_path) : null;
            return $sub;
        });

        $evaluations = \App\Models\Evaluation::where('project_id', $project->project_id)
            ->where('evaluator_id', $request->user()->user_id)
            ->get();

        return response()->json([
            'project' => $project,
            'evaluations' => $evaluations,
        ]);
    })->whereNumber('project');

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
        ActivityLog::create([
            'user_id'    => $request->user()->user_id,
            'action'     => "Assigned examiner (ID {$request->examiner_id}) to project ID {$request->project_id}",
            'ip_address' => $request->ip(),
        ]);
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
        })->with('project:project_id,title')->orderBy('created_at', 'desc')->get()
          ->map(function ($sub) {
              return [
                  'id' => $sub->id,
                  'project_id' => $sub->project_id,
                  'project_title' => $sub->project->title ?? null,
                  'file_path' => $sub->file_path,
                  'type' => $sub->type,
                  'created_at' => $sub->created_at,
                  'file_url' => $sub->file_path ? url('storage/' . $sub->file_path) : null,
              ];
          });

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

    Route::get('/examiner/projects/{project}', function (Request $request, $project) {
        $roles = $request->user()->roles()->pluck('role_name');
        if (!$roles->contains(fn($r) => strtolower($r) === 'examiner')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $examiner = \App\Models\Examiner::where('user_id', $request->user()->user_id)->first();
        if (!$examiner) {
            return response()->json(['message' => 'Examiner profile not found'], 404);
        }

        $isAssigned = DB::table('examiner_project')
            ->where('examiner_id', $examiner->examiner_id)
            ->where('project_id', $project)
            ->exists();

        if (!$isAssigned) {
            return response()->json(['message' => 'You are not assigned to this project'], 403);
        }

        $project = \App\Models\Project::where('project_id', $project)
            ->with([
                'student:user_id,full_name',
                'group.members.user:user_id,full_name',
                'submissions' => function ($q) {
                    $q->orderBy('created_at', 'desc');
                },
            ])
            ->first();

        if (!$project) {
            return response()->json(['message' => 'Project not found'], 404);
        }

        $project->submissions->transform(function ($sub) {
            $sub->file_url = $sub->file_path ? url('storage/' . $sub->file_path) : null;
            return $sub;
        });

        $evaluations = \App\Models\Evaluation::where('project_id', $project->project_id)
            ->where('evaluator_id', $request->user()->user_id)
            ->where('evaluator_type', 'examiner')
            ->get();

        return response()->json([
            'project' => $project,
            'evaluations' => $evaluations,
        ]);
    })->whereNumber('project');

    Route::put('/coordinator/request-revision/{project_id}', function (Request $request, $project_id) {
        $roles = $request->user()->roles()->pluck('role_name');
        if (!$roles->contains(fn($r) => strtolower($r) === 'project_coordinator')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $request->validate(['comment' => 'nullable|string']);
        $project = \App\Models\Project::findOrFail($project_id);
        $project->update(['status' => 'revision']);
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

    Route::post('/evaluation/submit', function (Request $request) {
    $user = $request->user();
    $roles = $user->roles()->pluck('role_name')->map(fn($r) => strtolower($r));
    if (!$roles->contains('advisor') && !$roles->contains('examiner')) {
        return response()->json(['message' => 'Unauthorized – Advisor or Examiner role required'], 403);
    }
    if (!$request->student_id && $request->has('project_id')) {
        return response()->json(['message' => 'student_id is required for evaluation'], 422);
    }
    $request->validate([
        'project_id'          => 'required|exists:project,project_id',
        'student_id'          => 'nullable|integer|exists:user,user_id',
        'evaluator_type'      => 'required|in:advisor,examiner',
        'detailed_marks'      => 'nullable|array',
        'student_comments'    => 'nullable|string',
        'coordinator_remarks' => 'nullable|string',
        'submit'              => 'nullable|boolean',
        'feedback_only'       => 'nullable|boolean',
    ]);

    if ($request->evaluator_type === 'advisor' && !$roles->contains('advisor')) {
        return response()->json(['message' => 'You are not an Advisor'], 403);
    }
    if ($request->evaluator_type === 'examiner' && !$roles->contains('examiner')) {
        return response()->json(['message' => 'You are not an Examiner'], 403);
    }

    $status = 'draft';
    $totalMarks = null;
    if ($request->feedback_only) {
        if (empty($request->student_comments)) {
            return response()->json(['message' => 'Student comments are required for feedback.'], 422);
        }
        $status = 'review';
    } elseif ($request->submit) {
        if (empty($request->detailed_marks)) {
            return response()->json(['message' => 'Detailed marks are required for final submission.'], 422);
        }
        $status = 'submitted';
        $totalMarks = array_sum(array_values($request->detailed_marks));
    }

    // ---- PERMANENT FIX: reuse row with NULL student_id if exists ----
    $existing = \App\Models\Evaluation::where('project_id', $request->project_id)
        ->where('evaluator_id', $user->user_id)
        ->where('evaluator_type', $request->evaluator_type)
        ->where(function ($q) use ($request) {
            $q->where('student_id', $request->student_id)
              ->orWhereNull('student_id');
        })
        ->first();

    if ($existing) {
        $existing->update([
            'student_id'          => $request->student_id,
            'detailed_marks'      => $request->detailed_marks ?? [],
            'total_marks'          => $totalMarks,
            'student_comments'     => $request->student_comments,
            'coordinator_remarks'  => $request->coordinator_remarks,
            'status'               => $status,
        ]);
        $evaluation = $existing;
    } else {
        $evaluation = \App\Models\Evaluation::create([
            'project_id'          => $request->project_id,
            'student_id'          => $request->student_id,
            'evaluator_id'        => $user->user_id,
            'evaluator_type'      => $request->evaluator_type,
            'detailed_marks'      => $request->detailed_marks ?? [],
            'total_marks'          => $totalMarks,
            'student_comments'     => $request->student_comments,
            'coordinator_remarks'  => $request->coordinator_remarks,
            'status'               => $status,
        ]);
    }
    // ----------------------------------------------------------------

    $notifyUserId = $request->student_id ?? optional(\App\Models\Project::find($request->project_id))->student_id;

    if ($notifyUserId && in_array($status, ['review', 'submitted'])) {
        $project = \App\Models\Project::find($request->project_id);
        $studentName = $request->student_id ? \App\Models\User::find($request->student_id)->full_name : 'you';
        $msg = $status === 'review'
            ? "Your advisor left feedback for project \"{$project->title}\"."
            : "Your evaluation for project \"{$project->title}\" has been completed. Check your marks.";
        \App\Models\Notification::create([
            'user_id'         => $notifyUserId,
            'message_type'    => 'evaluation',
            'message_content' => $msg,
            'is_read'         => false,
            'sent_at'         => now(),
        ]);
    }

    ActivityLog::create([
        'user_id'    => $user->user_id,
        'action'     => "Submitted " . $request->evaluator_type . " evaluation for project ID " . $request->project_id . ($request->student_id ? " (student ID {$request->student_id})" : ""),
        'ip_address' => $request->ip(),
    ]);

    return response()->json(['message' => 'Evaluation saved', 'evaluation' => $evaluation]);
});

Route::get('/coordinator/evaluations/{project_id}', function (Request $request, $project_id) {
    $roles = $request->user()->roles()->pluck('role_name')->map(fn($r) => strtolower($r));
    if (!$roles->contains('project_coordinator')) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    // 1. Load project with group members and their user info
    $project = \App\Models\Project::with(['group.members.user:user_id,full_name'])->find($project_id);
    if (!$project) {
        return response()->json(['message' => 'Project not found'], 404);
    }

    // 2. Get all evaluations for this project
    $evaluations = \App\Models\Evaluation::where('project_id', $project_id)->get();

    // 3. Group evaluations by student_id
    $evalByStudent = $evaluations->groupBy('student_id');

    // 4. Build result from group members (or fallback to project owner)
    $members = $project->group ? $project->group->members : collect();
    if ($members->isEmpty() && $project->student_id) {
        $members = collect([
            (object)[
                'user_id' => $project->student_id,
                'user' => \App\Models\User::find($project->student_id),
                'student_campus_id' => 'N/A'
            ]
        ]);
    }

    $result = $members->map(function ($member) use ($evalByStudent) {
        $studentId = $member->user_id;
        $studentEvals = $evalByStudent->get($studentId, collect());

        $advisorEval = $studentEvals->where('evaluator_type', 'advisor')->first();
        $examinerEval = $studentEvals->where('evaluator_type', 'examiner')->first();

        $studentName = $member->user->full_name ?? 'Unknown';
        $advisorName = $advisorEval ? (\App\Models\User::find($advisorEval->evaluator_id)->full_name ?? 'N/A') : null;
        $examinerName = $examinerEval ? (\App\Models\User::find($examinerEval->evaluator_id)->full_name ?? 'N/A') : null;

        return [
            'student_id'   => $studentId,
            'student_name' => $studentName,
            'advisor'      => $advisorEval ? [
                'evaluation_id' => $advisorEval->id,
                'evaluator_name'=> $advisorName,
                'total_marks'   => $advisorEval->total_marks,
                'status'        => $advisorEval->status,
            ] : null,
            'examiner'     => $examinerEval ? [
                'evaluation_id' => $examinerEval->id,
                'evaluator_name'=> $examinerName,
                'total_marks'   => $examinerEval->total_marks,
                'status'        => $examinerEval->status,
            ] : null,
        ];
    })->values();

    return response()->json($result);
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

    Route::get('/coordinator/projects-for-examiner-assignment', function (Request $request) {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }
        $roles = $user->roles()->pluck('role_name');
        if (!$roles->contains(fn($r) => strtolower($r) === 'project_coordinator')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        return response()->json(
            \App\Models\Project::where('status', 'approved')
                ->whereNotNull('advisor_id')
                ->where('is_archived', false)
                ->with('student:user_id,full_name')
                ->get()
        );
    });

    Route::middleware(['auth:sanctum'])->group(function () {
        $isSuperAdmin = function (Request $request) {
            $roles = $request->user()->roles()->pluck('role_name');
            return $roles->contains(fn($r) => strtolower($r) === 'super_admin');
        };

        Route::get('/roles', function () {
            return response()->json(\App\Models\Role::all());
        });

        Route::get('/admin/overview', function (Request $request) use ($isSuperAdmin) {
            if (!$isSuperAdmin($request)) return response()->json(['message'=>'Unauthorized'], 403);
            $totalUsers = \App\Models\User::count();
            $totalProjects = \App\Models\Project::count();
            $totalSubmissions = \App\Models\Submission::count();
            return response()->json([
                'total_users' => $totalUsers,
                'total_projects' => $totalProjects,
                'total_submissions' => $totalSubmissions,
            ]);
        });

        Route::get('/admin/users', function (Request $request) use ($isSuperAdmin) {
            if (!$isSuperAdmin($request)) return response()->json(['message'=>'Unauthorized'], 403);
            $users = \App\Models\User::with('roles:role_id,role_name')->get()->map(function($u){
                return [
                   'user_id'   => $u->user_id,
                   'full_name' => $u->full_name,
                   'email'     => $u->email,
                   'status'    => $u->status,
            'department' => $u->department, 
                   'created_at'=> $u->created_at,
                   'updated_at'=> $u->updated_at,

                   
                   'roles'     => $u->roles->pluck('role_name'),
                ];
            });
            return response()->json($users);
        });

        Route::put('/admin/users/{id}/role', function (Request $request, $id) use ($isSuperAdmin) {
            if (!$isSuperAdmin($request)) return response()->json(['message'=>'Unauthorized'], 403);
            $user = \App\Models\User::findOrFail($id);
            $user->roles()->sync($request->roles);
            return response()->json(['message'=>'Roles updated']);
        });

        Route::put('/admin/users/{id}/role', function (Request $request, $id) use ($isSuperAdmin) {
    if (!$isSuperAdmin($request)) return response()->json(['message'=>'Unauthorized'], 403);
    $user = \App\Models\User::findOrFail($id);
    $request->validate(['roles' => 'required|array', 'roles.*' => 'integer|exists:roles,role_id']);
    $user->roles()->sync($request->roles);

    // Log the role change
    ActivityLog::create([
        'user_id'    => $request->user()->user_id,
        'action'     => "Updated roles for user ID {$id} ({$user->full_name})",
        'ip_address' => $request->ip(),
    ]);

    return response()->json(['message'=>'Roles updated']);
});

        Route::put('/admin/users/{id}/deactivate', function (Request $request, $id) use ($isSuperAdmin) {
            if (!$isSuperAdmin($request)) return response()->json(['message'=>'Unauthorized'], 403);
            $user = \App\Models\User::findOrFail($id);
            $user->update(['status' => 'inactive']);
            ActivityLog::create([
                'user_id'    => $request->user()->user_id,
                'action'     => "Deactivated user ID {$id}",
                'ip_address' => $request->ip(),
            ]);
            return response()->json(['message'=>'User deactivated']);
        });

        Route::put('/admin/users/{id}/activate', function (Request $request, $id) use ($isSuperAdmin) {
            if (!$isSuperAdmin($request)) return response()->json(['message'=>'Unauthorized'], 403);
            $user = \App\Models\User::findOrFail($id);
            $user->update(['status' => 'active']);
            ActivityLog::create([
                'user_id'    => $request->user()->user_id,
                'action'     => "Activated user ID {$id}",
                'ip_address' => $request->ip(),
            ]);
            return response()->json(['message'=>'User activated']);
        });

        Route::get('/admin/activity-logs', function (Request $request) use ($isSuperAdmin) {
            if (!$isSuperAdmin($request)) return response()->json(['message'=>'Unauthorized'], 403);
            $logs = \App\Models\ActivityLog::with('user:user_id,full_name')
                ->orderBy('created_at', 'desc')
                ->paginate(50);
            return response()->json($logs);
        });

        Route::get('/admin/notifications', function (Request $request) use ($isSuperAdmin) {
    if (!$isSuperAdmin($request)) return response()->json(['message'=>'Unauthorized'], 403);
    $notifications = \App\Models\Notification::with('user:user_id,full_name')
        ->orderBy('sent_at', 'desc')
        ->paginate(30);
    return response()->json($notifications);
});

        Route::get('/admin/pending-accounts', function (Request $request) use ($isSuperAdmin) {
            if (!$isSuperAdmin($request)) return response()->json(['message' => 'Unauthorized'], 403);
            $pending = \App\Models\User::where('status', 'pending')->get();
            return response()->json($pending);
        });

        Route::put('/admin/approve-account/{id}', function (Request $request, $id) use ($isSuperAdmin) {
            if (!$isSuperAdmin($request)) return response()->json(['message' => 'Unauthorized'], 403);
            $request->validate([
                'password' => 'required|string|min:6',
                'roles'    => 'required|array',
                'roles.*'  => 'integer|exists:roles,role_id',
            ]);
            $user = \App\Models\User::findOrFail($id);
            $user->update([
                'password' => bcrypt($request->password),
                'status'   => 'active',
            ]);
            $user->roles()->sync($request->roles);
            return response()->json([
                'message'  => 'Account approved. Temporary password: ' . $request->password,
                'user'     => $user,
            ]);
        });

        Route::post('/admin/schedules', function (Request $request) use ($isSuperAdmin) {
            if (!$isSuperAdmin($request)) return response()->json(['message'=>'Unauthorized'], 403);
            $validated = $request->validate([
                'title' => 'required|string',
                'deadline' => 'required|date',
            ]);
            $schedule = \App\Models\Schedule::create($validated);
            return response()->json($schedule, 201);
        });

        Route::get('/admin/schedules', function (Request $request) use ($isSuperAdmin) {
            if (!$isSuperAdmin($request)) return response()->json(['message'=>'Unauthorized'], 403);
            return response()->json(\App\Models\Schedule::orderBy('deadline')->get());
        });

        Route::delete('/admin/schedules/{id}', function (Request $request, $id) use ($isSuperAdmin) {
            if (!$isSuperAdmin($request)) return response()->json(['message'=>'Unauthorized'], 403);
            \App\Models\Schedule::findOrFail($id)->delete();
            return response()->json(['message'=>'Schedule deleted']);
        });

        Route::put('/admin/projects/{id}/status', function (Request $request, $id) use ($isSuperAdmin) {
            if (!$isSuperAdmin($request)) return response()->json(['message'=>'Unauthorized'], 403);
            $request->validate(['status' => 'required|in:pending,approved,rejected,revision,submitted']);
            $project = \App\Models\Project::findOrFail($id);
            $project->update(['status' => $request->status]);
            ActivityLog::create([
                'user_id'    => $request->user()->user_id,
                'action'     => "Admin changed project ID {$id} status to {$request->status}",
                'ip_address' => $request->ip(),
            ]);
            return response()->json(['message'=>'Status updated','project'=>$project]);
        });

        Route::put('/admin/projects/{id}/archive', function (Request $request, $id) use ($isSuperAdmin) {
            if (!$isSuperAdmin($request)) return response()->json(['message'=>'Unauthorized'], 403);
            $project = \App\Models\Project::findOrFail($id);
            $project->update(['is_archived' => true]);
            return response()->json(['message'=>'Project archived']);
        });

        Route::get('/admin/archive-projects', function (Request $request) use ($isSuperAdmin) {
            if (!$isSuperAdmin($request)) return response()->json(['message'=>'Unauthorized'], 403);
            $projects = \App\Models\Project::where('is_archived', true)->with('student:user_id,full_name')->get();
            return response()->json($projects);
        });

        // List all existing backups
Route::get('/admin/backups', function (Request $request) use ($isSuperAdmin) {
    if (!$isSuperAdmin($request)) return response()->json(['message'=>'Unauthorized'], 403);
    $backupDir = storage_path('app/backups');
    if (!is_dir($backupDir)) {
        return response()->json([]);
    }
    $files = collect(scandir($backupDir))
        ->filter(fn($f) => $f !== '.' && $f !== '..' && str_ends_with($f, '.zip'))
        ->map(function ($file) use ($backupDir) {
            $path = $backupDir . '/' . $file;
            return [
                'filename' => $file,
                'size' => filesize($path),
                'created_at' => filemtime($path),
            ];
        })
        ->sortByDesc('created_at')
        ->values();
    return response()->json($files);
});

// Create a new backup (database + storage files)
Route::post('/admin/backup', function (Request $request) use ($isSuperAdmin) {
    if (!$isSuperAdmin($request)) return response()->json(['message'=>'Unauthorized'], 403);

    $backupDir = storage_path('app/backups');
    if (!is_dir($backupDir)) {
        mkdir($backupDir, 0755, true);
    }

    $timestamp = now()->format('Y-m-d_H-i-s');
    $zipFileName = "backup-{$timestamp}.zip";
    $zipPath = $backupDir . '/' . $zipFileName;

    // 1. Database dump
    $dbDumpPath = $backupDir . '/temp_db_dump.sql';
    $db = config('database.connections.mysql');
    $command = sprintf(
        'mysqldump --user=%s --password=%s --host=%s %s > %s 2>&1',
        escapeshellarg($db['username']),
        escapeshellarg($db['password']),
        escapeshellarg($db['host']),
        escapeshellarg($db['database']),
        escapeshellarg($dbDumpPath)
    );
    exec($command, $output, $resultCode);
    if ($resultCode !== 0) {
        return response()->json([
            'message' => 'Database dump failed. Check mysqldump availability.',
            'error' => implode("\n", $output),
        ], 500);
    }

    // 2. Create zip containing SQL dump + storage folder
    $zip = new ZipArchive();
    if ($zip->open($zipPath, ZipArchive::CREATE) !== true) {
        unlink($dbDumpPath);
        return response()->json(['message' => 'Could not create ZIP file.'], 500);
    }

    $zip->addFile($dbDumpPath, 'database.sql');
    // Add all storage files (excluding backups themselves)
    $storagePath = storage_path('app/public');
    $files = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($storagePath, RecursiveDirectoryIterator::SKIP_DOTS)
    );
    foreach ($files as $file) {
        $filePath = $file->getRealPath();
        $relativePath = 'storage/' . substr($filePath, strlen($storagePath) + 1);
        $zip->addFile($filePath, $relativePath);
    }
    $zip->close();

    // 3. Cleanup temp dump
    unlink($dbDumpPath);

    // 4. Log
    ActivityLog::create([
        'user_id'    => $request->user()->user_id,
        'action'     => "Created backup {$zipFileName}",
        'ip_address' => $request->ip(),
    ]);

    return response()->json(['message' => 'Backup created successfully.', 'filename' => $zipFileName]);
});

// Download a specific backup
Route::get('/admin/backups/{filename}', function ($filename, Request $request) use ($isSuperAdmin) {
    if (!$isSuperAdmin($request)) return response()->json(['message'=>'Unauthorized'], 403);
    $path = storage_path('app/backups/' . basename($filename));
    if (!file_exists($path)) {
        abort(404);
    }
    return response()->download($path);
})->where('filename', '.*');

        Route::post('/admin/import-users', function (Request $request) use ($isSuperAdmin) {
            if (!$isSuperAdmin($request)) return response()->json(['message' => 'Unauthorized'], 403);

            $request->validate([
                'file' => 'required|file|mimes:csv,txt',
            ]);

            $file = $request->file('file');
            $handle = fopen($file->getRealPath(), 'r');

            $imported = 0;
            $errors = [];
            $row = 1;

            while (($data = fgetcsv($handle, 1000, ',')) !== false) {
                $row++;
                if ($row === 2) continue;

                if (count($data) < 6) {
                    $errors[] = "Row $row: insufficient columns";
                    continue;
                }

                [$full_name, $email, $phone_number, $gender, $department, $role, $year_of_study] = array_pad($data, 7, null);

                if (empty($full_name) || empty($email)) {
                    $errors[] = "Row $row: name and email required";
                    continue;
                }

                if (\App\Models\User::where('email', $email)->exists()) {
                    $errors[] = "Row $row: $email already exists";
                    continue;
                }

                $userData = [
                    'full_name'      => $full_name,
                    'email'          => $email,
                    'password'       => bcrypt('password123'),
                    'phone_number'   => $phone_number,
                    'gender'         => $gender,
                    'department'     => $department,
                    'year_of_study'  => ($role === 'Student') ? $year_of_study : null,
                    'status'         => 'active',
                ];

                $user = \App\Models\User::create($userData);

                $roleModel = \App\Models\Role::where('role_name', $role)->first();
                if ($roleModel) {
                    $user->roles()->attach($roleModel->role_id);
                } else {
                    $errors[] = "Row $row: unknown role '$role'";
                }

                $imported++;
            }

            fclose($handle);
            ActivityLog::create([
                'user_id'    => $request->user()->user_id,
                'action'     => "Imported $imported users via CSV",
                'ip_address' => $request->ip(),
            ]);

            return response()->json([
                'message' => "$imported users imported successfully.",
                'errors'  => $errors,
            ]);
        });
    });

    Route::post('/groups', function (Request $request) {
        $user = $request->user();

        $alreadyInGroup = \App\Models\ProjectGroup::whereHas('members', function ($q) use ($user) {
            $q->where('students.user_id', $user->user_id);
        })->exists();

        if ($alreadyInGroup) {
            return response()->json(['message' => 'You are already in a group.'], 422);
        }

        $request->validate([
            'group_number' => 'nullable|string',
            'members'      => 'required|array',
            'members.*'    => 'string',
        ]);

        $studentIds = [];
        $memberUserIds = [$user->user_id];

        foreach ($request->members as $input) {
            if (is_numeric($input)) {
                $student = \App\Models\Student::where('user_id', (int)$input)->first();
            } else {
                $student = \App\Models\Student::where('student_campus_id', $input)->first();
            }

            if (!$student) {
                return response()->json(['message' => "Student not found: '$input'"], 422);
            }

            $alreadyMember = \App\Models\ProjectGroup::whereHas('members', function ($q) use ($student) {
                $q->where('group_members.student_id', $student->student_id);
            })->exists();

            if ($alreadyMember) {
                return response()->json([
                    'message' => "Student {$input} is already in another group."
                ], 422);
            }

            $studentIds[] = $student->student_id;
            if ($student->user_id !== $user->user_id) {
                $memberUserIds[] = $student->user_id;
            }
        }

        $group = \App\Models\ProjectGroup::create([
            'project_id'   => null,
            'group_number' => $request->group_number,
            'formed_date'  => now(),
        ]);

        $group->members()->attach($studentIds);

        foreach ($memberUserIds as $uid) {
            \App\Models\Notification::create([
                'user_id'         => $uid,
                'message_type'    => 'group',
                'message_content' => "You have been added to group {$group->group_number}.",
                'is_read'         => false,
                'sent_at'         => now(),
            ]);
        }

        return response()->json(
            $group->load('members.user:user_id,full_name'),
            201
        );
    });

    Route::get('/groups', function (Request $request) {
        $user = $request->user();
        $groups = \App\Models\ProjectGroup::whereHas('members', function ($q) use ($user) {
            $q->where('students.user_id', $user->user_id);
        })
        ->with([
            'project:project_id,title',
            'members' => function ($query) {
                $query->with('user:user_id,full_name');
            }
        ])
        ->get();

        return response()->json($groups->map(function ($group) {
            return [
                'group_id'      => $group->group_id,
                'project_id'    => $group->project_id,
                'project_title' => $group->project->title ?? null,
                'group_number'  => $group->group_number,
                'members'       => $group->members->map(function ($member) {
                    return [
                        'student_id' => $member->student_id,
                        'full_name'  => $member->user->full_name ?? 'Unknown',
                    ];
                }),
            ];
        }));
    });

    Route::get('/coordinator/groups', function (Request $request) {
        $roles = $request->user()->roles()->pluck('role_name');
        if (!$roles->contains('Project_Coordinator')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        return response()->json(
            \App\Models\ProjectGroup::with('members.user:user_id,full_name', 'project:project_id,title')->get()
        );
    });

    Route::post('/groups/{group}/add-member', function (Request $request, $groupId) {
        $user = $request->user();
        $group = \App\Models\ProjectGroup::findOrFail($groupId);

        $isMember = $group->members()->where('students.user_id', $user->user_id)->exists();
        if (!$isMember) {
            return response()->json(['message' => 'You are not a member of this group'], 403);
        }

        $request->validate([
            'student_identifier' => 'required|string',
        ]);

        $input = $request->student_identifier;
        if (is_numeric($input)) {
            $student = \App\Models\Student::where('user_id', (int)$input)->first();
        } else {
            $student = \App\Models\Student::where('student_campus_id', $input)->first();
        }

        if (!$student) {
            return response()->json(['message' => 'Student not found'], 404);
        }

        $alreadyInThisGroup = $group->members()->where('students.student_id', $student->student_id)->exists();
        if ($alreadyInThisGroup) {
            return response()->json(['message' => 'Student is already in this group'], 422);
        }

        $alreadyInOtherGroup = \App\Models\ProjectGroup::whereHas('members', function ($q) use ($student) {
            $q->where('group_members.student_id', $student->student_id);
        })->exists();

        if ($alreadyInOtherGroup) {
            return response()->json(['message' => 'Student is already in another group'], 422);
        }

        $group->members()->attach($student->student_id);

        if ($student->user_id) {
            \App\Models\Notification::create([
                'user_id'         => $student->user_id,
                'message_type'    => 'group',
                'message_content' => "You have been added to group {$group->group_number}.",
                'is_read'         => false,
                'sent_at'         => now(),
            ]);
        }

        ActivityLog::create([
            'user_id'    => $user->user_id,
            'action'     => "Added student (user ID {$student->user_id}) to group ID {$group->group_id}",
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Student added to group',
            'member'  => [
                'student_id' => $student->student_id,
                'full_name'  => $student->user->full_name ?? 'Unknown',
                'campus_id'  => $student->student_campus_id ?? 'N/A',
            ],
        ]);
    })->whereNumber('group');

    Route::post('/messages', function (Request $request) {
        $request->validate([
            'message'     => 'required|string',
            'receiver_id' => 'nullable|integer|exists:user,user_id',
            'group_id'    => 'nullable|integer|exists:project_group,group_id',
        ]);

        $msg = \App\Models\Message::create([
            'sender_id'   => $request->user()->user_id,
            'receiver_id' => $request->receiver_id,
            'group_id'    => $request->group_id,
            'message'     => $request->message,
        ]);

        return response()->json($msg, 201);
    });

    Route::get('/groups/{group}/messages', function ($groupId) {
        $messages = \App\Models\Message::where('group_id', $groupId)
            ->with('sender:user_id,full_name')
            ->orderBy('created_at')
            ->get();
        return response()->json($messages);
    });

    Route::get('/messages/direct/{user_id}', function ($userId, Request $request) {
        $myId = $request->user()->user_id;
        $messages = \App\Models\Message::where(function ($q) use ($myId, $userId) {
                $q->where('sender_id', $myId)->where('receiver_id', $userId);
            })->orWhere(function ($q) use ($myId, $userId) {
                $q->where('sender_id', $userId)->where('receiver_id', $myId);
            })->with('sender:user_id,full_name')
            ->orderBy('created_at')
            ->get();
        return response()->json($messages);
    });

    Route::get('/student/contacts', function (Request $request) {
        $user = $request->user();
        $contacts = [];
        $addedUserIds = [];

        $groups = \App\Models\ProjectGroup::whereHas('members', function ($q) use ($user) {
            $q->where('students.user_id', $user->user_id);
        })->with('members.user:user_id,full_name')->get();

        foreach ($groups as $group) {
            foreach ($group->members as $member) {
                if ($member->user && $member->user->user_id !== $user->user_id && !in_array($member->user->user_id, $addedUserIds)) {
                    $contacts[] = [
                        'user_id'   => $member->user->user_id,
                        'full_name' => $member->user->full_name,
                        'type'      => 'teammate',
                    ];
                    $addedUserIds[] = $member->user->user_id;
                }
            }
        }

        $projects = \App\Models\Project::where('student_id', $user->user_id)
            ->whereNotNull('advisor_id')
            ->with('advisor.user:user_id,full_name')
            ->get();

        foreach ($projects as $project) {
            if ($project->advisor && $project->advisor->user) {
                $advisor = $project->advisor->user;
                if (!in_array($advisor->user_id, $addedUserIds)) {
                    $contacts[] = [
                        'user_id'   => $advisor->user_id,
                        'full_name' => $advisor->full_name,
                        'type'      => 'advisor',
                    ];
                    $addedUserIds[] = $advisor->user_id;
                }
            }
        }

        return response()->json($contacts);
    });

    Route::get('/dept-head/projects', function (Request $request) {
    $roles = $request->user()->roles()->pluck('role_name');
    if (!$roles->contains('Department_Head')) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }
    $department = $request->user()->department;

    $projects = \App\Models\Project::whereHas('student', fn($q) => $q->where('department', $department))
        ->with('student:user_id,full_name')
        ->orderBy('project_id', 'desc')
        ->paginate(20);

    $projects->getCollection()->transform(function ($project) {
        $log = \App\Models\ActivityLog::where(function ($query) use ($project) {
            $query->where('action', 'like', "%Changed project ID {$project->project_id} status%")
                  ->orWhere('action', 'like', "%Coordinator {$project->status} project ID {$project->project_id}%");
        })->latest()->first();
        $project->status_updated_by = $log ? ($log->user->full_name ?? 'Unknown') : null;
        return $project;
    });

    return response()->json($projects);
});

   Route::get('/dept-head/projects/{project}', function (Request $request, $project) {
    $roles = $request->user()->roles()->pluck('role_name');
    if (!$roles->contains('Department_Head')) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }
    $department = $request->user()->department;

    $project = \App\Models\Project::where('project_id', $project)
        ->whereHas('student', fn($q) => $q->where('department', $department))
        ->with([
            'student:user_id,full_name,department',
            'group.members.user:user_id,full_name',
            'submissions' => function ($q) {
                $q->orderBy('created_at', 'desc');
            },
        ])
        ->first();

    if (!$project) {
        return response()->json(['message' => 'Project not found in your department'], 404);
    }

    $project->submissions->transform(function ($sub) {
        $sub->file_url = $sub->file_path ? url('storage/' . $sub->file_path) : null;
        return $sub;
    });

    $log = \App\Models\ActivityLog::where(function ($query) use ($project) {
        $query->where('action', 'like', "%Changed project ID {$project->project_id} status%")
              ->orWhere('action', 'like', "%Coordinator {$project->status} project ID {$project->project_id}%");
    })->latest()->first();
    $project->status_updated_by = $log ? ($log->user->full_name ?? 'Unknown') : null;

    return response()->json(['project' => $project]);
})->whereNumber('project');

Route::get('/dept-head/projects/{project}/report', function (Request $request, $project) {
    $roles = $request->user()->roles()->pluck('role_name');
    if (!$roles->contains('Department_Head')) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }
    $department = $request->user()->department;

    $project = \App\Models\Project::where('project_id', $project)
        ->whereHas('student', fn($q) => $q->where('department', $department))
        ->with([
            'student:user_id,full_name',
            'group.members.user:user_id,full_name',
            'submissions',
            'evaluations'   // <-- make sure this relationship exists
        ])
        ->firstOrFail();

    // Format file URLs
    $project->submissions->transform(function ($sub) {
        $sub->file_url = $sub->file_path ? url('storage/' . $sub->file_path) : null;
        return $sub;
    });

    $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('reports.project', compact('project'));
    return $pdf->download("project-{$project->project_id}-report.pdf");
})->whereNumber('project');

Route::put('/dept-head/projects/{project}/archive', function (Request $request, $project) {
    $roles = $request->user()->roles()->pluck('role_name');
    if (!$roles->contains('Department_Head')) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }
    $department = $request->user()->department;

    $project = \App\Models\Project::where('project_id', $project)
        ->whereHas('student', fn($q) => $q->where('department', $department))
        ->firstOrFail();

    $project->update(['is_archived' => true]);

    ActivityLog::create([
        'user_id'    => $request->user()->user_id,
        'action'     => "Department Head archived project ID {$project->project_id}",
        'ip_address' => $request->ip(),
    ]);

    return response()->json(['message' => 'Project archived successfully']);
})->whereNumber('project');
Route::put('/dept-head/projects/{project}/unarchive', function (Request $request, $project) {
    $roles = $request->user()->roles()->pluck('role_name');
    if (!$roles->contains('Department_Head')) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }
    $department = $request->user()->department;

    $project = \App\Models\Project::where('project_id', $project)
        ->whereHas('student', fn($q) => $q->where('department', $department))
        ->firstOrFail();

    $project->update(['is_archived' => false]);

    ActivityLog::create([
        'user_id'    => $request->user()->user_id,
        'action'     => "Department Head unarchived project ID {$project->project_id}",
        'ip_address' => $request->ip(),
    ]);

    return response()->json(['message' => 'Project unarchived successfully']);
})->whereNumber('project');

    Route::get('/dept-head/archive-projects', function (Request $request) {
        $roles = $request->user()->roles()->pluck('role_name');
        if (!$roles->contains('Department_Head')) return response()->json(['message'=>'Unauthorized'], 403);
        $department = $request->user()->department;
        $projects = \App\Models\Project::where('is_archived', true)
            ->whereHas('student', fn($q) => $q->where('department', $department))
            ->with('student:user_id,full_name')
            ->get();
        return response()->json($projects);
    });

  Route::get('/dept-head/evaluations', function (Request $request) {
    $roles = $request->user()->roles()->pluck('role_name');
    if (!$roles->contains('Department_Head')) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }
    $department = $request->user()->department;
    $projectIds = \App\Models\Project::whereHas('student', fn($q) => $q->where('department', $department))
        ->pluck('project_id');

    $evaluations = \App\Models\Evaluation::whereIn('project_id', $projectIds)
        ->where('status', 'forwarded_to_dept_head')
        ->get()
        ->groupBy('student_id')
        ->map(function ($evals, $studentId) {
            $advisor = $evals->where('evaluator_type', 'advisor')->first();
            $examiner = $evals->where('evaluator_type', 'examiner')->first();
            $studentName = $studentId ? (\App\Models\User::find($studentId)->full_name ?? 'Unknown') : 'Unknown';
            return [
                'student_id'    => $studentId,
                'student_name'  => $studentName,
                'advisor_total' => $advisor ? $advisor->total_marks : null,
                'examiner_total'=> $examiner ? $examiner->total_marks : null,
            ];
        })->values();

    return response()->json($evaluations);
});
});