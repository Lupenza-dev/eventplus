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
        Schema::create('response_thread_links', function (Blueprint $table) {
            $table->id();
            $table->integer('thread_response_id');
            $table->integer('thread_id');
            $table->integer('user_id');
            $table->uuid();
            $table->timestamps();
            $table->softDeletes();

            // $table->foreign('user_id')->references('id')->on('users');
            // $table->foreign('thread_id')->references('id')->on('threads');
            // $table->foreign('thread_response_id')->references('id')->on('thread_responses');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('response_thread_links');
    }
};
