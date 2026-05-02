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

// ########################################
// PROTECTED ROUTES (STUDENT / ADVISOR)
// ########################################
Route::middleware('auth:sanctum')->group(function () {

    // ── Student profile ─────────────────────────────
    Route::get('/student/profile', [StudentController::class, 'profile']);

    // ── Projects ────────────────────────────────────
    Route::post('/projects', [ProjectController::class, 'store']);
    Route::get('/projects', [ProjectController::class, 'index']);

    // ── Submissions ─────────────────────────────────
    Route::post('/submit', [SubmissionController::class, 'store']);

    // ── Advisor Requests ────────────────────────────
    Route::post('/advisor/request', function (Request $request) {
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

    // ── AI TITLE SUGGESTIONS (Template‑based, Gemini‑ready) ──
    Route::post('/ai/title-suggestions', function (Request $request) {
        $request->validate(['keyword' => 'required|string']);
        $kw = trim($request->keyword);

        // ★ Use Gemini if the key is set and working; otherwise fall back to templates ★
        if (env('GEMINI_API_KEY')) {
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
            ])->post(
                'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' . env('GEMINI_API_KEY'),
                [
                    'contents' => [
                        [
                            'parts' => [
                                ['text' => "Suggest 10 unique final-year project titles about \"$kw\". Respond ONLY with a JSON array of strings, no other text. Example: [\"Title 1\", \"Title 2\"]"]
                            ]
                        ]
                    ]
                ]
            );

            // If Gemini succeeds, return its suggestions
            if ($response->successful()) {
                $data = $response->json();
                $text = $data['candidates'][0]['content']['parts'][0]['text'] ?? '[]';
                $suggestions = json_decode($text, true);
                if (is_array($suggestions)) {
                    return response()->json(['suggestions' => $suggestions]);
                }
            }
            // If Gemini fails, continue to template fallback
        }

        // Template fallback (30 academic templates)
        $templates = [
            "An AI-powered system for $kw",
            "A deep learning approach to $kw",
            "Smart solutions using $kw",
            "Predictive modeling for $kw",
            "Real-time $kw monitoring system",
            "IoT-enabled $kw platform",
            "Data-driven $kw analysis tool",
            "Cloud-based $kw management system",
            "Mobile application for $kw",
            "A framework for $kw optimization",
            "Intelligent $kw: opportunities and challenges",
            "$kw using blockchain technology",
            "Enhancing $kw with machine learning",
            "Scalable $kw architecture",
            "$kw: a comparative study",
            "Security and privacy in $kw systems",
            "Automated $kw detection and response",
            "The future of $kw in education",
            "Wearable $kw devices",
            "Big data analytics for $kw",
            "$kw recommendation engine",
            "Edge computing for $kw",
            "Federated learning applied to $kw",
            "Explainable AI in $kw",
            "Multi-agent systems for $kw",
            "Digital twin of $kw process",
            "Swarm intelligence for $kw",
            "Self-healing $kw infrastructure",
            "Ethical implications of $kw",
            "$kw in resource-constrained environments",
        ];

        $templates = array_filter($templates, function ($t) use ($kw) {
            return strpos($t, "$kw-based $kw") === false && strpos($t, "$kw $kw") === false;
        });
        $templates = array_values($templates);
        shuffle($templates);
        $suggestions = array_slice($templates, 0, 10);

        return response()->json(['suggestions' => $suggestions]);
    });

    // ── Notifications ────────────────────────────────
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);

});