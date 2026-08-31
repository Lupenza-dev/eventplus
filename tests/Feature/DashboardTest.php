<?php

use App\Models\Event;
use App\Models\EventTicket;
use App\Models\TicketPurchase;
use App\Models\User;
use App\Models\Vendor;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;

function dashboardPurchase(Event $event, array $attributes = []): TicketPurchase
{
    $ticket = EventTicket::factory()->for($event)->create();

    $purchase = TicketPurchase::query()->create(array_merge([
        'event_id' => $event->id,
        'event_ticket_id' => $ticket->id,
        'email' => 'buyer@example.com',
        'phone_number' => '+255700000000',
        'amount' => 0,
        'status' => 'pending',
    ], array_diff_key($attributes, array_flip(['created_at', 'updated_at']))));

    if (isset($attributes['created_at'])) {
        $purchase->forceFill([
            'created_at' => $attributes['created_at'],
            'updated_at' => $attributes['updated_at'] ?? $attributes['created_at'],
        ])->save();
    }

    return $purchase;
}

function dashboardAdmin(): User
{
    $user = User::factory()->create();
    $user->assignRole(Role::findOrCreate('Admin', 'web'));

    return $user;
}

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $user = dashboardAdmin();
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk();
});

test('dashboard shows summary stats and chart data', function () {
    $user = dashboardAdmin();
    $event = Event::factory()->create();
    dashboardPurchase($event, [
        'amount' => 45000,
        'status' => 'paid',
        'checked_in' => true,
    ]);
    dashboardPurchase($event, [
        'amount' => 15000,
        'status' => 'completed',
        'checked_in' => false,
    ]);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('stats.events', 1)
            ->where('stats.tickets_sold', 2)
            ->where('stats.attendees', 1)
            ->where('stats.payment_collected', 60000)
            ->has('chart', 1)
            ->where('chart.0.event', $event->title)
            ->where('chart.0.tickets', 2)
            ->where('chart.0.payment', 60000)
            ->where('year', null)
            ->has('years'));
});

test('dashboard filters stats and chart by year', function () {
    $user = dashboardAdmin();
    $event = Event::factory()->create();
    dashboardPurchase($event, [
        'amount' => 12000,
        'status' => 'paid',
        'created_at' => now()->subYear(),
    ]);
    dashboardPurchase($event, [
        'amount' => 32000,
        'status' => 'paid',
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
            ->where('chart.0.payment', 12000)
            ->has('years'));
});

test('dashboard rejects an out of range year', function () {
    $user = dashboardAdmin();

    $this->actingAs($user)
        ->get(route('dashboard', ['year' => 1800]))
        ->assertSessionHasErrors('year');
});

test('dashboard shows an empty chart when no tickets are sold', function () {
    $user = dashboardAdmin();
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

test('vendor users only see dashboard data for their vendor', function () {
    $vendor = Vendor::factory()->create();
    $otherVendor = Vendor::factory()->create();
    $user = User::factory()->create();
    $user->assignRole(Role::findOrCreate('Vendor', 'web'));
    $user->vendors()->attach($vendor->id, ['vendor_type' => 'Vendor']);
    $event = Event::factory()->create(['vendor_id' => $vendor->id]);
    $otherEvent = Event::factory()->create(['vendor_id' => $otherVendor->id]);

    dashboardPurchase($event, ['amount' => 20000, 'status' => 'paid']);
    dashboardPurchase($otherEvent, ['amount' => 90000, 'status' => 'paid']);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('stats.events', 1)
            ->where('stats.tickets_sold', 1)
            ->where('stats.payment_collected', 20000)
            ->where('chart.0.event', $event->title));
});
