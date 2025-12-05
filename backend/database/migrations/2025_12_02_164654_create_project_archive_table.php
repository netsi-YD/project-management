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
        Schema::create('project_archive', function (Blueprint $table) {
            $table->id('archive_id');
$table->foreignId('project_id')
                  ->constrained('project', 'project_id')
                  ->onDelete('cascade');

            $table->foreignId('archived_by')
                  ->constrained('user', 'user_id')
                  ->onDelete('cascade');

            $table->dateTime('archived_date')
                  ->default(DB::raw('CURRENT_TIMESTAMP'));

            $table->enum('visibility', ['public', 'private'])
                  ->default('private');
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
        Schema::dropIfExists('project_archive');
    }
};
