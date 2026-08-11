<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('threads', function (Blueprint $table) {
            $table->id();
            $table->text('title_eng');
            $table->text('title_sw');
            $table->string('step');
            $table->string('flag')->nullable();
            $table->string('thread_type');
            $table->boolean('back_status')->default(false);
            $table->boolean('close_thread')->default(false);
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->uuid();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('threads');
    }
};
