<?php

namespace App\Models;

use Database\Factories\EventTicketFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property int $event_id
 * @property string $name
 * @property string $price
 * @property int $quantity
 * @property string|null $description
 * @property string|null $design_image
 * @property string|null $design_image_url
 * @property string $qr_code_x
 * @property string $qr_code_y
 * @property string $qr_code_width
 * @property string $qr_code_height
 * @property string $uuid
 * @property Carbon|null $deleted_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'event_id',
    'name',
    'price',
    'quantity',
    'description',
    'design_image',
    'qr_code_x',
    'qr_code_y',
    'qr_code_width',
    'qr_code_height',
    'uuid',
])]
class EventTicket extends Model
{
    /** @use HasFactory<EventTicketFactory> */
    use HasFactory, SoftDeletes;

    protected static function booted(): void
    {
        static::creating(function (EventTicket $ticket) {
            $ticket->uuid ??= (string) Str::uuid();
        });
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    protected function designImageUrl(): Attribute
    {
        return Attribute::get(fn (): ?string => $this->design_image
            ? Storage::disk('public')->url($this->design_image)
            : null);
    }

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'quantity' => 'integer',
            'qr_code_x' => 'decimal:2',
            'qr_code_y' => 'decimal:2',
            'qr_code_width' => 'decimal:2',
            'qr_code_height' => 'decimal:2',
        ];
    }
}
