<?php

namespace App\Models;

use Database\Factories\TicketPurchaseFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property int $event_id
 * @property int $event_ticket_id
 * @property int|null $payment_partner_id
 * @property string $email
 * @property string $phone_number
 * @property string $amount
 * @property string $status
 * @property string $uuid
 * @property Carbon|null $deleted_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['event_id', 'event_ticket_id', 'payment_partner_id', 'email', 'phone_number', 'amount', 'status', 'uuid'])]
class TicketPurchase extends Model
{
    /** @use HasFactory<TicketPurchaseFactory> */
    use HasFactory, SoftDeletes;

    protected static function booted(): void
    {
        static::creating(function (TicketPurchase $purchase) {
            $purchase->uuid ??= (string) Str::uuid();
        });
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(EventTicket::class, 'event_ticket_id');
    }

    public function paymentPartner(): BelongsTo
    {
        return $this->belongsTo(PaymentPartner::class);
    }

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
        ];
    }
}
