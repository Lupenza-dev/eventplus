<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\PaymentPartner;
use Inertia\Inertia;
use Inertia\Response;

class PublicEventController extends Controller
{
    public function show(Event $event): Response
    {
        abort_unless($event->is_active && $event->is_approved === 1, 404);

        $event->load('category:id,name');

        return Inertia::render('events/show', [
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
                ->get(['id', 'name', 'price', 'quantity', 'description']),
            'paymentPartners' => PaymentPartner::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'image'])
                ->map(fn (PaymentPartner $partner) => $partner->append('image_url')),
        ]);
    }
}
