<?php

namespace Database\Factories;

use App\Models\ThreadLabel;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ThreadLabel>
 */
class ThreadLabelFactory extends Factory
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
