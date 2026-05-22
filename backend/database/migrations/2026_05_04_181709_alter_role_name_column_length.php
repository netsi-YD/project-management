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
    DB::statement("ALTER TABLE roles MODIFY COLUMN role_name VARCHAR(20) NOT NULL");
}

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
{
    DB::statement("ALTER TABLE roles MODIFY COLUMN role_name VARCHAR(10) NOT NULL");
}
};
