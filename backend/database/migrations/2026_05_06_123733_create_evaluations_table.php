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
        {
    Schema::create('evaluations', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('project_id');
        $table->unsignedBigInteger('evaluator_id');          // user_id of the advisor/examiner
        $table->string('evaluator_type');                    // 'advisor' or 'examiner'
        $table->json('detailed_marks');                      // {"attendance":5,"document_prep":10,...}
        $table->decimal('total_marks', 5, 2)->nullable();
        $table->text('student_comments')->nullable();        // feedback for student
        $table->text('coordinator_remarks')->nullable();     // general remark for coordinator
        $table->string('status')->default('draft');          // draft, submitted, forwarded_to_dept_head
        $table->timestamps();

        $table->foreign('project_id')->references('project_id')->on('project')->onDelete('cascade');
        $table->foreign('evaluator_id')->references('user_id')->on('user')->onDelete('cascade');
    });
}
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('evaluations');
    }
};
