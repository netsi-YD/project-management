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

$table->foreignId('project_id')
      ->constrained('project', 'project_id')
      ->onDelete('cascade');

$table->foreignId('given_by')
      ->constrained('user', 'user_id')
      ->onDelete('cascade');

$table->string('comment', 100);

$table->dateTime('feedback_date')
      ->default(DB::raw('CURRENT_TIMESTAMP'));

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
