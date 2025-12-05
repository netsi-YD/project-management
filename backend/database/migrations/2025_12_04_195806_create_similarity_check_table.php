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
        Schema::create('similarity_check', function (Blueprint $table) {
            $table->id('check_id');
            $table->unsignedBigInteger('project_id'); 

            $table->integer('similarity_percentage')
                  ->check('similarity_percentage >= 0 AND similarity_percentage <= 100'); 

            $table->dateTime('checking_date')->default(DB::raw('CURRENT_TIMESTAMP'));

           
            $table->foreign('project_id')
                  ->references('project_id')
                  ->on('project')
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
        Schema::dropIfExists('similarity_check');
    }
};
