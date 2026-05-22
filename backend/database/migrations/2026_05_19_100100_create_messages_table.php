<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('messages', function (Blueprint $table) {
    $table->id();
    $table->unsignedBigInteger('sender_id');
    $table->unsignedBigInteger('receiver_id')->nullable();   // direct message
    $table->unsignedBigInteger('group_id')->nullable();      // group message
    $table->text('message');
    $table->timestamps();

    $table->foreign('sender_id')->references('user_id')->on('user')->cascadeOnDelete();
    $table->foreign('receiver_id')->references('user_id')->on('user')->cascadeOnDelete();
    $table->foreign('group_id')->references('group_id')->on('project_group')->cascadeOnDelete();   // note: project_group (singular)
});
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('messages');
    }
};
