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
        Schema::create('project_group', function (Blueprint $table) {
            $table->id('group_id');
            $table->unsignedBigInteger('project_id'); 
            
            $table->date('formed_date'); 
            
            $table->string('group_number', 20)->unique(); 
         
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
        Schema::dropIfExists('project_group');
    }
};
