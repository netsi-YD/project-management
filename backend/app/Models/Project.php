<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;
    protected $table = 'project';
    protected $primaryKey = 'project_id'; 
    public $timestamps = false;

    protected $fillable = [
    'title',
    'description',
    'student_id',
    'advisor_id',
    'department_id',
    'status',
    'submission_date',
    'similarity_score',
    'deadline',
    'is_delay_notified',
];
}
