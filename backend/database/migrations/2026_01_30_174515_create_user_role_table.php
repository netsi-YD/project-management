<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_joins_role', function (Blueprint $table) {
    $table->id();

    $table->unsignedBigInteger('user_id');
    $table->unsignedBigInteger('role_id');

    $table->foreign('user_id')
          ->references('user_id')
          ->on('user')
          ->onDelete('cascade');

    $table->foreign('role_id')
          ->references('role_id')   
          ->on('roles')
          ->onDelete('cascade');

    $table->timestamps();
});

    }

    public function down(): void
    {
        Schema::dropIfExists('user_joins_role');
    }
};
