<?php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GuestDashboardController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\SubmissionController;
use App\Http\Controllers\AdvisorRequestController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\NotificationController;
use App\Models\Submission;
use Illuminate\Support\Facades\Storage;



Route::get('/guest/projects', [GuestDashboardController::class, 'projects']);
Route::post('/guest/request-access', [GuestDashboardController::class, 'requestAccess']);
Route::get('/guest/access-status', [GuestDashboardController::class, 'status']);
Route::get('/public-projects', [GuestDashboardController::class, 'publicProjects']);

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);
Route::middleware('auth:sanctum')->group(function () {

    // student
    Route::get('/student/profile', [StudentController::class, 'profile']);

    // projects
    Route::post('/projects', [ProjectController::class, 'store']);
    Route::get('/projects', [ProjectController::class, 'index']);

    // submissions
    Route::post('/submit', [SubmissionController::class, 'store']);

    // advisor requests
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

// View advisor requests (advisor's view)
Route::get('/advisor/requests', function (Request $request) {
    $requests = \App\Models\AdvisorRequest::where('advisor_id', $request->user()->user_id)->get();
    return response()->json($requests);
});
// PUT /api/advisor/request/{request_id} – approve or reject
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
Route::post('/comments', [CommentController::class, 'store']);
Route::get('/comments/{project_id}', [CommentController::class, 'index']);

// GET /api/advisors – list all advisors
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
    $request->validate([
        'file' => 'required|file|mimes:txt|max:10240',
    ]);

    // Read uploaded file content (plain text)
    $content = file_get_contents($request->file('file')->getRealPath());

    // Get the current student's previous submissions
    $previousFiles = Submission::where('student_id', $request->user()->user_id)
        ->get()
        ->filter(function ($sub) {
            return \Illuminate\Support\Facades\Storage::disk('public')->exists($sub->file_path);
        })
        ->map(function ($sub) {
            return file_get_contents(storage_path('app/public/' . $sub->file_path));
        })
        ->toArray();

    if (empty($previousFiles)) {
        return response()->json([
            'similarity_percentage' => 0,
            'message' => 'No previous submissions to compare.',
        ]);
    }

    // Helper functions
    function wordCountVector($text) {
        $words = str_word_count(strtolower($text), 1);
        return array_count_values($words);
    }

    function cosineSimilarity($vec1, $vec2) {
        $dot = 0.0;
        $norm1 = 0.0;
        $norm2 = 0.0;
        foreach ($vec1 as $word => $count) {
            $norm1 += $count * $count;
            if (isset($vec2[$word])) {
                $dot += $count * $vec2[$word];
            }
        }
        foreach ($vec2 as $count) {
            $norm2 += $count * $count;
        }
        if ($norm1 == 0 || $norm2 == 0) return 0;
        return $dot / (sqrt($norm1) * sqrt($norm2));
    }

    $currentVec = wordCountVector($content);
    $maxSimilarity = 0;

    foreach ($previousFiles as $prevContent) {
        $prevVec = wordCountVector($prevContent);
        $sim = cosineSimilarity($currentVec, $prevVec);
        if ($sim > $maxSimilarity) {
            $maxSimilarity = $sim;
        }
    }

    $percentage = round($maxSimilarity * 100, 2);

    return response()->json([
        'similarity_percentage' => $percentage,
        'message' => $percentage > 30
            ? 'High similarity detected. Please revise.'
            : 'Similarity is within acceptable range.',
    ]);
});


Route::get('/notifications', [NotificationController::class, 'index']);
Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);

});