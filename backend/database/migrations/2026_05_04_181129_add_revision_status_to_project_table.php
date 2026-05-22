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
        Schema::table('project', function (Blueprint $table) {
            //
        });
        DB::statement("ALTER TABLE project MODIFY COLUMN status ENUM('pending','approved','rejected','submitted','revision') NOT NULL DEFAULT 'pending'");
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('project', function (Blueprint $table) {
            //
        });
        DB::statement("ALTER TABLE project MODIFY COLUMN status ENUM('pending','approved','rejected','submitted') NOT NULL DEFAULT 'pending'");
    }
};
