<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\TicketPurchase;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the dashboard overview.
     */
    public function index(Request $request): Response
    {
        $validated = $request->validate([
            'year' => ['nullable', 'integer', 'min:2000', 'max:2100'],
        ]);

        $year = isset($validated['year']) ? (int) $validated['year'] : null;
        $user = $request->user();
        $vendorIds = $user->vendors()->select('vendors.id');
        $isAdmin = $user->hasRole('Admin');

        $yearExpression = match (TicketPurchase::query()->getConnection()->getDriverName()) {
            'sqlite' => "strftime('%Y', created_at)",
            'pgsql' => 'EXTRACT(YEAR FROM created_at)',
            default => 'YEAR(created_at)',
        };

        $years = TicketPurchase::query()
            ->when(! $isAdmin, fn ($query) => $query->whereHas('event', fn ($events) => $events->whereIn('vendor_id', $vendorIds)))
            ->selectRaw("{$yearExpression} as year")
            ->distinct()
            ->orderByDesc('year')
            ->pluck('year')
            ->map(fn ($value) => (int) $value)
            ->values()
            ->whenEmpty(fn ($collection) => $collection->push(now()->year));

        $purchases = TicketPurchase::query()
            ->successfulPayment()
            ->when(! $isAdmin, fn ($query) => $query->whereHas('event', fn ($events) => $events->whereIn('vendor_id', $vendorIds)))
            ->when($year, fn ($query) => $query->whereYear('ticket_purchases.created_at', $year));

        $chart = (clone $purchases)
            ->selectRaw('events.id, events.title, COUNT(*) as tickets, COALESCE(SUM(ticket_purchases.amount), 0) as payment')
            ->join('events', 'events.id', '=', 'ticket_purchases.event_id')
            ->whereNull('ticket_purchases.deleted_at')
            ->groupBy('events.id', 'events.title')
            ->orderByDesc('tickets')
            ->limit(8)
            ->get()
            ->map(fn ($row) => [
                'id' => $row->id,
                'event' => $row->title,
                'tickets' => (int) $row->tickets,
                'payment' => (float) $row->payment,
            ]);

        $stats = [
            'events' => Event::query()
                ->when(! $isAdmin, fn ($query) => $query->whereIn('vendor_id', $vendorIds))
                ->when($year, fn ($query) => $query->whereYear('events.created_at', $year))
                ->count(),
            'tickets_sold' => (clone $purchases)->count(),
            'payment_collected' => (float) (clone $purchases)->sum('amount'),
            'attendees' => (clone $purchases)->where('checked_in', true)->count(),
        ];

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'chart' => $chart,
            'years' => $years,
            'year' => $year,
        ]);
    }
}
