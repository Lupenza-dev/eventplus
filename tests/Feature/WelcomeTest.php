<?php

use App\Models\Event;
use App\Models\EventCategory;
use App\Models\EventTicket;
use App\Models\User;
use App\Models\Vendor;
use Inertia\Testing\AssertableInertia as Assert;

test('guests can view the home page', function () {
    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('welcome'));
});

test('home page renders approved active events from the database', function () {
    $user = User::factory()->create();
    $category = EventCategory::factory()->create();
    $vendor = Vendor::factory()->create();

    $event = Event::factory()->create([
        'user_id' => $user->id,
        'vendor_id' => $vendor->id,
        'event_category_id' => $category->id,
        'title' => 'Tech Summit 2026',
        'location' => 'Dar es Salaam',
        'event_date' => now()->addWeek(),
        'is_active' => true,
        'is_approved' => 1,
    ]);

    EventTicket::factory()->create([
        'event_id' => $event->id,
        'price' => '45000',
    ]);
    EventTicket::factory()->create([
        'event_id' => $event->id,
        'price' => '75000',
    ]);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('welcome')
            ->has('events', 1)
            ->where('events.0.name', 'Tech Summit 2026')
            ->where('events.0.location', 'Dar es Salaam')
            ->where('events.0.category', $category->name)
            ->where('events.0.price', 'TZS 45,000'));
});

test('home page labels free events without tickets', function () {
    $user = User::factory()->create();
    $category = EventCategory::factory()->create();
    $vendor = Vendor::factory()->create();

    Event::factory()->create([
        'user_id' => $user->id,
        'vendor_id' => $vendor->id,
        'event_category_id' => $category->id,
        'event_date' => now()->addWeek(),
        'is_active' => true,
        'is_approved' => 1,
    ]);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('welcome')
            ->where('events.0.price', 'Free'));
});

test('home page excludes pending, rejected, inactive, and past events', function () {
    $user = User::factory()->create();
    $category = EventCategory::factory()->create();
    $vendor = Vendor::factory()->create();

    $base = [
        'user_id' => $user->id,
        'vendor_id' => $vendor->id,
        'event_category_id' => $category->id,
        'event_date' => now()->addWeek(),
        'is_active' => true,
        'is_approved' => 1,
    ];

    Event::factory()->create([...$base, 'is_approved' => 0, 'title' => 'Pending Event']);
    Event::factory()->create([...$base, 'is_approved' => 2, 'title' => 'Rejected Event']);
    Event::factory()->create([...$base, 'is_active' => false, 'title' => 'Inactive Event']);
    Event::factory()->create([
        ...$base,
        'title' => 'Past Event',
        'event_date' => now()->subWeek(),
    ]);
    Event::factory()->create([
        ...$base,
        'title' => 'Visible Event',
        'event_date' => now()->addWeek(),
    ]);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('welcome')
            ->has('events', 1)
            ->where('events.0.name', 'Visible Event'));
});
