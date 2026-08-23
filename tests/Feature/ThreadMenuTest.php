<?php

use App\Models\Thread;
use App\Models\ThreadFlag;
use App\Models\ThreadLabel;
use App\Models\ThreadType;
use App\Models\User;
use Database\Seeders\ThreadLabelSeeder;
use Inertia\Testing\AssertableInertia as Assert;

function threadFlag(string $name): ThreadFlag
{
    return ThreadFlag::factory()->create(['name' => $name]);
}

function threadType(string $name): ThreadType
{
    return ThreadType::create(['name' => $name]);
}

function threadLabel(string $name): ThreadLabel
{
    return ThreadLabel::factory()->create(['name' => $name]);
}

test('guests cannot view thread menus', function () {
    $this->get(route('thread-menus.index'))->assertRedirect(route('login'));
});

test('users can view thread menus with flags, thread types, and labels', function () {
    $user = User::factory()->create();
    threadFlag('menu');
    threadType('text');
    threadLabel('welcome');

    $thread = Thread::factory()->create([
        'user_id' => $user->id,
        'title_eng' => 'Main Menu',
        'title_sw' => 'Menyu Kuu',
        'step' => '1',
        'flag' => 'menu',
        'thread_type' => 'text',
        'label' => 'welcome',
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
            ->where('threads.0.label', 'welcome')
            ->where('threads.0.close_thread', false)
            ->where('flags.0', 'menu')
            ->where('threadTypes.0', 'text')
            ->where('labels.0', 'welcome'));
});

test('thread labels are seeded', function () {
    $this->seed(ThreadLabelSeeder::class);

    expect(ThreadLabel::query()->orderBy('id')->pluck('name')->all())->toBe([
        'welcome',
        'event_type',
        'event_category',
        'event_name',
        'ticket_no',
        'order_summary',
        'payment_method',
        'phone_number',
    ]);
});

test('users can create a thread menu', function () {
    $user = User::factory()->create();
    threadFlag('menu');
    threadType('text');
    threadLabel('welcome');

    $this->actingAs($user)->post(route('thread-menus.store'), [
        'title_eng' => 'Main Menu',
        'title_sw' => 'Menyu Kuu',
        'step' => '1',
        'flag' => 'menu',
        'thread_type' => 'text',
        'label' => 'welcome',
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
        'label' => 'welcome',
        'user_id' => $user->id,
        'close_thread' => false,
    ]);
});

test('a thread menu stores the thread type, flag, and label names', function () {
    $user = User::factory()->create();
    threadFlag('confirm');
    threadType('image');
    threadLabel('event_name');

    $this->actingAs($user)->post(route('thread-menus.store'), [
        'title_eng' => 'Photo Menu',
        'title_sw' => 'Menyu ya Picha',
        'step' => '2',
        'flag' => 'confirm',
        'thread_type' => 'image',
        'label' => 'event_name',
        'back_status' => true,
        'close_thread' => true,
    ])->assertRedirect();

    $this->assertDatabaseHas('threads', [
        'flag' => 'confirm',
        'thread_type' => 'image',
        'label' => 'event_name',
        'back_status' => true,
        'close_thread' => true,
    ]);
});

test('thread menus require valid flag, thread type, and label', function () {
    $user = User::factory()->create();
    threadType('text');

    $this->actingAs($user)->post(route('thread-menus.store'), [
        'title_eng' => 'Main Menu',
        'title_sw' => 'Menyu Kuu',
        'step' => '1',
        'flag' => 'unknown-flag',
        'thread_type' => 'unknown-type',
        'label' => 'unknown-label',
    ])->assertSessionHasErrors(['flag', 'thread_type', 'label']);

    $this->assertDatabaseCount('threads', 0);
});

test('users can update a thread menu', function () {
    $user = User::factory()->create();
    threadFlag('menu');
    threadFlag('input');
    threadType('text');
    threadType('video');
    threadLabel('welcome');
    threadLabel('event_type');

    $thread = Thread::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)->put(route('thread-menus.update', $thread), [
        'title_eng' => 'Updated Menu',
        'title_sw' => 'Menyu Iliyosasishwa',
        'step' => '3',
        'flag' => 'input',
        'thread_type' => 'video',
        'label' => 'event_type',
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
        'label' => 'event_type',
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
