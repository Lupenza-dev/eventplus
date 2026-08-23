<?php

namespace App\Models;

use Database\Factories\ThreadFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property string $title_eng
 * @property string $title_sw
 * @property string $step
 * @property string|null $flag
 * @property string|null $thread_type
 * @property string|null $label
 * @property bool $back_status
 * @property bool $close_thread
 * @property int $user_id
 * @property string $uuid
 * @property Carbon|null $deleted_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['title_eng', 'title_sw', 'step', 'flag', 'thread_type', 'label', 'back_status', 'close_thread', 'user_id', 'uuid'])]
class Thread extends Model
{
    /** @use HasFactory<ThreadFactory> */
    use HasFactory, SoftDeletes;

    protected static function booted(): void
    {
        static::creating(function (Thread $thread) {
            $thread->uuid ??= (string) Str::uuid();
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function responses(): HasMany
    {
        return $this->hasMany(ThreadResponse::class);
    }

    public function threadLinks(): HasMany
    {
        return $this->hasMany(ThreadLink::class, 'thread_id');
    }

    protected function casts(): array
    {
        return [
            'back_status' => 'boolean',
            'close_thread' => 'boolean',
        ];
    }
}
