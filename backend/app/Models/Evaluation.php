<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Evaluation extends Model
{
    use HasFactory;
    protected $table = 'evaluations';
protected $fillable = [
    'project_id', 'evaluator_id', 'evaluator_type', 'detailed_marks',
    'total_marks', 'student_comments', 'coordinator_remarks', 'status'
];
protected $casts = [
    'detailed_marks' => 'array',
];
}
