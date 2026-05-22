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
    Schema::create('examiner_project', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('examiner_id');
        $table->unsignedBigInteger('project_id');
        $table->foreign('examiner_id')->references('examiner_id')->on('examiners')->cascadeOnDelete();
        $table->foreign('project_id')->references('project_id')->on('project')->cascadeOnDelete();
        $table->unique(['examiner_id', 'project_id']);
        $table->timestamps();
    });
}



    /**
     * Reverse the migrations.
     *
     * @return void
     */
   public function down()
{
    Schema::dropIfExists('examiner_project');
}
};
