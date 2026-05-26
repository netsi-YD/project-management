<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Examiner extends Model
{
    use HasFactory;

    protected $table = 'examiners';
protected $primaryKey = 'examiner_id';
public $timestamps = false;
    protected $fillable = [
        'examiner_id',
        'user_id',
        'unit_id',
        'expertise_area',
        'examiner_role',
        'assigned_departments',
        'education_level',
        'project_group_id',


    ];
    public function user()
{
    return $this->belongsTo(\App\Models\User::class, 'user_id');
}
}
