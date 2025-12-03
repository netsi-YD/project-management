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
        Schema::create('_super__admin', function (Blueprint $table) {
            $table->id('super_admin_id');
$table->foreignId('user_id')
                  ->constrained('user', 'user_id')
                  ->onDelete('cascade');

            $table->dateTime('term_start_date');
            $table->dateTime('term_end_date');

            $table->enum('education_level', ['BSC', 'MSC', 'PHD']);            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('_super__admin');
    }
};
