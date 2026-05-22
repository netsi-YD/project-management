<!DOCTYPE html>
<html>
<head>
    <title>Project Report – {{ $project->title }}</title>
    <style>
        body { font-family: sans-serif; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ccc; padding: 6px; text-align: left; }
    </style>
</head>
<body>
    <h1>{{ $project->title }}</h1>
    <p><strong>Student:</strong> {{ $project->student->full_name }}</p>
    <p><strong>Status:</strong> {{ $project->status }}</p>

    @if($project->group)
        <p><strong>Group Members:</strong>
            {{ $project->group->members->pluck('user.full_name')->join(', ') }}
        </p>
    @endif

    <h2>Submissions</h2>
    <ul>
        @forelse($project->submissions as $sub)
            <li>{{ $sub->type }} – {{ $sub->created_at->format('Y-m-d') }}</li>
        @empty
            <li>None</li>
        @endforelse
    </ul>

    <h2>Evaluations</h2>
    @php
        $advisor = $project->evaluations->where('evaluator_type','advisor')->first();
        $examiner = $project->evaluations->where('evaluator_type','examiner')->first();
    @endphp
    <p>Advisor total: {{ $advisor->total_marks ?? 'N/A' }}</p>
    <p>Examiner total: {{ $examiner->total_marks ?? 'N/A' }}</p>
</body>
</html>