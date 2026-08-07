<?php

use App\Models\Event;
use App\Models\EventTicket;
use App\Models\User;

test('guests cannot view event tickets', function () {
    $event = Event::factory()->create();

    $this->get(route('events.tickets.index', $event))
        ->assertRedirect(route('login'));
});

test('users can view tickets for their own event', function () {
    $user = User::factory()->create();
    $event = Event::factory()->create(['user_id' => $user->id]);
    EventTicket::factory()->count(2)->create(['event_id' => $event->id]);

    $this->actingAs($user)->get(route('events.tickets.index', $event))
        ->assertOk();
});

test('users cannot view tickets for another user\'s event', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $event = Event::factory()->create(['user_id' => $owner->id]);

    $this->actingAs($other)->get(route('events.tickets.index', $event))
        ->assertForbidden();
});

test('users can create a ticket for their own event', function () {
    $user = User::factory()->create();
    $event = Event::factory()->create(['user_id' => $user->id]);

    $response = $this->actingAs($user)->post(route('events.tickets.store', $event), [
        'name' => 'VIP',
        'price' => 25000,
        'quantity' => 50,
        'description' => 'Front row seating.',
    ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('event_tickets', [
        'event_id' => $event->id,
        'name' => 'VIP',
        'price' => 25000.00,
        'quantity' => 50,
    ]);
});

test('users can update a ticket on their own event', function () {
    $user = User::factory()->create();
    $event = Event::factory()->create(['user_id' => $user->id]);
    $ticket = EventTicket::factory()->create(['event_id' => $event->id]);

    $response = $this->actingAs($user)->put(
        route('events.tickets.update', [$event, $ticket]),
        [
            'name' => 'Early Bird',
            'price' => 15000,
            'quantity' => 100,
        ],
    );

    $response->assertRedirect();
    expect($ticket->fresh()->name)->toBe('Early Bird');
});

test('users cannot update a ticket on another user\'s event', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $event = Event::factory()->create(['user_id' => $owner->id]);
    $ticket = EventTicket::factory()->create(['event_id' => $event->id]);

    $this->actingAs($other)->put(
        route('events.tickets.update', [$event, $ticket]),
        ['name' => 'Hijacked', 'price' => 1, 'quantity' => 1],
    )->assertForbidden();
});

test('users can delete a ticket on their own event', function () {
    $user = User::factory()->create();
    $event = Event::factory()->create(['user_id' => $user->id]);
    $ticket = EventTicket::factory()->create(['event_id' => $event->id]);

    $response = $this->actingAs($user)->delete(
        route('events.tickets.destroy', [$event, $ticket]),
    );

    $response->assertRedirect();
    expect($ticket->fresh()->trashed())->toBeTrue();
});
