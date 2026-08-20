<?php

use App\Models\Event;
use App\Models\EventCategory;
use App\Models\EventTicket;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

test('guests cannot view event tickets', function () {
    $event = Event::factory()->create();

    $this->get(route('events.tickets.index', $event))
        ->assertRedirect(route('login'));
});

test('users can view tickets for their own event', function () {
    $user = User::factory()->create();
    $category = EventCategory::factory()->create();
    $event = Event::factory()->create([
        'user_id' => $user->id,
        'event_category_id' => $category->id,
        'title' => 'Tech Summit 2026',
        'location' => 'Dar es Salaam',
        'event_date' => now()->addWeek(),
    ]);
    EventTicket::factory()->create([
        'event_id' => $event->id,
        'name' => 'VIP',
        'price' => '45000',
        'quantity' => 50,
    ]);

    $this->actingAs($user)->get(route('events.tickets.index', $event))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('events/tickets')
            ->where('event.id', $event->id)
            ->where('event.title', 'Tech Summit 2026')
            ->where('event.location', 'Dar es Salaam')
            ->where('event.category', $category->name)
            ->has('tickets', 1)
            ->where('tickets.0.name', 'VIP')
            ->where('tickets.0.price', '45000.00')
            ->where('tickets.0.design_image_url', null)
            ->where('tickets.0.qr_code_x', '62.00')
            ->where('tickets.0.qr_code_y', '58.00'));
});

test('users can open the create ticket page for their own event', function () {
    $user = User::factory()->create();
    $event = Event::factory()->create([
        'user_id' => $user->id,
        'title' => 'Launch Party',
    ]);

    $this->actingAs($user)->get(route('events.tickets.create', $event))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('events/tickets/create')
            ->where('event.id', $event->id)
            ->where('event.title', 'Launch Party'));
});

test('users cannot view tickets for another user\'s event', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $event = Event::factory()->create(['user_id' => $owner->id]);

    $this->actingAs($other)->get(route('events.tickets.index', $event))
        ->assertForbidden();
});

test('users can create a ticket for their own event', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $event = Event::factory()->create(['user_id' => $user->id]);

    $response = $this->actingAs($user)->post(route('events.tickets.store', $event), [
        'name' => 'VIP',
        'price' => 25000,
        'quantity' => 50,
        'description' => 'Front row seating.',
        'design_image' => UploadedFile::fake()->image('ticket.jpg', 1200, 675),
        'qr_code_x' => 64,
        'qr_code_y' => 52,
        'qr_code_width' => 20,
        'qr_code_height' => 20,
    ]);

    $response->assertRedirect(route('events.tickets.index', $event));

    $ticket = EventTicket::where('event_id', $event->id)->firstOrFail();

    $this->assertDatabaseHas('event_tickets', [
        'event_id' => $event->id,
        'name' => 'VIP',
        'price' => 25000.00,
        'quantity' => 50,
        'qr_code_x' => 64.00,
        'qr_code_y' => 52.00,
        'qr_code_width' => 20.00,
        'qr_code_height' => 20.00,
    ]);

    expect($ticket->design_image)->not->toBeNull();
    Storage::disk('public')->assertExists($ticket->design_image);
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
            'qr_code_x' => 60,
            'qr_code_y' => 55,
            'qr_code_width' => 25,
            'qr_code_height' => 25,
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
        [
            'name' => 'Hijacked',
            'price' => 1,
            'quantity' => 1,
            'qr_code_x' => 60,
            'qr_code_y' => 55,
            'qr_code_width' => 25,
            'qr_code_height' => 25,
        ],
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
