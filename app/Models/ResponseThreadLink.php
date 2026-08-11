<?php

namespace App\Models;

use Database\Factories\ResponseThreadLinkFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property int $thread_response_id
 * @property int $thread_id
 * @property int $user_id
 * @property string $uuid
 * @property Carbon|null $deleted_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['thread_response_id', 'thread_id', 'user_id', 'uuid'])]
class ResponseThreadLink extends Model
{
    /** @use HasFactory<ResponseThreadLinkFactory> */
    use HasFactory, SoftDeletes;

    protected static function booted(): void
    {
        static::creating(function (ResponseThreadLink $link) {
            $link->uuid ??= (string) Str::uuid();
        });
    }

    public function threadResponse(): BelongsTo
    {
        return $this->belongsTo(ThreadResponse::class);
    }

    public function thread(): BelongsTo
    {
        return $this->belongsTo(Thread::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
