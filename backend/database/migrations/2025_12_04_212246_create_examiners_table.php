<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('examiners', function (Blueprint $table) {

            $table->id('examiner_id');

            $table->unsignedBigInteger('unit_id');

            $table->string('expertise_area', 255);

            $table->enum('examiner_role', ['internal', 'external']);

            $table->string('assigned_departments', 255);

            $table->enum('education_level', ['BSC', 'MSC', 'PHD']);

            $table->unsignedBigInteger('project_group_id');

            $table->foreign('unit_id')
                  ->references('unit_id')
                  ->on('academic_units')
                  ->onDelete('cascade');

            $table->foreign('project_group_id')
                  ->references('group_id')
                  ->on('project_group')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('examiners');
    }
};
