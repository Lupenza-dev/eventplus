<?php

namespace Database\Factories;

use App\Models\Event;
use App\Models\EventSubscriber;
use App\Models\Subscriber;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<EventSubscriber>
 */
class EventSubscriberFactory extends Factory
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
            'subscriber_id' => Subscriber::factory(),
            'is_attending' => false,
            'uuid' => (string) Str::uuid(),
        ];
    }
}
