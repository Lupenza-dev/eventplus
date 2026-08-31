<?php

use App\Models\Event;
use App\Models\EventTicket;
use App\Models\TicketPurchase;
use App\Models\User;
use App\Models\Vendor;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;

function ticketSalesAdmin(): User
{
    $user = User::factory()->create();
    $user->assignRole(Role::findOrCreate('Admin', 'web'));

    return $user;
}

test('guests cannot view tickets sold', function () {
    $this->get(route('tickets-sold'))->assertRedirect(route('login'));
});

test('users can view the tickets sold page with an empty state', function () {
    $user = ticketSalesAdmin();

    $this->actingAs($user)
        ->get(route('tickets-sold'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('events/tickets-sold')
            ->where('stats.total', 0)
            ->where('stats.checked_in', 0)
            ->where('stats.events', 0)
            ->where('stats.vendors', 0)
            ->has('sales.data', 0));
});

test('users can view tickets sold with data', function () {
    $user = ticketSalesAdmin();
    $vendor = Vendor::factory()->create();
    $event = Event::factory()->create(['vendor_id' => $vendor->id]);
    $ticket = EventTicket::factory()->for($event)->create(['name' => 'VIP']);
    TicketPurchase::factory()->create([
        'event_id' => $event->id,
        'event_ticket_id' => $ticket->id,
        'email' => 'buyer@example.com',
        'phone_number' => '+255700000000',
        'amount' => 45000,
        'status' => 'paid',
        'checked_in' => true,
    ]);

    $this->actingAs($user)
        ->get(route('tickets-sold'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('events/tickets-sold')
            ->where('stats.total', 1)
            ->where('stats.checked_in', 1)
            ->where('stats.events', 1)
            ->where('stats.vendors', 1)
            ->has('sales.data', 1)
            ->where('sales.data.0.email', 'buyer@example.com')
            ->where('sales.data.0.phone_number', '+255700000000')
            ->where('sales.data.0.event_title', $event->title)
            ->where('sales.data.0.vendor_name', $vendor->name)
            ->where('sales.data.0.ticket_name', 'VIP')
            ->where('sales.data.0.amount', 45000)
            ->where('sales.data.0.checked_in', true));
});

test('date range filter narrows the results', function () {
    $user = ticketSalesAdmin();
    $event = Event::factory()->create();
    $recent = TicketPurchase::factory()->create([
        'event_id' => $event->id,
        'amount' => 0,
    ]);

    $older = TicketPurchase::factory()->create([
        'event_id' => $event->id,
        'amount' => 0,
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
    $user = ticketSalesAdmin();

    $this->actingAs($user)
        ->get(route('tickets-sold', [
            'date_from' => '2026-08-01',
            'date_to' => '2026-07-01',
        ]))
        ->assertSessionHasErrors('date_to');
});

test('vendor filter narrows the results', function () {
    $user = ticketSalesAdmin();
    $vendorA = Vendor::factory()->create();
    $vendorB = Vendor::factory()->create();
    $eventA = Event::factory()->create(['vendor_id' => $vendorA->id]);
    $eventB = Event::factory()->create(['vendor_id' => $vendorB->id]);
    TicketPurchase::factory()->create([
        'event_id' => $eventA->id,
        'amount' => 0,
    ]);
    TicketPurchase::factory()->create([
        'event_id' => $eventB->id,
        'amount' => 0,
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
    $user = ticketSalesAdmin();
    $eventA = Event::factory()->create();
    $eventB = Event::factory()->create();
    TicketPurchase::factory()->create([
        'event_id' => $eventA->id,
        'amount' => 0,
    ]);
    TicketPurchase::factory()->create([
        'event_id' => $eventB->id,
        'amount' => 0,
    ]);

    $this->actingAs($user)
        ->get(route('tickets-sold', ['event_id' => $eventB->id]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('stats.total', 1)
            ->where('sales.data.0.event_title', $eventB->title));
});

test('vendor users only see sales for their vendor', function () {
    $vendor = Vendor::factory()->create();
    $otherVendor = Vendor::factory()->create();
    $user = User::factory()->create();
    $user->assignRole(Role::findOrCreate('Vendor', 'web'));
    $user->vendors()->attach($vendor->id, ['vendor_type' => 'Vendor']);
    $event = Event::factory()->create(['vendor_id' => $vendor->id]);
    $otherEvent = Event::factory()->create(['vendor_id' => $otherVendor->id]);

    TicketPurchase::factory()->create(['event_id' => $event->id, 'amount' => 0]);
    TicketPurchase::factory()->create(['event_id' => $otherEvent->id, 'amount' => 0]);

    $this->actingAs($user)
        ->get(route('tickets-sold'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('stats.total', 1)
            ->where('sales.data.0.event_title', $event->title)
            ->has('vendors', 1)
            ->where('vendors.0.id', $vendor->id));
});
