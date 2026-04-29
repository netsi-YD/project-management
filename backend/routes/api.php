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

Route::get('/notifications', [NotificationController::class, 'index']);
Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);

});