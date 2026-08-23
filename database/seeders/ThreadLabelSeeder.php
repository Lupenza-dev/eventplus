<?php

namespace Database\Seeders;

use App\Models\ThreadLabel;
use Illuminate\Database\Seeder;

class ThreadLabelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $labels = [
            'welcome',
            'event_type',
            'event_category',
            'event_name',
            'ticket_no',
            'order_summary',
            'payment_method',
            'phone_number',
        ];

        foreach ($labels as $label) {
            ThreadLabel::firstOrCreate([
                'name' => $label,
                'is_active' => true,
            ]);
        }
    }
}
