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
    Schema::create('submissions', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('project_id');
        $table->unsignedBigInteger('student_id');
        $table->string('file_path');
        $table->string('type'); // proposal, report, final
        $table->timestamps();

        $table->foreign('project_id')
              ->references('project_id')
              ->on('project')
              ->cascadeOnDelete();
        $table->foreign('student_id')
              ->references('user_id')
              ->on('user')
              ->cascadeOnDelete();
    });
}
    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('submissions');
    }
};
