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
        Schema::create('notifications', function (Blueprint $table) {
            $table->id('notification_id');
             $table->unsignedBigInteger('user_id');           // FK -> users table
            $table->string('message_content', 255)->notNull();
            $table->string('message_type', 255)->notNull();
            $table->boolean('is_read')->default(false);
            $table->dateTime('sent_at')->default(DB::raw('CURRENT_TIMESTAMP'));

           
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
        Schema::dropIfExists('notifications');
    }
};
