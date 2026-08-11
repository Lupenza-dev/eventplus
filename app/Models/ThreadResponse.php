<?php

namespace App\Models;

use Database\Factories\ThreadResponseFactory;
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
 * @property string $name_eng
 * @property string $name_sw
 * @property string $order_no
 * @property int $thread_id
 * @property int $user_id
 * @property string $uuid
 * @property Carbon|null $deleted_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name_eng', 'name_sw', 'order_no', 'thread_id', 'user_id', 'uuid'])]
class ThreadResponse extends Model
{
    /** @use HasFactory<ThreadResponseFactory> */
    use HasFactory, SoftDeletes;

    protected static function booted(): void
    {
        static::creating(function (ThreadResponse $response) {
            $response->uuid ??= (string) Str::uuid();
        });
    }

    public function thread(): BelongsTo
    {
        return $this->belongsTo(Thread::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function links(): HasMany
    {
        return $this->hasMany(ResponseThreadLink::class);
    }
}
