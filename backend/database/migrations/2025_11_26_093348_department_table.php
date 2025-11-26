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
        Schema::create('department_table', function (Blueprint $table) {
            $table->id('department_id');
            $table->string('department_name',100);
            $table->unsignedBigInteger('college_id')->nullable();
            $table->unsignedBigInteger('head_id')->nullable();
            $table->text('description')->nullable();
            $table->timestamp('crated_at')->usecurrent();
            $table->foreign('college_id')->references('college_id')->on('collges')->onDelete('set null');
            $table->foreign('head_id')->references('user_id')->on('users')->onDelete('set null');
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
        Schema::dropIfExists('department_table');
    }
};
