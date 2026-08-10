<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventTicket;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EventTicketController extends Controller
{
    /**
     * Display a listing of the event's tickets.
     */
    public function index(Request $request, Event $event): Response
    {
        $this->authorizeOwner($request, $event);

        $event->load('category:id,name');

        return Inertia::render('events/tickets', [
            'event' => [
                'id' => $event->id,
                'title' => $event->title,
                'description' => $event->description,
                'location' => $event->location,
                'event_date' => $event->event_date,
                'start_date' => $event->start_date,
                'end_date' => $event->end_date,
                'is_paid_event' => $event->is_paid_event,
                'image_url' => $event->image_url,
                'category' => $event->category?->name,
            ],
            'tickets' => $event->tickets()
                ->latest()
                ->get(['id', 'name', 'price', 'quantity', 'description', 'created_at']),
        ]);
    }

    /**
     * Store a newly created ticket for the event.
     */
    public function store(Request $request, Event $event): RedirectResponse
    {
        $this->authorizeOwner($request, $event);

        $validated = $request->validate($this->rules());

        $event->tickets()->create($validated);

        return back()->with('toast', ['type' => 'success', 'message' => 'Ticket created.']);
    }

    /**
     * Update the specified ticket.
     */
    public function update(Request $request, Event $event, EventTicket $ticket): RedirectResponse
    {
        $this->authorizeOwner($request, $event);
        abort_unless($ticket->event_id === $event->id, 404);

        $ticket->update($request->validate($this->rules()));

        return back()->with('toast', ['type' => 'success', 'message' => 'Ticket updated.']);
    }

    /**
     * Soft delete the specified ticket.
     */
    public function destroy(Request $request, Event $event, EventTicket $ticket): RedirectResponse
    {
        $this->authorizeOwner($request, $event);
        abort_unless($ticket->event_id === $event->id, 404);

        $ticket->delete();

        return back()->with('toast', ['type' => 'success', 'message' => 'Ticket deleted.']);
    }

    private function authorizeOwner(Request $request, Event $event): void
    {
        abort_unless($event->user_id === $request->user()->id, 403);
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    private function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'price' => ['required', 'numeric', 'min:0', 'max:99999999.99'],
            'quantity' => ['required', 'integer', 'min:0'],
            'description' => ['nullable', 'string'],
        ];
    }
}
