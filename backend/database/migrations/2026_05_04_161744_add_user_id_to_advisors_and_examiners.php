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
    Schema::table('advisors', function (Blueprint $table) {
        $table->unsignedBigInteger('user_id')->nullable()->after('advisor_id');
        $table->foreign('user_id')->references('user_id')->on('user')->cascadeOnDelete();
    });

    Schema::table('examiners', function (Blueprint $table) {
        $table->unsignedBigInteger('user_id')->nullable()->after('examiner_id');
        $table->foreign('user_id')->references('user_id')->on('user')->cascadeOnDelete();
    });
}

    /**
     * Reverse the migrations.
     *
     * @return void
     */
   public function down()
{
    Schema::table('advisors', function (Blueprint $table) {
        $table->dropForeign(['user_id']);
        $table->dropColumn('user_id');
    });
    Schema::table('examiners', function (Blueprint $table) {
        $table->dropForeign(['user_id']);
        $table->dropColumn('user_id');
    });
}
};
