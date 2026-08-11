<?php

namespace Database\Seeders;

use App\Models\ThreadType;
use Illuminate\Database\Seeder;

class ThreadTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $types = [
            'address_message',
            'audio',
            'contacts',
            'document',
            'image',
            'interactive',
            'list',
            'location',
            'reaction',
            'sticker',
            'text',
            'video',
        ];

        foreach ($types as $type) {
            ThreadType::firstOrCreate(['name' => $type, 'is_active' => true]);
        }
    }
}
