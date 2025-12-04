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
        Schema::create('discussion', function (Blueprint $table) {
            $table->id('discussion_id');

$table->unsignedBigInteger('project_id');
$table->unsignedBigInteger('sender_id');

$table->string('message_content', 255);
$table->dateTime('time_sent_at')->default(DB::raw('CURRENT_TIMESTAMP'));


$table->foreign('project_id')
      ->references('project_id')->on('project')
      ->onDelete('cascade');

$table->foreign('sender_id')
      ->references('user_id')->on('user')
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
        Schema::dropIfExists('discussion');
    }
};
