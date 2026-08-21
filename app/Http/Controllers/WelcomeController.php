<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Inertia\Inertia;
use Inertia\Response;

class WelcomeController extends Controller
{
    public function index(): Response
    {
        $events = Event::query()
            ->where('is_active', true)
            // ->where('is_approved', 1)
            // ->where(fn ($query) => $query
            //     ->whereNull('event_date')
            //     ->orWhere('event_date', '>=', now()))
            ->with(['category:id,name', 'tickets'])
            ->latest()
            ->limit(6)
            ->get(['id', 'event_category_id', 'title', 'location', 'event_date', 'is_paid_event', 'image'])
            ->append('image_url')
            ->map(fn (Event $event): array => [
                'id' => $event->id,
                'name' => $event->title,
                'date' => $event->event_date?->format('D, M j · g:i A'),
                'location' => $event->location,
                'price' => $event->tickets->isEmpty()
                    ? 'Free'
                    : 'TZS '.number_format((float) $event->tickets->min('price')),
                'category' => $event->category?->name,
                'image' => $event->image_url,
            ]);

        return Inertia::render('welcome', [
            'events' => $events,
        ]);
    }
}
