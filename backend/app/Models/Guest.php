<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Guest extends Model
{
    protected $table = 'guests';

    protected $primaryKey = 'guest_id';

    public $timestamps = false;

    protected $fillable = [
        'visit_reason',
        'expiry_date',
        'organization',
        'privileges',
    ];
}
