<?php

namespace Database\Factories;

use App\Models\BotLog;
use App\Models\Thread;
use App\Models\ThreadResponse;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BotLog>
 */
class BotLogFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'phone_number' => fake()->e164PhoneNumber(),
            'message_id' => fake()->uuid(),
            'text' => fake()->sentence(),
            'reply_id' => ThreadResponse::factory(),
            'thread_id' => Thread::factory(),
            'step' => (string) fake()->numberBetween(1, 5),
            'type' => fake()->word(),
            'status' => fake()->randomElement(['OPEN', 'CLOSE']),
        ];
    }
}
