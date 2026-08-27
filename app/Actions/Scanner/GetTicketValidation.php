<?php

namespace App\Actions\Scanner;

use App\Models\Event;
use App\Models\TicketPurchase;

class GetTicketValidation
{
    /**
     * @return array{success: bool, status: string, message: string, data?: array{ticket_code: string, customer_name: string, event_name: string, ticket_type: string, checked_in_at?: string|null}}
     */
    public function handle(Event $event, string $ticketCode, bool $lockForUpdate = false): array
    {
        $query = TicketPurchase::query()
            ->with(['event:id,title', 'ticket:id,name'])
            ->where('uuid', $ticketCode);

        if ($lockForUpdate) {
            $query->lockForUpdate();
        }

        $purchase = $query->first();

        if (! $purchase) {
            return $this->response('INVALID', 'This QR code is not a valid EventPlus ticket.');
        }

        if ($purchase->event_id !== $event->id) {
            return $this->response('WRONG_EVENT', 'This ticket belongs to another event.');
        }

        if ($purchase->isCancelled()) {
            return $this->response('CANCELLED', 'This ticket has been cancelled.');
        }

        if ($purchase->checked_in) {
            return $this->response('ALREADY_USED', 'This ticket has already been checked in.', $purchase);
        }

        if (! $purchase->hasSuccessfulPayment()) {
            return $this->response('INVALID', 'This ticket payment has not been confirmed.');
        }

        return $this->response('VALID', 'Ticket is valid and ready for check-in.', $purchase);
    }

    /**
     * @return array{success: bool, status: string, message: string, data?: array{ticket_code: string, customer_name: string, event_name: string, ticket_type: string, checked_in_at?: string|null}}
     */
    private function response(string $status, string $message, ?TicketPurchase $purchase = null): array
    {
        $response = [
            'success' => $status === 'VALID',
            'status' => $status,
            'message' => $message,
        ];

        if ($purchase) {
            $response['data'] = [
                'ticket_code' => $purchase->uuid,
                'customer_name' => $purchase->email,
                'event_name' => $purchase->event->title,
                'ticket_type' => $purchase->ticket->name,
                'checked_in_at' => $purchase->checked_in_at?->toIso8601String(),
            ];
        }

        return $response;
    }
}
