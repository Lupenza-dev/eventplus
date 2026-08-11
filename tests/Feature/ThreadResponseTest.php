<?php

use App\Models\Thread;
use App\Models\ThreadResponse;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests cannot view thread responses', function () {
    $thread = Thread::factory()->create();

    $this->get(route('thread-responses.index', $thread))
        ->assertRedirect(route('login'));
});

test('users can view the responses of a thread', function () {
    $user = User::factory()->create();
    $thread = Thread::factory()->create(['user_id' => $user->id]);
    ThreadResponse::factory()->create([
        'thread_id' => $thread->id,
        'user_id' => $user->id,
        'name_eng' => 'Buy tickets',
        'name_sw' => 'Nunua tiketi',
        'order_no' => '1',
    ]);

    $this->actingAs($user)->get(route('thread-responses.index', $thread))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('bot-settings/thread-responses')
            ->where('thread.id', $thread->id)
            ->where('thread.thread_type', $thread->thread_type)
            ->has('responses', 1)
            ->where('responses.0.name_eng', 'Buy tickets')
            ->where('responses.0.name_sw', 'Nunua tiketi')
            ->where('responses.0.order_no', '1'));
});

test('users can create a thread response', function () {
    $user = User::factory()->create();
    $thread = Thread::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)->post(route('thread-responses.store', $thread), [
        'name_eng' => 'Buy tickets',
        'name_sw' => 'Nunua tiketi',
        'order_no' => '2',
    ])
        ->assertRedirect()
        ->assertSessionHas('toast');

    $this->assertDatabaseHas('thread_responses', [
        'thread_id' => $thread->id,
        'user_id' => $user->id,
        'name_eng' => 'Buy tickets',
        'name_sw' => 'Nunua tiketi',
        'order_no' => '2',
    ]);
});

test('thread responses require a name in both languages and an order', function () {
    $user = User::factory()->create();
    $thread = Thread::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)->post(route('thread-responses.store', $thread), [])
        ->assertSessionHasErrors(['name_eng', 'name_sw', 'order_no']);

    $this->assertDatabaseCount('thread_responses', 0);
});

test('users can update a thread response', function () {
    $user = User::factory()->create();
    $thread = Thread::factory()->create(['user_id' => $user->id]);
    $response = ThreadResponse::factory()->create([
        'thread_id' => $thread->id,
        'user_id' => $user->id,
    ]);

    $this->actingAs($user)->put(route('thread-responses.update', [$thread, $response]), [
        'name_eng' => 'View events',
        'name_sw' => 'Tazama matukio',
        'order_no' => '3',
    ])
        ->assertRedirect()
        ->assertSessionHas('toast');

    $this->assertDatabaseHas('thread_responses', [
        'id' => $response->id,
        'name_eng' => 'View events',
        'name_sw' => 'Tazama matukio',
        'order_no' => '3',
    ]);
});

test('users can soft delete a thread response', function () {
    $user = User::factory()->create();
    $thread = Thread::factory()->create(['user_id' => $user->id]);
    $response = ThreadResponse::factory()->create([
        'thread_id' => $thread->id,
        'user_id' => $user->id,
    ]);

    $this->actingAs($user)->delete(route('thread-responses.destroy', [$thread, $response]))
        ->assertRedirect()
        ->assertSessionHas('toast');

    $this->assertSoftDeleted('thread_responses', ['id' => $response->id]);
});

test('a thread response from another thread cannot be updated', function () {
    $user = User::factory()->create();
    $thread = Thread::factory()->create(['user_id' => $user->id]);
    $otherThread = Thread::factory()->create(['user_id' => $user->id]);
    $response = ThreadResponse::factory()->create(['thread_id' => $otherThread->id]);

    $this->actingAs($user)
        ->put(route('thread-responses.update', [$thread, $response]), [
            'name_eng' => 'View events',
            'name_sw' => 'Tazama matukio',
            'order_no' => '3',
        ])
        ->assertNotFound();
});

test('a thread response from another thread cannot be deleted', function () {
    $user = User::factory()->create();
    $thread = Thread::factory()->create(['user_id' => $user->id]);
    $otherThread = Thread::factory()->create(['user_id' => $user->id]);
    $response = ThreadResponse::factory()->create(['thread_id' => $otherThread->id]);

    $this->actingAs($user)
        ->delete(route('thread-responses.destroy', [$thread, $response]))
        ->assertNotFound();

    $this->assertDatabaseHas('thread_responses', ['id' => $response->id]);
});
