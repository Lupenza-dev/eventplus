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
        Schema::create('ticket_purchases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->foreignId('event_ticket_id')->constrained()->cascadeOnDelete();
            $table->foreignId('payment_partner_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('email');
            $table->string('phone_number');
            $table->decimal('amount', 12, 2);
            $table->string('status')->default('pending');
            $table->softDeletes();
            $table->uuid();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ticket_purchases');
    }
};
