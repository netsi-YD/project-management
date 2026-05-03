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
    Schema::create('advisor_requests', function (Blueprint $table) {
        $table->id('request_id');
        $table->unsignedBigInteger('student_id');
        $table->unsignedBigInteger('advisor_id');
        $table->string('status')->default('pending');
        $table->text('message')->nullable();
        $table->timestamps();

        $table->foreign('student_id')
              ->references('user_id')->on('user')
              ->cascadeOnDelete();
        $table->foreign('advisor_id')
              ->references('advisor_id')->on('advisors')
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
        Schema::dropIfExists('advisor_requests');
    }
};
