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
        Schema::create('advisor_assignment', function (Blueprint $table) {
            $table->id('advisor_assignment_id'); 

            $table->unsignedBigInteger('student_id');   
            $table->unsignedBigInteger('advisor_id');  

            $table->dateTime('assigned_date')
                  ->default(DB::raw('CURRENT_TIMESTAMP')); 

            
            $table->foreign('student_id')
                  ->references('student_id')
                  ->on('students')
                  ->onDelete('cascade');

            $table->foreign('advisor_id')
                  ->references('advisor_id')
                  ->on('advisors')
                  ->onDelete('cascade');
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
        Schema::dropIfExists('advisor_assignment');
    }
};
