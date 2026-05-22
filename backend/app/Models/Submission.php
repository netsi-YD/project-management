<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Submission extends Model
{
    public function project()
{
    return $this->belongsTo(Project::class, 'project_id', 'project_id');
}
    use HasFactory;
    protected $fillable = ['project_id', 'student_id', 'file_path', 'type'];
}
