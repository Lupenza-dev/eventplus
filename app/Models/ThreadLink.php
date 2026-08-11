<?php

namespace App\Models;

use Database\Factories\ThreadLinkFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property int $thread_id
 * @property int $linked_thread_id
 * @property int $user_id
 * @property string $uuid
 * @property Carbon|null $deleted_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['thread_id', 'linked_thread_id', 'user_id', 'uuid'])]
class ThreadLink extends Model
{
    /** @use HasFactory<ThreadLinkFactory> */
    use HasFactory, SoftDeletes;

    protected static function booted(): void
    {
        static::creating(function (ThreadLink $link) {
            $link->uuid ??= (string) Str::uuid();
        });
    }

    public function thread(): BelongsTo
    {
        return $this->belongsTo(Thread::class, 'thread_id');
    }

    public function linkedThread(): BelongsTo
    {
        return $this->belongsTo(Thread::class, 'linked_thread_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
