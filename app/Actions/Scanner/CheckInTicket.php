<?php

namespace App\Actions\Scanner;

use App\Models\Event;
use App\Models\TicketPurchase;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class CheckInTicket
{
    public function __construct(private GetTicketValidation $getTicketValidation) {}

    /**
     * @return array{success: bool, status: string, message: string, data?: array{ticket_code: string, customer_name: string, event_name: string, ticket_type: string, checked_in_at?: string|null}}
     */
    public function handle(Event $event, User $user, string $ticketCode): array
    {
        return DB::transaction(function () use ($event, $user, $ticketCode): array {
            $validation = $this->getTicketValidation->handle($event, $ticketCode, true);

            if ($validation['status'] !== 'VALID') {
                return $validation;
            }

            $purchase = TicketPurchase::query()
                ->where('uuid', $ticketCode)
                ->lockForUpdate()
                ->firstOrFail();

            $purchase->forceFill([
                'checked_in' => true,
                'checked_in_at' => now(),
                'checked_in_by' => $user->id,
            ])->save();

            $validation['success'] = true;
            $validation['status'] = 'CHECKED_IN';
            $validation['message'] = 'Check-in successful.';
            $validation['data']['checked_in_at'] = $purchase->checked_in_at?->toIso8601String();

            return $validation;
        });
    }
}
