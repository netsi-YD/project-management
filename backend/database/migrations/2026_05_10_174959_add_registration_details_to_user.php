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
    Schema::table('user', function (Blueprint $table) {
        $table->string('institution_id')->nullable()->after('email');
        $table->string('department')->nullable()->after('gender');
        $table->string('year_of_study')->nullable()->after('department');
        $table->string('requested_role')->nullable()->after('year_of_study');
    });
}

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
    Schema::table('user', function (Blueprint $table) {
        $table->dropColumn(['institution_id', 'department', 'year_of_study', 'requested_role']);
    });
    }
};
