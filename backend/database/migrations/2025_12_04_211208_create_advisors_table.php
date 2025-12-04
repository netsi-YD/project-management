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
        Schema::create('advisors', function (Blueprint $table) {
            $table->id('advisor_id'); 

            $table->unsignedBigInteger('unit_id'); 
            $table->string('specialization', 100); 

            $table->enum('education_level', ['BSC', 'MSC', 'PHD']); 

            $table->string('office_room', 20)->nullable(); 

            $table->unsignedBigInteger('department_id'); 

            $table->integer('current_advise_count')
                  ->default(0)
                  ->check('current_advise_count >= 0'); 

            $table->unsignedBigInteger('project_group_id'); 
           
            $table->foreign('unit_id')
                  ->references('unit_id')
                  ->on('academic_units')
                  ->onDelete('cascade');

            $table->foreign('department_id')
                  ->references('department_id')
                  ->on('departments')
                  ->onDelete('cascade');

            $table->foreign('project_group_id')
                  ->references('group_id')
                  ->on('project_group')
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
        Schema::dropIfExists('advisors');
    }
};
