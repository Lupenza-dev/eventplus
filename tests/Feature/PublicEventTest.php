<?php

use App\Models\Event;
use App\Models\EventCategory;
use App\Models\EventTicket;
use App\Models\User;
use App\Models\Vendor;
use Inertia\Testing\AssertableInertia as Assert;

test('guests can view a public event details page with its tickets', function () {
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
        'name' => 'VIP',
        'price' => '45000',
        'quantity' => 50,
    ]);

    $this->get(route('events.show', $event))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('events/show')
            ->where('event.title', 'Tech Summit 2026')
            ->where('event.location', 'Dar es Salaam')
            ->where('event.category', $category->name)
            ->has('tickets', 1)
            ->where('tickets.0.name', 'VIP')
            ->where('tickets.0.price', '45000.00'));
});

test('pending, rejected, and inactive events return 404', function (int $isApproved, bool $isActive) {
    $user = User::factory()->create();
    $category = EventCategory::factory()->create();
    $vendor = Vendor::factory()->create();

    $event = Event::factory()->create([
        'user_id' => $user->id,
        'vendor_id' => $vendor->id,
        'event_category_id' => $category->id,
        'event_date' => now()->addWeek(),
        'is_active' => $isActive,
        'is_approved' => $isApproved,
    ]);

    $this->get(route('events.show', $event))->assertNotFound();
})->with([
    'pending' => [0, true],
    'rejected' => [2, true],
    'inactive' => [1, false],
]);
