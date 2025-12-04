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
        Schema::create('departments', function (Blueprint $table) {
            $table->id('department_id');
            $table->string('department_name', 100)->notNullable(); 

            $table->unsignedBigInteger('unit_id'); 
            $table->unsignedBigInteger('user_id'); 

            $table->text('description')->nullable(); 

            $table->foreign('unit_id')
                  ->references('unit_id')
                  ->on('academic_units')
                  ->onDelete('cascade');

            $table->foreign('user_id')
                  ->references('user_id')
                  ->on('user')
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
        Schema::dropIfExists('departments');
    }
};
