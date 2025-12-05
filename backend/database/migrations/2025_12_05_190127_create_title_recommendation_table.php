<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB; 

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('title_recommendation', function (Blueprint $table) {
            $table->id('recommendation_id'); 

            $table->unsignedBigInteger('student_id');
            $table->unsignedBigInteger('advisor_id');

            $table->foreign('student_id')
                  ->references('student_id')->on('students')
                  ->onDelete('cascade');

            $table->foreign('advisor_id')
                  ->references('advisor_id')->on('advisors')
                  ->onDelete('cascade');

            $table->string('status')->default('PENDING');
            $table->dateTime('sent_at')->default(DB::raw('CURRENT_TIMESTAMP'));

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
        Schema::dropIfExists('title_recommendation');
    }
};
