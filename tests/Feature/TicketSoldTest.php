<?php

use App\Models\Event;
use App\Models\EventSubscriber;
use App\Models\Subscriber;
use App\Models\User;
use App\Models\Vendor;
use Inertia\Testing\AssertableInertia as Assert;

test('guests cannot view tickets sold', function () {
    $this->get(route('tickets-sold'))->assertRedirect(route('login'));
});

test('users can view the tickets sold page with an empty state', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('tickets-sold'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('events/tickets-sold')
            ->where('stats.total', 0)
            ->where('stats.attending', 0)
            ->where('stats.events', 0)
            ->where('stats.vendors', 0)
            ->has('sales.data', 0));
});

test('users can view tickets sold with data', function () {
    $user = User::factory()->create();
    $vendor = Vendor::factory()->create();
    $event = Event::factory()->create(['vendor_id' => $vendor->id]);
    $subscriber = Subscriber::factory()->create();

    EventSubscriber::factory()->create([
        'event_id' => $event->id,
        'subscriber_id' => $subscriber->id,
        'is_attending' => true,
    ]);

    $this->actingAs($user)
        ->get(route('tickets-sold'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('events/tickets-sold')
            ->where('stats.total', 1)
            ->where('stats.attending', 1)
            ->where('stats.events', 1)
            ->where('stats.vendors', 1)
            ->has('sales.data', 1)
            ->where('sales.data.0.customer_name', $subscriber->name)
            ->where('sales.data.0.phone_number', $subscriber->phone_number)
            ->where('sales.data.0.event_title', $event->title)
            ->where('sales.data.0.vendor_name', $vendor->name)
            ->where('sales.data.0.is_attending', true));
});

test('date range filter narrows the results', function () {
    $user = User::factory()->create();
    $event = Event::factory()->create();
    $subscriber = Subscriber::factory()->create();

    $recent = EventSubscriber::factory()->create([
        'event_id' => $event->id,
        'subscriber_id' => $subscriber->id,
    ]);

    $older = EventSubscriber::factory()->create([
        'event_id' => $event->id,
        'subscriber_id' => $subscriber->id,
    ]);
    $older->created_at = now()->subMonth();
    $older->save();

    $this->actingAs($user)
        ->get(route('tickets-sold', ['date_from' => now()->subWeek()->toDateString()]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('stats.total', 1)
            ->where('sales.data.0.id', $recent->id));
});

test('date range validation rejects an inverted range', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('tickets-sold', [
            'date_from' => '2026-08-01',
            'date_to' => '2026-07-01',
        ]))
        ->assertSessionHasErrors('date_to');
});

test('vendor filter narrows the results', function () {
    $user = User::factory()->create();
    $vendorA = Vendor::factory()->create();
    $vendorB = Vendor::factory()->create();
    $eventA = Event::factory()->create(['vendor_id' => $vendorA->id]);
    $eventB = Event::factory()->create(['vendor_id' => $vendorB->id]);
    $subscriber = Subscriber::factory()->create();

    EventSubscriber::factory()->create([
        'event_id' => $eventA->id,
        'subscriber_id' => $subscriber->id,
    ]);
    EventSubscriber::factory()->create([
        'event_id' => $eventB->id,
        'subscriber_id' => $subscriber->id,
    ]);

    $this->actingAs($user)
        ->get(route('tickets-sold', ['vendor_id' => $vendorA->id]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('stats.total', 1)
            ->where('sales.data.0.event_title', $eventA->title)
            ->has('events', 1)
            ->where('events.0.id', $eventA->id));
});

test('event filter narrows the results', function () {
    $user = User::factory()->create();
    $eventA = Event::factory()->create();
    $eventB = Event::factory()->create();
    $subscriber = Subscriber::factory()->create();

    EventSubscriber::factory()->create([
        'event_id' => $eventA->id,
        'subscriber_id' => $subscriber->id,
    ]);
    EventSubscriber::factory()->create([
        'event_id' => $eventB->id,
        'subscriber_id' => $subscriber->id,
    ]);

    $this->actingAs($user)
        ->get(route('tickets-sold', ['event_id' => $eventB->id]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('stats.total', 1)
            ->where('sales.data.0.event_title', $eventB->title));
});
