<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventTicket;
use App\Models\TicketPurchase;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TicketPurchaseController extends Controller
{
    public function store(Request $request, Event $event, EventTicket $ticket): RedirectResponse
    {
        abort_unless($event->is_active && $event->is_approved === 1, 404);
        abort_unless($ticket->event_id === $event->id, 404);

        $isFree = (float) $ticket->price === 0.0;

        $validated = $request->validate([
            'email' => ['required', 'email', 'max:255'],
            'phone_number' => ['required', 'string', 'max:255'],
            'payment_partner_id' => [
                Rule::requiredIf(! $isFree),
                'nullable',
                Rule::exists('payment_partners', 'id')->where('is_active', true),
            ],
        ]);

        TicketPurchase::create([
            'event_id' => $event->id,
            'event_ticket_id' => $ticket->id,
            'payment_partner_id' => $validated['payment_partner_id'] ?? null,
            'email' => $validated['email'],
            'phone_number' => $validated['phone_number'],
            'amount' => $ticket->price,
            'status' => 'pending',
        ]);

        return back()->with('toast', [
            'type' => 'success',
            'message' => $isFree
                ? 'Your spot is reserved. See you there!'
                : 'Booking received. We\'ll reach out to confirm your payment.',
        ]);
    }
}
