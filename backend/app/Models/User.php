<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'user'; 
    protected $primaryKey = 'user_id'; 

    protected $fillable = [
        'full_name',
        'email',
        'password',
        'phone_number',
        'gender',
        'status',
        'institution_id',
        'department',
        'year_of_study',
        'requested_role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Roles relationship
    public function roles()
    {
        return $this->belongsToMany(
            Role::class,
            'user_joins_role',
            'user_id',
            'role_id'
        );
    }
    public function accessRequests()
{
    return $this->hasMany(AccessRequest::class, 'user_id', 'user_id');
}

}
