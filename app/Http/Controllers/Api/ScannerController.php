<?php

namespace App\Http\Controllers\Api;

use App\Actions\Scanner\CheckInTicket;
use App\Actions\Scanner\GetTicketValidation;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\ScannerTicketRequest;
use App\Models\Event;
use App\Models\TicketPurchase;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ScannerController extends Controller
{
    public function dashboard(Request $request): JsonResponse
    {
        $events = $this->scannableEvents($request->user());

        $eventIds = (clone $events)->pluck('id');
        $todayEvents = (clone $events)
            ->where(function (Builder $query): void {
                $query->whereDate('event_date', today())
                    ->orWhereDate('start_date', today());
            })
            ->count();

        $scans = TicketPurchase::query()->where('checked_in_by', $request->user()->id);

        return response()->json([
            'success' => true,
            'data' => [
                'today_events' => $todayEvents,
                'tickets_scanned' => (clone $scans)->count(),
                'successful_check_ins' => (clone $scans)->where('checked_in', true)->count(),
                'rejected' => 0,
                'recent_activity' => TicketPurchase::query()
                    ->whereIn('event_id', $eventIds)
                    ->where('checked_in', true)
                    ->with(['event:id,title', 'ticket:id,name'])
                    ->latest('checked_in_at')
                    ->limit(8)
                    ->get()
                    ->map(fn (TicketPurchase $purchase): array => $this->checkInData($purchase))
                    ->values(),
            ],
        ]);
    }

    public function events(Request $request): JsonResponse
    {
        $events = $this->scannableEvents($request->user())
            ->withCount('purchases as total_tickets')
            ->withCount([
                'purchases as checked_in' => fn (Builder $query) => $query->where('checked_in', true),
            ])
            ->latest('event_date')
            ->get(['id', 'title', 'location', 'event_date', 'start_date', 'end_date', 'is_active']);

        return response()->json([
            'success' => true,
            'data' => $events->map(fn (Event $event): array => $this->eventData($event))->values(),
        ]);
    }

    public function show(Request $request, Event $event): JsonResponse
    {
        $this->ensureEventAccess($request->user(), $event);

        $event->loadCount('purchases as total_tickets')->loadCount([
            'purchases as checked_in' => fn (Builder $query) => $query->where('checked_in', true),
        ]);

        return response()->json(['success' => true, 'data' => $this->eventData($event)]);
    }

    public function checkIns(Request $request, Event $event): JsonResponse
    {
        $this->ensureEventAccess($request->user(), $event);

        $checkIns = $event->purchases()
            ->where('checked_in', true)
            ->with(['ticket:id,name'])
            ->latest('checked_in_at')
            ->limit(20)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $checkIns->map(fn (TicketPurchase $purchase): array => $this->checkInData($purchase))->values(),
        ]);
    }

    public function validateTicket(ScannerTicketRequest $request, GetTicketValidation $getTicketValidation): JsonResponse
    {
        $event = Event::query()->findOrFail($request->validated('event_id'));
        $this->ensureEventAccess($request->user(), $event);

        return response()->json($getTicketValidation->handle($event, $request->validated('ticket_code')));
    }

    public function checkIn(ScannerTicketRequest $request, CheckInTicket $checkInTicket): JsonResponse
    {
        $event = Event::query()->findOrFail($request->validated('event_id'));
        $this->ensureEventAccess($request->user(), $event);

        return response()->json($checkInTicket->handle($event, $request->user(), $request->validated('ticket_code')));
    }

    private function ensureEventAccess(User $user, Event $event): void
    {
        abort_unless($this->scannableEvents($user)->whereKey($event)->exists(), 403);
    }

    /** @return Builder<Event> */
    private function scannableEvents(User $user): Builder
    {
        $events = Event::query()->where('is_active', true)->where('is_approved', 1);

        if ($user->hasRole('Admin')) {
            return $events;
        }

        return $events->where(function (Builder $query) use ($user): void {
            $query->where('user_id', $user->id)
                ->orWhereIn('vendor_id', $user->vendors()->select('vendors.id'));
        });
    }

    /** @return array{id: int, name: string, venue: string|null, event_date: string|null, start_time: string|null, status: string, total_tickets: int, checked_in: int, remaining: int} */
    private function eventData(Event $event): array
    {
        $totalTickets = (int) $event->getAttribute('total_tickets');
        $checkedIn = (int) $event->getAttribute('checked_in');

        return [
            'id' => $event->id,
            'name' => $event->title,
            'venue' => $event->location,
            'event_date' => ($event->event_date ?? $event->start_date)?->toDateString(),
            'start_time' => $event->start_date?->format('H:i'),
            'status' => $event->is_active ? 'ACTIVE' : 'INACTIVE',
            'total_tickets' => $totalTickets,
            'checked_in' => $checkedIn,
            'remaining' => max($totalTickets - $checkedIn, 0),
        ];
    }

    /** @return array{ticket_code: string, customer_name: string, ticket_type: string, checked_in_at: string|null, status: string, event_name?: string} */
    private function checkInData(TicketPurchase $purchase): array
    {
        return [
            'ticket_code' => $purchase->uuid,
            'customer_name' => $purchase->email,
            'ticket_type' => $purchase->ticket->name,
            'checked_in_at' => $purchase->checked_in_at?->toIso8601String(),
            'status' => 'SUCCESS',
            ...($purchase->relationLoaded('event') ? ['event_name' => $purchase->event->title] : []),
        ];
    }
}
