<?php

namespace Database\Factories;

use App\Models\Thread;
use App\Models\ThreadResponse;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ThreadResponse>
 */
class ThreadResponseFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name_eng' => fake()->word(),
            'name_sw' => fake()->word(),
            'order_no' => (string) fake()->numberBetween(1, 10),
            'thread_id' => Thread::factory(),
            'user_id' => User::factory(),
        ];
    }
}
