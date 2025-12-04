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
        Schema::create('students', function (Blueprint $table) {
            $table->id('student_id');

            $table->string('student_campus_id', 20)->unique();

            $table->unsignedBigInteger('unit_id'); 

            $table->string('major', 100);
            $table->string('enrollment_year', 9);

            $table->string('section', 10)->nullable(); 

            $table->enum('enrollement_status', ['active', 'graduated', 'suspended', 'withdrawn'])
                  ->default('active'); 

            
            $table->foreign('unit_id')
                  ->references('unit_id')
                  ->on('academic_units')
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
        Schema::dropIfExists('students');
    }
};
