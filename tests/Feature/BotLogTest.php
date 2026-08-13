<?php

use App\Models\BotLog;
use App\Models\Thread;
use App\Models\ThreadResponse;
use App\Models\User;

test('a bot log can be created with its relations', function () {
    $user = User::factory()->create();
    $thread = Thread::factory()->create(['user_id' => $user->id]);
    $reply = ThreadResponse::factory()->create(['thread_id' => $thread->id, 'user_id' => $user->id]);

    $log = BotLog::factory()->create([
        'phone_number' => '+255700000000',
        'thread_id' => $thread->id,
        'reply_id' => $reply->id,
        'status' => 'OPEN',
    ]);

    expect($log->phone_number)->toBe('+255700000000')
        ->and($log->thread->is($thread))->toBeTrue()
        ->and($log->reply->is($reply))->toBeTrue()
        ->and($log->status)->toBe('OPEN');
});

test('a bot log generates a uuid when created', function () {
    $log = BotLog::factory()->create();

    expect($log->uuid)->toBeString()
        ->and(strlen($log->uuid))->toBe(36);
});

test('a bot log can be soft deleted', function () {
    $log = BotLog::factory()->create();

    $log->delete();

    $this->assertSoftDeleted('bot_logs', ['id' => $log->id]);
    expect(BotLog::find($log->id))->toBeNull();
});

test('bot log scopes filter open and closed logs', function () {
    BotLog::factory()->create(['status' => 'OPEN']);
    BotLog::factory()->create(['status' => 'CLOSE']);

    expect(BotLog::open()->count())->toBe(1)
        ->and(BotLog::closed()->count())->toBe(1);
});
