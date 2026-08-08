<?php

use App\Models\Event;
use App\Models\EventSubscriber;
use App\Models\Subscriber;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk();
});

test('dashboard shows summary stats and chart data', function () {
    $user = User::factory()->create();
    $event = Event::factory()->create();
    $subscriber = Subscriber::factory()->create();

    EventSubscriber::factory()->create([
        'event_id' => $event->id,
        'subscriber_id' => $subscriber->id,
        'is_attending' => true,
    ]);
    EventSubscriber::factory()->create([
        'event_id' => $event->id,
        'subscriber_id' => $subscriber->id,
        'is_attending' => false,
    ]);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('stats.events', 1)
            ->where('stats.tickets_sold', 2)
            ->where('stats.attendees', 1)
            ->where('stats.payment_collected', 150 + (($event->id * 37) % 500))
            ->has('chart', 1)
            ->where('chart.0.event', $event->title)
            ->where('chart.0.tickets', 2)
            ->where('chart.0.payment', 150 + (($event->id * 37) % 500))
            ->where('year', null)
            ->has('years'));
});

test('dashboard filters stats and chart by year', function () {
    $user = User::factory()->create();
    $event = Event::factory()->create();
    $subscriber = Subscriber::factory()->create();

    EventSubscriber::factory()->create([
        'event_id' => $event->id,
        'subscriber_id' => $subscriber->id,
        'created_at' => now()->subYear(),
    ]);
    EventSubscriber::factory()->create([
        'event_id' => $event->id,
        'subscriber_id' => $subscriber->id,
        'created_at' => now(),
    ]);

    $lastYear = now()->subYear()->year;

    $this->actingAs($user)
        ->get(route('dashboard', ['year' => $lastYear]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('year', $lastYear)
            ->where('stats.tickets_sold', 1)
            ->where('stats.attendees', 0)
            ->has('chart', 1)
            ->where('chart.0.tickets', 1)
            ->where('chart.0.payment', 75 + (($event->id * 37) % 500))
            ->has('years'));
});

test('dashboard rejects an out of range year', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('dashboard', ['year' => 1800]))
        ->assertSessionHasErrors('year');
});

test('dashboard shows an empty chart when no tickets are sold', function () {
    $user = User::factory()->create();
    Event::factory()->create();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('stats.events', 1)
            ->where('stats.tickets_sold', 0)
            ->where('stats.payment_collected', 0)
            ->has('chart', 0));
});
