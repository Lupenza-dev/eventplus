<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventTicket;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
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
                ->get([
                    'id',
                    'name',
                    'price',
                    'quantity',
                    'description',
                    'design_image',
                    'qr_code_x',
                    'qr_code_y',
                    'qr_code_width',
                    'qr_code_height',
                    'created_at',
                ])
                ->map(fn (EventTicket $ticket) => $ticket->append('design_image_url')),
        ]);
    }

    /**
     * Show the form for creating a new ticket.
     */
    public function create(Request $request, Event $event): Response
    {
        $this->authorizeOwner($request, $event);

        return Inertia::render('events/tickets/create', [
            'event' => [
                'id' => $event->id,
                'title' => $event->title,
            ],
        ]);
    }

    /**
     * Store a newly created ticket for the event.
     */
    public function store(Request $request, Event $event): RedirectResponse
    {
        $this->authorizeOwner($request, $event);

        $validated = $this->normalizeQrPlacement($request->validate($this->rules()));

        if ($request->hasFile('design_image')) {
            $validated['design_image'] = $request->file('design_image')->store('tickets', 'public');
        }

        $event->tickets()->create($validated);

        return to_route('events.tickets.index', $event)
            ->with('toast', ['type' => 'success', 'message' => 'Ticket created.']);
    }

    /**
     * Update the specified ticket.
     */
    public function update(Request $request, Event $event, EventTicket $ticket): RedirectResponse
    {
        $this->authorizeOwner($request, $event);
        abort_unless($ticket->event_id === $event->id, 404);

        $validated = $this->normalizeQrPlacement($request->validate($this->rules()));

        if ($request->hasFile('design_image')) {
            if ($ticket->design_image) {
                Storage::disk('public')->delete($ticket->design_image);
            }

            $validated['design_image'] = $request->file('design_image')->store('tickets', 'public');
        }

        $ticket->update($validated);

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
            'design_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:1900'],
            'qr_code_x' => ['required', 'numeric', 'min:0', 'max:95'],
            'qr_code_y' => ['required', 'numeric', 'min:0', 'max:95'],
            'qr_code_width' => ['required', 'numeric', 'min:5', 'max:100'],
            'qr_code_height' => ['required', 'numeric', 'min:5', 'max:100'],
        ];
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    private function normalizeQrPlacement(array $validated): array
    {
        $width = (float) $validated['qr_code_width'];
        $height = (float) $validated['qr_code_height'];

        $validated['qr_code_x'] = min((float) $validated['qr_code_x'], 100 - $width);
        $validated['qr_code_y'] = min((float) $validated['qr_code_y'], 100 - $height);

        return $validated;
    }
}
