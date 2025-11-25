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
        Schema::create('project', function (Blueprint $table) {
            $table->id('project_id');
            $table->string('title', 150)->notNullable();
            $table->text('description')->nullable();

            // Foreign Keys
            $table->unsignedBigInteger('student_id');
            $table->unsignedBigInteger('advisor_id');
            $table->unsignedBigInteger('department_id');

            $table->dateTime('submission_date')->notNullable();

            $table->enum('status', [
                'pending',
                'approved',
                'rejected',
                'submitted',
                'evaluated'
            ])->default('pending');

            $table->decimal('similarity_score', 5, 2)
                ->default(0.00);
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
        Schema::dropIfExists('project');
    }
};
