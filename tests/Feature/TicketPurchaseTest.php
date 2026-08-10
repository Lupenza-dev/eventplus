<?php

use App\Models\Event;
use App\Models\EventCategory;
use App\Models\EventTicket;
use App\Models\PaymentPartner;
use App\Models\TicketPurchase;
use App\Models\User;
use App\Models\Vendor;
use Inertia\Testing\AssertableInertia;

function purchaseEvent(bool $isPaid = true, string $price = '45000'): array
{
    $user = User::factory()->create();
    $category = EventCategory::factory()->create();
    $vendor = Vendor::factory()->create();

    $event = Event::factory()->create([
        'user_id' => $user->id,
        'vendor_id' => $vendor->id,
        'event_category_id' => $category->id,
        'is_active' => true,
        'is_approved' => 1,
        'is_paid_event' => $isPaid,
    ]);

    $ticket = EventTicket::factory()->create([
        'event_id' => $event->id,
        'name' => $isPaid ? 'VIP' : 'Free entry',
        'price' => $price,
        'quantity' => 50,
    ]);

    return ['event' => $event, 'ticket' => $ticket];
}

test('visitors can submit a paid ticket purchase', function () {
    ['event' => $event, 'ticket' => $ticket] = purchaseEvent();
    $partner = PaymentPartner::factory()->create(['is_active' => true]);

    $this->post(route('events.tickets.purchase', [$event, $ticket]), [
        'email' => 'buyer@example.com',
        'phone_number' => '+255 712 345 678',
        'payment_partner_id' => $partner->id,
    ])->assertRedirect();

    $this->assertDatabaseHas('ticket_purchases', [
        'event_id' => $event->id,
        'event_ticket_id' => $ticket->id,
        'payment_partner_id' => $partner->id,
        'email' => 'buyer@example.com',
        'phone_number' => '+255 712 345 678',
        'amount' => '45000.00',
        'status' => 'pending',
    ]);
});

test('the payment amount is taken from the ticket price, not the request', function () {
    ['event' => $event, 'ticket' => $ticket] = purchaseEvent();
    $partner = PaymentPartner::factory()->create(['is_active' => true]);

    $this->post(route('events.tickets.purchase', [$event, $ticket]), [
        'email' => 'buyer@example.com',
        'phone_number' => '+255 712 345 678',
        'payment_partner_id' => $partner->id,
        'amount' => '1',
    ])->assertRedirect();

    $this->assertDatabaseHas('ticket_purchases', [
        'event_ticket_id' => $ticket->id,
        'amount' => '45000.00',
    ]);
});

test('free tickets do not require a payment partner', function () {
    ['event' => $event, 'ticket' => $ticket] = purchaseEvent(false, '0');

    $this->post(route('events.tickets.purchase', [$event, $ticket]), [
        'email' => 'free@example.com',
        'phone_number' => '+255 712 345 678',
    ])->assertRedirect();

    $this->assertDatabaseHas('ticket_purchases', [
        'event_id' => $event->id,
        'event_ticket_id' => $ticket->id,
        'payment_partner_id' => null,
        'amount' => '0.00',
        'status' => 'pending',
    ]);
});

test('paid tickets require an active payment partner', function () {
    ['event' => $event, 'ticket' => $ticket] = purchaseEvent();
    $partner = PaymentPartner::factory()->create(['is_active' => false]);

    $this->post(route('events.tickets.purchase', [$event, $ticket]), [
        'email' => 'buyer@example.com',
        'phone_number' => '+255 712 345 678',
        'payment_partner_id' => $partner->id,
    ])->assertSessionHasErrors('payment_partner_id');

    $this->assertDatabaseCount('ticket_purchases', 0);
});

test('purchases require a valid email and phone number', function () {
    ['event' => $event, 'ticket' => $ticket] = purchaseEvent();
    $partner = PaymentPartner::factory()->create(['is_active' => true]);

    $this->post(route('events.tickets.purchase', [$event, $ticket]), [
        'email' => 'not-an-email',
        'phone_number' => '',
        'payment_partner_id' => $partner->id,
    ])->assertSessionHasErrors(['email', 'phone_number']);

    $this->assertDatabaseCount('ticket_purchases', 0);
});

test('purchases cannot be made against hidden events', function () {
    ['event' => $event, 'ticket' => $ticket] = purchaseEvent();
    $partner = PaymentPartner::factory()->create(['is_active' => true]);
    $event->forceFill(['is_approved' => 0])->save();

    $this->post(route('events.tickets.purchase', [$event, $ticket]), [
        'email' => 'buyer@example.com',
        'phone_number' => '+255 712 345 678',
        'payment_partner_id' => $partner->id,
    ])->assertNotFound();

    $this->assertDatabaseCount('ticket_purchases', 0);
});

test('a ticket cannot be purchased under a different event', function () {
    ['event' => $event] = purchaseEvent();
    ['ticket' => $foreignTicket] = purchaseEvent();
    $partner = PaymentPartner::factory()->create(['is_active' => true]);

    $this->post(route('events.tickets.purchase', [$event, $foreignTicket]), [
        'email' => 'buyer@example.com',
        'phone_number' => '+255 712 345 678',
        'payment_partner_id' => $partner->id,
    ])->assertNotFound();

    $this->assertDatabaseCount('ticket_purchases', 0);
});

test('the public event page includes active payment partners', function () {
    $active = PaymentPartner::factory()->create(['name' => 'Azam Pay', 'is_active' => true]);
    PaymentPartner::factory()->create(['name' => 'Tigo Pesa', 'is_active' => false]);

    ['event' => $event] = purchaseEvent();

    $this->get(route('events.show', $event))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('events/show')
            ->has('paymentPartners', 1)
            ->where('paymentPartners.0.name', 'Azam Pay'));
});

test('the TicketPurchase model persists with its relations', function () {
    $partner = PaymentPartner::factory()->create(['is_active' => true]);
    $purchase = TicketPurchase::factory()->create(['payment_partner_id' => $partner->id]);

    $this->assertInstanceOf(Event::class, $purchase->event);
    $this->assertInstanceOf(EventTicket::class, $purchase->ticket);
    $this->assertInstanceOf(PaymentPartner::class, $purchase->paymentPartner);
    $this->assertEquals('pending', $purchase->status);
    $this->assertNotNull($purchase->uuid);
});
