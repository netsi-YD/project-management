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
        Schema::create('super_admin', function (Blueprint $table) {
            $table->id('super_admin_id');
            $table->foreignId('user_id')->constrained('user', 'user_id')->onDelete('cascade');                     $table->dateTime('term_start_date')->nullable(false);
            $table->dateTime('term_end_date')->nullable(false);
            $table->enum('education_level', ['BSC', 'MSC', 'PHD'])->nullable(false);
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
        Schema::dropIfExists('super_admin');
    }
};