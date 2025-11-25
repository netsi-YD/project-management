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
        Schema::create('user', function (Blueprint $table) {
            $table->id('user_id'); 
            $table->string('full_name', 50); 
            $table->string('email', 100)->nullable(false); 
            $table->string('password', 255); 


            $table->string('phone_number', 20)->unique()->nullable(); 

            $table->enum('gender', ['Male', 'Female']); 

            $table->enum('status', ['active', 'inactive'])
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
        Schema::dropIfExists('user');
    }
};
