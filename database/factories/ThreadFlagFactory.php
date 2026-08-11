<?php

namespace Database\Factories;

use App\Models\ThreadFlag;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ThreadFlag>
 */
class ThreadFlagFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->word(),
            'is_active' => true,
        ];
    }
}
