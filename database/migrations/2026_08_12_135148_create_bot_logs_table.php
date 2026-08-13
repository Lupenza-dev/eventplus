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
        Schema::create('bot_logs', function (Blueprint $table) {
            $table->id();
            $table->string('phone_number');
            $table->string('message_id')->nullable();
            $table->text('text')->nullable();
            $table->integer('reply_id')->nullable();
            $table->integer('thread_id')->nullable();
            $table->string('step')->nullable();
            $table->string('type')->nullable();
            $table->string('status')->default('OPEN')->comment('OPEN and CLOSE');
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
        Schema::dropIfExists('bot_logs');
    }
};
