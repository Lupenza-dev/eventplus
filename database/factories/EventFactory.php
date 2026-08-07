<?php

namespace Database\Factories;

use App\Models\Event;
use App\Models\EventCategory;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Event>
 */
class EventFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'event_category_id' => EventCategory::factory(),
            'vendor_id' => Vendor::factory(),
            'title' => Str::title(fake()->unique()->words(3, true)),
            'description' => fake()->optional()->paragraph(),
            'location' => fake()->optional()->city(),
            'start_date' => fake()->optional()->dateTimeBetween('+1 week', '+2 weeks'),
            'end_date' => fake()->optional()->dateTimeBetween('+3 weeks', '+4 weeks'),
            'event_date' => fake()->optional()->dateTimeBetween('+2 weeks', '+3 weeks'),
            'is_active' => true,
            'is_paid_event' => fake()->boolean(),
            'uuid' => (string) Str::uuid(),
        ];
    }
}
