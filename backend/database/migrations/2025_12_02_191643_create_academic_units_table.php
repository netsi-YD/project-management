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
        Schema::create('_academic__units', function (Blueprint $table) {
           $table->id('unit_id'); 

            $table->string('unit_name', 100)->unique();
            $table->enum('unit_type', ['school', 'faculty', 'college', 'institute']);

            $table->foreignId('dean_id')
                  ->constrained('user', 'user_id')
                  ->onDelete('cascade');

            $table->string('unit_phone', 50)->unique()->nullable();
            $table->string('unit_email', 50)->unique()->nullable();
            $table->string('unit_website', 150)->nullable();

            $table->year('establishment_year');

            $table->enum('status', ['active', 'inactive'])->default('active');

            $table->foreignId('super_admin_id')
                  ->constrained('_super__admin', 'super_admin_id')
                  ->onDelete('cascade');

            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('_academic__units');
    }
};
