<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventSubscriber;
use App\Models\Vendor;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TicketSoldController extends Controller
{
    /**
     * Display tickets sold (event subscriptions) with filters.
     */
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
            'event_id' => ['nullable', 'integer', 'exists:events,id'],
            'vendor_id' => ['nullable', 'integer', 'exists:vendors,id'],
        ]);

        $sales = EventSubscriber::query()
            ->with([
                'event:id,title,vendor_id',
                'event.vendor:id,name',
                'subscriber:id,name,phone_number',
            ])
            ->when($filters['date_from'] ?? null, fn ($query, $from) => $query->whereDate('event_subscribers.created_at', '>=', $from))
            ->when($filters['date_to'] ?? null, fn ($query, $to) => $query->whereDate('event_subscribers.created_at', '<=', $to))
            ->when($filters['event_id'] ?? null, fn ($query, $eventId) => $query->where('event_id', $eventId))
            ->when($filters['vendor_id'] ?? null, fn ($query, $vendorId) => $query->whereHas('event', fn ($events) => $events->where('vendor_id', $vendorId)))
            ->latest('event_subscribers.created_at');

        $salesQuery = fn () => (clone $sales);

        $eventIds = $salesQuery()->pluck('event_id')->unique();

        $stats = [
            'total' => $salesQuery()->count(),
            'attending' => $salesQuery()->where('is_attending', true)->count(),
            'events' => $salesQuery()->distinct('event_id')->count('event_id'),
            'vendors' => Event::query()->whereIn('id', $eventIds)->distinct()->count('vendor_id'),
        ];

        $paginator = $sales->paginate(25)->withQueryString();

        return Inertia::render('events/tickets-sold', [
            'sales' => $paginator->through(fn (EventSubscriber $sale) => [
                'id' => $sale->id,
                'customer_name' => $sale->subscriber->name ?? '—',
                'phone_number' => $sale->subscriber->phone_number,
                'event_title' => $sale->event->title,
                'vendor_name' => $sale->event->vendor->name ?? '—',
                'is_attending' => $sale->is_attending,
                'sold_at' => $sale->created_at->toDateTimeString(),
            ]),
            'stats' => $stats,
            'events' => Event::query()
                ->when($filters['vendor_id'] ?? null, fn ($query, $vendorId) => $query->where('vendor_id', $vendorId))
                ->orderBy('title')
                ->get(['id', 'title', 'vendor_id']),
            'vendors' => Vendor::query()->orderBy('name')->get(['id', 'name']),
            'filters' => [
                'date_from' => $filters['date_from'] ?? '',
                'date_to' => $filters['date_to'] ?? '',
                'event_id' => isset($filters['event_id']) ? (string) $filters['event_id'] : '',
                'vendor_id' => isset($filters['vendor_id']) ? (string) $filters['vendor_id'] : '',
            ],
        ]);
    }
}
