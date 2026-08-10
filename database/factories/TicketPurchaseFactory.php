<?php

namespace Database\Factories;

use App\Models\Event;
use App\Models\EventTicket;
use App\Models\PaymentPartner;
use App\Models\TicketPurchase;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TicketPurchase>
 */
class TicketPurchaseFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $event = Event::factory()->create();

        return [
            'event_id' => $event->id,
            'event_ticket_id' => EventTicket::factory()->for($event)->create()->id,
            'payment_partner_id' => PaymentPartner::factory()->create()->id,
            'email' => fake()->unique()->safeEmail(),
            'phone_number' => fake()->phoneNumber(),
            'amount' => fake()->randomFloat(2, 5000, 200000),
            'status' => 'pending',
        ];
    }
}
