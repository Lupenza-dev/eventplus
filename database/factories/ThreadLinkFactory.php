<?php

namespace Database\Factories;

use App\Models\Thread;
use App\Models\ThreadLink;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ThreadLink>
 */
class ThreadLinkFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'thread_id' => Thread::factory(),
            'linked_thread_id' => Thread::factory(),
            'user_id' => User::factory(),
        ];
    }
}
