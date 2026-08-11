<?php

use App\Models\ResponseThreadLink;
use App\Models\Thread;
use App\Models\ThreadResponse;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests cannot view response thread links', function () {
    $this->get(route('response-thread-links.index'))
        ->assertRedirect(route('login'));
});

test('users can view response thread links with unlinked responses and threads', function () {
    $user = User::factory()->create();
    $thread = Thread::factory()->create(['user_id' => $user->id, 'title_eng' => 'Tickets']);
    $linkedResponse = ThreadResponse::factory()->create([
        'thread_id' => $thread->id,
        'user_id' => $user->id,
        'name_eng' => 'Buy tickets',
    ]);
    $unlinkedResponse = ThreadResponse::factory()->create([
        'thread_id' => $thread->id,
        'user_id' => $user->id,
        'name_eng' => 'View events',
    ]);
    ResponseThreadLink::factory()->create([
        'thread_response_id' => $linkedResponse->id,
        'thread_id' => $thread->id,
        'user_id' => $user->id,
    ]);

    $this->actingAs($user)->get(route('response-thread-links.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('bot-settings/response-thread-links')
            ->has('links', 1)
            ->where('links.0.thread_response.name_eng', 'Buy tickets')
            ->where('links.0.thread.title_eng', 'Tickets')
            ->has('responses', 1)
            ->where('responses.0.name_eng', 'View events')
            ->has('threads', 1));
});

test('users can create a response thread link', function () {
    $user = User::factory()->create();
    $response = ThreadResponse::factory()->create(['user_id' => $user->id]);
    $thread = Thread::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)->post(route('response-thread-links.store'), [
        'thread_response_id' => $response->id,
        'thread_id' => $thread->id,
    ])
        ->assertRedirect()
        ->assertSessionHas('toast');

    $this->assertDatabaseHas('response_thread_links', [
        'thread_response_id' => $response->id,
        'thread_id' => $thread->id,
        'user_id' => $user->id,
    ]);
});

test('a response that is already linked cannot be linked again', function () {
    $user = User::factory()->create();
    $response = ThreadResponse::factory()->create(['user_id' => $user->id]);
    $firstThread = Thread::factory()->create(['user_id' => $user->id]);
    $secondThread = Thread::factory()->create(['user_id' => $user->id]);
    ResponseThreadLink::factory()->create([
        'thread_response_id' => $response->id,
        'thread_id' => $firstThread->id,
        'user_id' => $user->id,
    ]);

    $this->actingAs($user)->post(route('response-thread-links.store'), [
        'thread_response_id' => $response->id,
        'thread_id' => $secondThread->id,
    ])->assertSessionHasErrors(['thread_response_id']);

    $this->assertDatabaseCount('response_thread_links', 1);
});

test('users can update a response thread link', function () {
    $user = User::factory()->create();
    $response = ThreadResponse::factory()->create(['user_id' => $user->id]);
    $firstThread = Thread::factory()->create(['user_id' => $user->id]);
    $secondThread = Thread::factory()->create(['user_id' => $user->id]);
    $link = ResponseThreadLink::factory()->create([
        'thread_response_id' => $response->id,
        'thread_id' => $firstThread->id,
        'user_id' => $user->id,
    ]);

    $this->actingAs($user)->put(route('response-thread-links.update', $link), [
        'thread_response_id' => $response->id,
        'thread_id' => $secondThread->id,
    ])
        ->assertRedirect()
        ->assertSessionHas('toast');

    $this->assertDatabaseHas('response_thread_links', [
        'id' => $link->id,
        'thread_id' => $secondThread->id,
    ]);
});

test('users can soft delete a response thread link', function () {
    $user = User::factory()->create();
    $link = ResponseThreadLink::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)->delete(route('response-thread-links.destroy', $link))
        ->assertRedirect()
        ->assertSessionHas('toast');

    $this->assertSoftDeleted('response_thread_links', ['id' => $link->id]);
});

test('a soft deleted link frees its response for linking again', function () {
    $user = User::factory()->create();
    $response = ThreadResponse::factory()->create(['user_id' => $user->id]);
    $thread = Thread::factory()->create(['user_id' => $user->id]);
    $link = ResponseThreadLink::factory()->create([
        'thread_response_id' => $response->id,
        'thread_id' => $thread->id,
        'user_id' => $user->id,
    ]);
    $link->delete();

    $this->actingAs($user)->post(route('response-thread-links.store'), [
        'thread_response_id' => $response->id,
        'thread_id' => $thread->id,
    ])
        ->assertRedirect()
        ->assertSessionHas('toast');

    $this->assertDatabaseCount('response_thread_links', 2);
});
