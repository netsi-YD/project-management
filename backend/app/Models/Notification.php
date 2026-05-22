<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;
     protected $table = 'notifications';
    protected $primaryKey = 'notification_id';
    protected $fillable = [
        'user_id',
        'message_content',
        'message_type',
        'is_read',
        'sent_at',
    ];
    public function user()
{
    return $this->belongsTo(\App\Models\User::class, 'user_id');
}
}
