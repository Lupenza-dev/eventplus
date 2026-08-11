<?php

use App\Models\Thread;
use App\Models\ThreadFlag;
use App\Models\ThreadType;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function threadFlag(string $name): ThreadFlag
{
    return ThreadFlag::factory()->create(['name' => $name]);
}

function threadType(string $name): ThreadType
{
    return ThreadType::create(['name' => $name]);
}

test('guests cannot view thread menus', function () {
    $this->get(route('thread-menus.index'))->assertRedirect(route('login'));
});

test('users can view thread menus with flags and thread types', function () {
    $user = User::factory()->create();
    threadFlag('menu');
    threadType('text');

    $thread = Thread::factory()->create([
        'user_id' => $user->id,
        'title_eng' => 'Main Menu',
        'title_sw' => 'Menyu Kuu',
        'step' => '1',
        'flag' => 'menu',
        'thread_type' => 'text',
        'close_thread' => false,
    ]);

    $this->actingAs($user)->get(route('thread-menus.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('bot-settings/thread-menus')
            ->has('threads', 1)
            ->where('threads.0.title_eng', 'Main Menu')
            ->where('threads.0.title_sw', 'Menyu Kuu')
            ->where('threads.0.flag', 'menu')
            ->where('threads.0.thread_type', 'text')
            ->where('threads.0.close_thread', false)
            ->where('flags.0', 'menu')
            ->where('threadTypes.0', 'text'));
});

test('users can create a thread menu', function () {
    $user = User::factory()->create();
    threadFlag('menu');
    threadType('text');

    $this->actingAs($user)->post(route('thread-menus.store'), [
        'title_eng' => 'Main Menu',
        'title_sw' => 'Menyu Kuu',
        'step' => '1',
        'flag' => 'menu',
        'thread_type' => 'text',
        'back_status' => false,
        'close_thread' => false,
    ])
        ->assertRedirect()
        ->assertSessionHas('toast');

    $this->assertDatabaseHas('threads', [
        'title_eng' => 'Main Menu',
        'title_sw' => 'Menyu Kuu',
        'step' => '1',
        'flag' => 'menu',
        'thread_type' => 'text',
        'user_id' => $user->id,
        'close_thread' => false,
    ]);
});

test('a thread menu stores the thread type name and flag name', function () {
    $user = User::factory()->create();
    threadFlag('confirm');
    threadType('image');

    $this->actingAs($user)->post(route('thread-menus.store'), [
        'title_eng' => 'Photo Menu',
        'title_sw' => 'Menyu ya Picha',
        'step' => '2',
        'flag' => 'confirm',
        'thread_type' => 'image',
        'back_status' => true,
        'close_thread' => true,
    ])->assertRedirect();

    $this->assertDatabaseHas('threads', [
        'flag' => 'confirm',
        'thread_type' => 'image',
        'back_status' => true,
        'close_thread' => true,
    ]);
});

test('thread menus require valid flag and thread type', function () {
    $user = User::factory()->create();
    threadType('text');

    $this->actingAs($user)->post(route('thread-menus.store'), [
        'title_eng' => 'Main Menu',
        'title_sw' => 'Menyu Kuu',
        'step' => '1',
        'flag' => 'unknown-flag',
        'thread_type' => 'unknown-type',
    ])->assertSessionHasErrors(['flag', 'thread_type']);

    $this->assertDatabaseCount('threads', 0);
});

test('users can update a thread menu', function () {
    $user = User::factory()->create();
    threadFlag('menu');
    threadFlag('input');
    threadType('text');
    threadType('video');

    $thread = Thread::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)->put(route('thread-menus.update', $thread), [
        'title_eng' => 'Updated Menu',
        'title_sw' => 'Menyu Iliyosasishwa',
        'step' => '3',
        'flag' => 'input',
        'thread_type' => 'video',
        'back_status' => false,
        'close_thread' => true,
    ])
        ->assertRedirect()
        ->assertSessionHas('toast');

    $this->assertDatabaseHas('threads', [
        'id' => $thread->id,
        'title_eng' => 'Updated Menu',
        'flag' => 'input',
        'thread_type' => 'video',
        'close_thread' => true,
    ]);
});

test('users can soft delete a thread menu', function () {
    $user = User::factory()->create();
    $thread = Thread::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)->delete(route('thread-menus.destroy', $thread))
        ->assertRedirect()
        ->assertSessionHas('toast');

    $this->assertSoftDeleted('threads', ['id' => $thread->id]);
});
