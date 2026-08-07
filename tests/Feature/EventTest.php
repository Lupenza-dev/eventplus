<?php

use App\Models\Event;
use App\Models\EventCategory;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('guests cannot view events', function () {
    $this->get(route('events.index'))->assertRedirect(route('login'));
});

test('users can view their events', function () {
    $user = User::factory()->create();
    $category = EventCategory::factory()->create();
    $vendor = Vendor::factory()->create();
    $user->vendors()->attach($vendor->id);

    Event::factory()->create([
        'user_id' => $user->id,
        'vendor_id' => $vendor->id,
        'event_category_id' => $category->id,
    ]);

    $response = $this->actingAs($user)->get(route('events.index'));

    $response->assertOk();
});

test('users can create an event', function () {
    $user = User::factory()->create();
    $category = EventCategory::factory()->create();
    $vendor = Vendor::factory()->create();
    $user->vendors()->attach($vendor->id);

    $response = $this->actingAs($user)->post(route('events.store'), [
        'title' => 'Dar Music Festival',
        'event_category_id' => $category->id,
        'location' => 'Uhuru Stadium',
        'start_date' => '2026-09-01 18:00:00',
        'end_date' => '2026-09-01 23:00:00',
        'description' => 'A night of music.',
        'is_paid_event' => true,
    ]);

    $response->assertRedirect();

    $event = Event::where('title', 'Dar Music Festival')->first();
    expect($event)->not->toBeNull();
    expect($event->user_id)->toBe($user->id);
    expect($event->vendor_id)->toBe($vendor->id);
});

test('users can create an event with an image', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $category = EventCategory::factory()->create();
    $vendor = Vendor::factory()->create();
    $user->vendors()->attach($vendor->id);

    $response = $this->actingAs($user)->post(route('events.store'), [
        'title' => 'Photo Event',
        'event_category_id' => $category->id,
        'event_date' => '2026-09-01 18:00:00',
        'image' => UploadedFile::fake()->image('poster.jpg', 600, 400),
    ]);

    $response->assertRedirect();

    $event = Event::where('title', 'Photo Event')->first();
    expect($event->image)->not->toBeNull();
    Storage::disk('public')->assertExists($event->image);
});

test('replacing an event image deletes the old file', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $event = Event::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)->put(route('events.update', $event), [
        'title' => $event->title,
        'event_category_id' => $event->event_category_id,
        'event_date' => '2026-09-01 18:00:00',
        'image' => UploadedFile::fake()->image('first.jpg'),
    ]);

    $firstPath = $event->fresh()->image;
    Storage::disk('public')->assertExists($firstPath);

    $this->actingAs($user)->put(route('events.update', $event), [
        'title' => $event->title,
        'event_category_id' => $event->event_category_id,
        'event_date' => '2026-09-01 18:00:00',
        'image' => UploadedFile::fake()->image('second.jpg'),
    ]);

    $secondPath = $event->fresh()->image;
    Storage::disk('public')->assertMissing($firstPath);
    Storage::disk('public')->assertExists($secondPath);
});

test('users can update their own event', function () {
    $user = User::factory()->create();
    $event = Event::factory()->create(['user_id' => $user->id]);
    $category = EventCategory::factory()->create();

    $response = $this->actingAs($user)->put(route('events.update', $event), [
        'title' => 'Updated Title',
        'event_category_id' => $category->id,
        'location' => $event->location,
        'event_date' => '2026-09-05 18:00:00',
    ]);

    $response->assertRedirect();
    expect($event->fresh()->title)->toBe('Updated Title');
});

test('users cannot update another user\'s event', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $event = Event::factory()->create(['user_id' => $owner->id]);
    $category = EventCategory::factory()->create();

    $this->actingAs($other)->put(route('events.update', $event), [
        'title' => 'Hijacked',
        'event_category_id' => $category->id,
    ])->assertForbidden();
});

test('users can delete their own event', function () {
    $user = User::factory()->create();
    $event = Event::factory()->create(['user_id' => $user->id]);

    $response = $this->actingAs($user)->delete(route('events.destroy', $event));

    $response->assertRedirect();
    expect($event->fresh()->trashed())->toBeTrue();
});

test('users cannot delete another user\'s event', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $event = Event::factory()->create(['user_id' => $owner->id]);

    $this->actingAs($other)->delete(route('events.destroy', $event))
        ->assertForbidden();

    expect($event->fresh()->trashed())->toBeFalse();
});
