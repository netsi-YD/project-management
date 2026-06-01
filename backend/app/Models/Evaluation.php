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
    'total_marks', 'student_comments', 'coordinator_remarks', 'status',
    'student_id',
];
protected $casts = [
    'detailed_marks' => 'array',
];
public function evaluator() { return $this->belongsTo(\App\Models\User::class, 'evaluator_id'); }
public function student()  { return $this->belongsTo(\App\Models\User::class, 'student_id'); }
}
