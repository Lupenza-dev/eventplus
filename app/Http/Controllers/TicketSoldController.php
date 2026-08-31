<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\TicketPurchase;
use App\Models\Vendor;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TicketSoldController extends Controller
{
    /**
     * Display confirmed ticket purchases with filters.
     */
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
            'event_id' => ['nullable', 'integer', 'exists:events,id'],
            'vendor_id' => ['nullable', 'integer', 'exists:vendors,id'],
        ]);
        $user = $request->user();
        $vendorIds = $user->vendors()->select('vendors.id');
        $isAdmin = $user->hasRole('Admin');

        $sales = TicketPurchase::query()
            ->successfulPayment()
            ->when(! $isAdmin, fn ($query) => $query->whereHas('event', fn ($events) => $events->whereIn('vendor_id', $vendorIds)))
            ->with([
                'event:id,title,vendor_id',
                'event.vendor:id,name',
                'ticket:id,name',
            ])
            ->when($filters['date_from'] ?? null, fn ($query, $from) => $query->whereDate('ticket_purchases.created_at', '>=', $from))
            ->when($filters['date_to'] ?? null, fn ($query, $to) => $query->whereDate('ticket_purchases.created_at', '<=', $to))
            ->when($filters['event_id'] ?? null, fn ($query, $eventId) => $query->where('event_id', $eventId))
            ->when($filters['vendor_id'] ?? null, fn ($query, $vendorId) => $query->whereHas('event', fn ($events) => $events->where('vendor_id', $vendorId)))
            ->latest('ticket_purchases.created_at');

        $salesQuery = fn () => (clone $sales);

        $eventIds = $salesQuery()->pluck('event_id')->unique();

        $stats = [
            'total' => $salesQuery()->count(),
            'checked_in' => $salesQuery()->where('checked_in', true)->count(),
            'events' => $salesQuery()->distinct('event_id')->count('event_id'),
            'vendors' => Event::query()->whereIn('id', $eventIds)->distinct()->count('vendor_id'),
        ];

        $paginator = $sales->paginate(25)->withQueryString();

        return Inertia::render('events/tickets-sold', [
            'sales' => $paginator->through(fn (TicketPurchase $sale) => [
                'id' => $sale->id,
                'email' => $sale->email,
                'phone_number' => $sale->phone_number,
                'event_title' => $sale->event->title,
                'vendor_name' => $sale->event->vendor->name ?? '—',
                'ticket_name' => $sale->ticket->name,
                'amount' => (float) $sale->amount,
                'status' => $sale->status,
                'checked_in' => $sale->checked_in,
                'sold_at' => $sale->created_at->toDateTimeString(),
            ]),
            'stats' => $stats,
            'events' => Event::query()
                ->when(! $isAdmin, fn ($query) => $query->whereIn('vendor_id', $vendorIds))
                ->when($filters['vendor_id'] ?? null, fn ($query, $vendorId) => $query->where('vendor_id', $vendorId))
                ->orderBy('title')
                ->get(['id', 'title', 'vendor_id']),
            'vendors' => Vendor::query()
                ->when(! $isAdmin, fn ($query) => $query->whereIn('id', $vendorIds))
                ->orderBy('name')
                ->get(['id', 'name']),
            'filters' => [
                'date_from' => $filters['date_from'] ?? '',
                'date_to' => $filters['date_to'] ?? '',
                'event_id' => isset($filters['event_id']) ? (string) $filters['event_id'] : '',
                'vendor_id' => isset($filters['vendor_id']) ? (string) $filters['vendor_id'] : '',
            ],
        ]);
    }
}
