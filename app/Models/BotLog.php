<?php

namespace App\Models;

use Database\Factories\BotLogFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property string $phone_number
 * @property string|null $message_id
 * @property string|null $text
 * @property int|null $reply_id
 * @property int|null $thread_id
 * @property string|null $step
 * @property string|null $type
 * @property string $status
 * @property string $uuid
 * @property Carbon|null $deleted_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['phone_number', 'message_id', 'text', 'reply_id', 'thread_id', 'step', 'type', 'status', 'uuid'])]
class BotLog extends Model
{
    /** @use HasFactory<BotLogFactory> */
    use HasFactory, SoftDeletes;

    protected static function booted(): void
    {
        static::creating(function (BotLog $log) {
            $log->uuid ??= (string) Str::uuid();
        });
    }

    public function thread(): BelongsTo
    {
        return $this->belongsTo(Thread::class);
    }

    public function reply(): BelongsTo
    {
        return $this->belongsTo(ThreadResponse::class, 'reply_id');
    }

    public function scopeOpen($query)
    {
        return $query->where('status', 'OPEN');
    }

    public function scopeClosed($query)
    {
        return $query->where('status', 'CLOSE');
    }
}
