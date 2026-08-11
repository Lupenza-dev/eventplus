<?php

namespace Database\Factories;

use App\Models\Thread;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Thread>
 */
class ThreadFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title_eng' => fake()->sentence(3),
            'title_sw' => fake()->sentence(3),
            'step' => '1',
            'flag' => 'menu',
            'thread_type' => 'text',
            'back_status' => false,
            'close_thread' => false,
            'user_id' => User::factory(),
        ];
    }
}
