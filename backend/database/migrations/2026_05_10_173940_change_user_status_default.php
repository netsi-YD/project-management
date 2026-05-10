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
    DB::statement("ALTER TABLE user MODIFY COLUMN status VARCHAR(20) NOT NULL DEFAULT 'pending'");
}

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
{
    DB::statement("ALTER TABLE user MODIFY COLUMN status VARCHAR(20) NOT NULL DEFAULT 'active'");
}
};
