<?php

namespace Database\Factories;

use App\Models\Event;
use App\Models\EventTicket;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<EventTicket>
 */
class EventTicketFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'event_id' => Event::factory(),
            'name' => Str::title(fake()->unique()->words(2, true)),
            'price' => fake()->randomFloat(2, 0, 500),
            'quantity' => fake()->numberBetween(10, 500),
            'description' => fake()->optional()->sentence(),
            'design_image' => null,
            'qr_code_x' => 62,
            'qr_code_y' => 58,
            'qr_code_width' => 24,
            'qr_code_height' => 24,
            'uuid' => (string) Str::uuid(),
        ];
    }
}
