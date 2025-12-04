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
        if (Schema::hasTable('_academic__units')) {
            Schema::rename('_academic__units', 'academic_units');
        }
        if (Schema::hasTable('_advisor')) {
            Schema::rename('_advisor', 'advisors');
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        if (Schema::hasTable('academic_units')) {
            Schema::rename('academic_units', '_academic__units');
        }

        if (Schema::hasTable('advisors')) {
            Schema::rename('advisors', '_advisor');
        }
    }
};
