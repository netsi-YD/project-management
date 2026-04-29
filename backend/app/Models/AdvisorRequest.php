<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdvisorRequest extends Model
{
    use HasFactory;
    protected $table = 'advisor_requests';
protected $primaryKey = 'request_id';
protected $fillable = ['student_id', 'advisor_id', 'status', 'message'];
}
