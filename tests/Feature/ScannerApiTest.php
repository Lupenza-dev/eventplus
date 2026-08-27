<?php

use App\Models\Event;
use App\Models\EventTicket;
use App\Models\TicketPurchase;
use App\Models\User;
use Spatie\Permission\Models\Role;

function scannerUserFor(Event $event): User
{
    $user = User::factory()->create(['password' => 'password']);
    Role::findOrCreate('App User', 'web');
    $user->assignRole('App User');
    $user->vendors()->attach($event->vendor_id, ['vendor_type' => 'scanner']);

    return $user;
}

function scannerEvent(): Event
{
    return Event::factory()->create([
        'is_active' => true,
        'is_approved' => 1,
    ]);
}

function scannerPurchase(Event $event, array $attributes = []): TicketPurchase
{
    $ticket = EventTicket::factory()->for($event)->create(['name' => 'VIP']);

    return TicketPurchase::factory()
        ->for($event)
        ->for($ticket, 'ticket')
        ->create([
            'status' => 'paid',
            'amount' => '45000.00',
            ...$attributes,
        ]);
}

test('scanner staff can log in and view assigned events', function () {
    $event = scannerEvent();
    $user = scannerUserFor($event);

    $this->postJson('/api/login', [
        'email' => $user->email,
        'password' => 'password',
    ])->assertSuccessful()
        ->assertJsonPath('data.user.id', $user->id)
        ->assertJsonStructure(['data' => ['token']]);

    $this->actingAs($user, 'sanctum')
        ->getJson('/api/scanner/events')
        ->assertSuccessful()
        ->assertJsonPath('data.0.id', $event->id);
});

test('scanner login requires the app user role', function () {
    $user = User::factory()->create(['password' => 'password']);

    $this->postJson('/api/login', [
        'email' => $user->email,
        'password' => 'password',
    ])->assertForbidden();
});

test('scanner validates valid, wrong-event, cancelled, and already-used tickets', function () {
    $event = scannerEvent();
    $user = scannerUserFor($event);
    $validPurchase = scannerPurchase($event);
    $foreignPurchase = scannerPurchase(scannerEvent());
    $cancelledPurchase = scannerPurchase($event, ['status' => 'cancelled']);
    $usedPurchase = scannerPurchase($event, ['checked_in' => true, 'checked_in_at' => now()]);

    $this->actingAs($user, 'sanctum')
        ->postJson('/api/scanner/validate-ticket', ['event_id' => $event->id, 'ticket_code' => $validPurchase->uuid])
        ->assertSuccessful()
        ->assertJsonPath('status', 'VALID');

    $this->actingAs($user, 'sanctum')
        ->postJson('/api/scanner/validate-ticket', ['event_id' => $event->id, 'ticket_code' => $foreignPurchase->uuid])
        ->assertSuccessful()
        ->assertJsonPath('status', 'WRONG_EVENT');

    $this->actingAs($user, 'sanctum')
        ->postJson('/api/scanner/validate-ticket', ['event_id' => $event->id, 'ticket_code' => $cancelledPurchase->uuid])
        ->assertSuccessful()
        ->assertJsonPath('status', 'CANCELLED');

    $this->actingAs($user, 'sanctum')
        ->postJson('/api/scanner/validate-ticket', ['event_id' => $event->id, 'ticket_code' => $usedPurchase->uuid])
        ->assertSuccessful()
        ->assertJsonPath('status', 'ALREADY_USED');
});

test('scanner check-in is recorded once and cannot be duplicated', function () {
    $event = scannerEvent();
    $user = scannerUserFor($event);
    $purchase = scannerPurchase($event);

    $this->actingAs($user, 'sanctum')
        ->postJson('/api/scanner/check-in', ['event_id' => $event->id, 'ticket_code' => $purchase->uuid])
        ->assertSuccessful()
        ->assertJsonPath('status', 'CHECKED_IN')
        ->assertJsonPath('data.ticket_code', $purchase->uuid);

    $purchase->refresh();
    expect($purchase->checked_in)->toBeTrue()
        ->and($purchase->checked_in_by)->toBe($user->id)
        ->and($purchase->checked_in_at)->not->toBeNull();

    $this->actingAs($user, 'sanctum')
        ->postJson('/api/scanner/check-in', ['event_id' => $event->id, 'ticket_code' => $purchase->uuid])
        ->assertSuccessful()
        ->assertJsonPath('status', 'ALREADY_USED');
});

test('scanner access is restricted to app users with event access', function () {
    $event = scannerEvent();
    $unauthorized = User::factory()->create();
    $scanner = scannerUserFor(scannerEvent());

    $this->actingAs($unauthorized, 'sanctum')
        ->getJson('/api/scanner/events')
        ->assertForbidden();

    $this->actingAs($scanner, 'sanctum')
        ->getJson("/api/scanner/events/{$event->id}")
        ->assertForbidden();
});
