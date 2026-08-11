<?php

namespace Database\Factories;

use App\Models\ResponseThreadLink;
use App\Models\Thread;
use App\Models\ThreadResponse;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ResponseThreadLink>
 */
class ResponseThreadLinkFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'thread_response_id' => ThreadResponse::factory(),
            'thread_id' => Thread::factory(),
            'user_id' => User::factory(),
        ];
    }
}
