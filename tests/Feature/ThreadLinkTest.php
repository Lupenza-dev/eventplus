<?php

use App\Models\Thread;
use App\Models\ThreadLink;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests cannot view thread links', function () {
    $this->get(route('thread-links.index'))
        ->assertRedirect(route('login'));
});

test('users can view thread links with unlinked threads', function () {
    $user = User::factory()->create();
    $source = Thread::factory()->create(['user_id' => $user->id, 'title_eng' => 'Main Menu']);
    $destination = Thread::factory()->create(['user_id' => $user->id, 'title_eng' => 'Tickets']);
    $unlinked = Thread::factory()->create(['user_id' => $user->id, 'title_eng' => 'Help']);
    ThreadLink::factory()->create([
        'thread_id' => $source->id,
        'linked_thread_id' => $destination->id,
        'user_id' => $user->id,
    ]);

    $this->actingAs($user)->get(route('thread-links.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('bot-settings/thread-links')
            ->has('links', 1)
            ->where('links.0.thread.title_eng', 'Main Menu')
            ->where('links.0.linked_thread.title_eng', 'Tickets')
            ->has('threads', 2)
            ->where('threads.0.title_eng', 'Tickets')
            ->where('threads.1.title_eng', 'Help'));
});

test('users can create a thread link', function () {
    $user = User::factory()->create();
    $source = Thread::factory()->create(['user_id' => $user->id]);
    $destination = Thread::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)->post(route('thread-links.store'), [
        'thread_id' => $source->id,
        'linked_thread_id' => $destination->id,
    ])
        ->assertRedirect()
        ->assertSessionHas('toast');

    $this->assertDatabaseHas('thread_links', [
        'thread_id' => $source->id,
        'linked_thread_id' => $destination->id,
        'user_id' => $user->id,
    ]);
});

test('a thread that is already linked cannot be linked again', function () {
    $user = User::factory()->create();
    $source = Thread::factory()->create(['user_id' => $user->id]);
    $firstDestination = Thread::factory()->create(['user_id' => $user->id]);
    $secondDestination = Thread::factory()->create(['user_id' => $user->id]);
    ThreadLink::factory()->create([
        'thread_id' => $source->id,
        'linked_thread_id' => $firstDestination->id,
        'user_id' => $user->id,
    ]);

    $this->actingAs($user)->post(route('thread-links.store'), [
        'thread_id' => $source->id,
        'linked_thread_id' => $secondDestination->id,
    ])->assertSessionHasErrors(['thread_id']);

    $this->assertDatabaseCount('thread_links', 1);
});

test('a thread cannot be linked to itself', function () {
    $user = User::factory()->create();
    $source = Thread::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)->post(route('thread-links.store'), [
        'thread_id' => $source->id,
        'linked_thread_id' => $source->id,
    ])->assertSessionHasErrors(['linked_thread_id']);

    $this->assertDatabaseCount('thread_links', 0);
});

test('users can update a thread link', function () {
    $user = User::factory()->create();
    $source = Thread::factory()->create(['user_id' => $user->id]);
    $firstDestination = Thread::factory()->create(['user_id' => $user->id]);
    $secondDestination = Thread::factory()->create(['user_id' => $user->id]);
    $link = ThreadLink::factory()->create([
        'thread_id' => $source->id,
        'linked_thread_id' => $firstDestination->id,
        'user_id' => $user->id,
    ]);

    $this->actingAs($user)->put(route('thread-links.update', $link), [
        'thread_id' => $source->id,
        'linked_thread_id' => $secondDestination->id,
    ])
        ->assertRedirect()
        ->assertSessionHas('toast');

    $this->assertDatabaseHas('thread_links', [
        'id' => $link->id,
        'linked_thread_id' => $secondDestination->id,
    ]);
});

test('users can soft delete a thread link', function () {
    $user = User::factory()->create();
    $link = ThreadLink::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)->delete(route('thread-links.destroy', $link))
        ->assertRedirect()
        ->assertSessionHas('toast');

    $this->assertSoftDeleted('thread_links', ['id' => $link->id]);
});

test('a soft deleted link frees its thread for linking again', function () {
    $user = User::factory()->create();
    $source = Thread::factory()->create(['user_id' => $user->id]);
    $destination = Thread::factory()->create(['user_id' => $user->id]);
    $link = ThreadLink::factory()->create([
        'thread_id' => $source->id,
        'linked_thread_id' => $destination->id,
        'user_id' => $user->id,
    ]);
    $link->delete();

    $this->actingAs($user)->post(route('thread-links.store'), [
        'thread_id' => $source->id,
        'linked_thread_id' => $destination->id,
    ])
        ->assertRedirect()
        ->assertSessionHas('toast');

    $this->assertDatabaseCount('thread_links', 2);
});
