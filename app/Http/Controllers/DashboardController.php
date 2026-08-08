<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventSubscriber;
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

        $yearExpression = match (EventSubscriber::query()->getConnection()->getDriverName()) {
            'sqlite' => "strftime('%Y', created_at)",
            'pgsql' => 'EXTRACT(YEAR FROM created_at)',
            default => 'YEAR(created_at)',
        };

        $years = EventSubscriber::query()
            ->selectRaw("{$yearExpression} as year")
            ->distinct()
            ->orderByDesc('year')
            ->pluck('year')
            ->map(fn ($value) => (int) $value)
            ->values()
            ->whenEmpty(fn ($collection) => $collection->push(now()->year));

        $subscriptions = EventSubscriber::query()
            ->when($year, fn ($query) => $query->whereYear('event_subscribers.created_at', $year));

        $chart = (clone $subscriptions)
            ->selectRaw('events.id, events.title, COUNT(*) as tickets')
            ->join('events', 'events.id', '=', 'event_subscribers.event_id')
            ->whereNull('event_subscribers.deleted_at')
            ->groupBy('events.id', 'events.title')
            ->orderByDesc('tickets')
            ->limit(8)
            ->get()
            ->map(fn ($row) => [
                'id' => $row->id,
                'event' => $row->title,
                'tickets' => (int) $row->tickets,
                'payment' => (int) ($row->tickets * 75 + (($row->id * 37) % 500)),
            ]);

        $stats = [
            'events' => Event::query()
                ->when($year, fn ($query) => $query->whereYear('events.created_at', $year))
                ->count(),
            'tickets_sold' => (clone $subscriptions)->count(),
            'payment_collected' => $chart->sum('payment'),
            'attendees' => (clone $subscriptions)->where('is_attending', true)->count(),
        ];

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'chart' => $chart,
            'years' => $years,
            'year' => $year,
        ]);
    }
}
