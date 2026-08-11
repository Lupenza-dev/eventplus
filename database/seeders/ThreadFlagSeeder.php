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
            'menu',
            'input',
            'confirm',
            'back',
            'end',
        ];

        foreach ($flags as $flag) {
            ThreadFlag::firstOrCreate(['name' => $flag, 'is_active' => true]);
        }
    }
}
