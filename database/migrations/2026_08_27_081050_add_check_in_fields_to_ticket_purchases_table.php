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
        Schema::table('ticket_purchases', function (Blueprint $table) {
            $table->boolean('checked_in')->default(false)->index()->after('status');
            $table->timestamp('checked_in_at')->nullable()->index()->after('checked_in');
            $table->foreignId('checked_in_by')->nullable()->constrained('users')->nullOnDelete()->after('checked_in_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ticket_purchases', function (Blueprint $table) {
            $table->dropConstrainedForeignId('checked_in_by');
            $table->dropIndex(['checked_in_at']);
            $table->dropIndex(['checked_in']);
            $table->dropColumn(['checked_in_at', 'checked_in']);
        });
    }
};
