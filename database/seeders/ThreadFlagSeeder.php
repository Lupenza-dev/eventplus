<?php

namespace Database\Seeders;

use App\Models\ThreadFlag;
use Illuminate\Database\Seeder;

class ThreadFlagSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $flags = [
            'no flag',
            'eventCategories',
            'eventByCategory',
            'eventTickets',
            'paymentMethods',
            'orderSummary',
            'ticketGeneration',
        ];

        foreach ($flags as $flag) {
            ThreadFlag::firstOrCreate(['name' => $flag, 'is_active' => true]);
        }
    }
}
