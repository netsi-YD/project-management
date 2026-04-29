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
       Schema::create('comments', function (Blueprint $table) {
    $table->id('comment_id');
    $table->unsignedBigInteger('project_id');
    $table->unsignedBigInteger('user_id'); // comment author
    $table->text('body');
    $table->timestamps();

    $table->foreign('project_id')->references('project_id')->on('project')->cascadeOnDelete();
    $table->foreign('user_id')->references('user_id')->on('user')->cascadeOnDelete();
});
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('comments');
    }
};
