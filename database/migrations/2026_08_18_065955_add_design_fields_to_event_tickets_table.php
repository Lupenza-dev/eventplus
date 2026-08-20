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
        Schema::table('event_tickets', function (Blueprint $table) {
            $table->string('design_image')->nullable()->after('description');
            $table->decimal('qr_code_x', 5, 2)->default(62)->after('design_image');
            $table->decimal('qr_code_y', 5, 2)->default(58)->after('qr_code_x');
            $table->decimal('qr_code_width', 5, 2)->default(24)->after('qr_code_y');
            $table->decimal('qr_code_height', 5, 2)->default(24)->after('qr_code_width');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('event_tickets', function (Blueprint $table) {
            $table->dropColumn([
                'design_image',
                'qr_code_x',
                'qr_code_y',
                'qr_code_width',
                'qr_code_height',
            ]);
        });
    }
};
