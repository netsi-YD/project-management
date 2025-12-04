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

    $table->foreignId('user_id')
        ->unique()
        ->constrained('user', 'user_id')
        ->onDelete('cascade');

    $table->string('student_campus_id', 20)->unique();

    $table->foreignId('unit_id')
        ->constrained('_academic__units', 'unit_id')
        ->onDelete('cascade');

    $table->string('major', 100);
    
    $table->year('enrollment_year');

    $table->string('section', 10)->nullable();

    $table->enum('enrollment_status', ['active','graduated','suspended','withdrawn'])
          ->default('active');
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
        Schema::dropIfExists('_students');
    }
};
