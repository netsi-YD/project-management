<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    protected $table = 'students';
    protected $primaryKey = 'student_id';
protected $fillable = [
    'user_id',
    'student_campus_id',
    'unit_id',
    'major',
    'enrollment_year',
    'section',
    'enrollement_status',
];
public function user()
{
    return $this->belongsTo(User::class, 'user_id', 'user_id');
}
    }