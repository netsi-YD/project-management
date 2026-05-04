<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Advisor extends Model
{
    use HasFactory;
    protected $table = 'advisors';
    protected $primaryKey = 'advisor_id';
    public $timestamps = true;
     protected $fillable = [
        'unit_id',
        'specialization',
        'education_level',
        'office_room',
        'department_id',
        'current_advise_count',
        'project_group_id',
        'user_id',
    ];
}
