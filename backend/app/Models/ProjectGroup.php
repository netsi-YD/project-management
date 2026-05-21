<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectGroup extends Model
{
    protected $table = 'project_group';
    protected $primaryKey = 'group_id';
    protected $fillable = ['project_id', 'group_number', 'formed_date'];

    public function members()
{
    return $this->belongsToMany(Student::class, 'group_members', 'group_id', 'student_id', 'group_id', 'student_id');
}
    public function project()
    {
        return $this->belongsTo(Project::class, 'project_id', 'project_id');
    }

    public function messages()
    {
        return $this->hasMany(Message::class, 'group_id', 'group_id');
    }
}