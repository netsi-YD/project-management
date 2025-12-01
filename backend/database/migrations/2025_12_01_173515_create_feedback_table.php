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
        Schema::create('feedback', function (Blueprint $table) {
            $table->id('feedback_id');
            $table->Integer('project_id');
            $table->Integer('given_by');
            $table->string('comment',100);
            $table->dateTime('feedback_date')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->foreign('project_id')->references('id')->on('project')->onDelete('cascade');
            $table->foreign('given_by')->references('id')->on('user')->onDelete('cascade');
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
        Schema::dropIfExists('feedback');
    }
};
