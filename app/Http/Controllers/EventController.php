<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    /**
     * Display a listing of the events.
     */
    public function index(Request $request): Response
    {
        return Inertia::render('events/index', [
            'events' => Event::query()
                ->where('user_id', $request->user()->id)
                ->with('category:id,name')
                ->latest()
                ->get([
                    'id',
                    'event_category_id',
                    'title',
                    'location',
                    'event_date',
                    'start_date',
                    'end_date',
                    'description',
                    'is_active',
                    'is_approved',
                    'is_paid_event',
                    'image',
                ])
                ->map(fn (Event $event) => $event->append('image_url')),
            'categories' => EventCategory::query()
                ->orderBy('name')
                ->get(['id', 'name']),
        ]);
    }

    /**
     * Store a newly created event.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $this->normalizeDates($request->validate($this->rules()));

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('events', 'public');
        }

        $vendorId = $request->user()->vendors()->first()?->id;

        Event::create([
            ...$validated,
            'user_id' => $request->user()->id,
            'vendor_id' => $vendorId,
        ]);

        return back()->with('toast', ['type' => 'success', 'message' => 'Event created.']);
    }

    /**
     * Update the specified event.
     */
    public function update(Request $request, Event $event): RedirectResponse
    {
        abort_unless($event->user_id === $request->user()->id, 403);

        $validated = $this->normalizeDates($request->validate($this->rules()));

        if ($request->hasFile('image')) {
            if ($event->image) {
                Storage::disk('public')->delete($event->image);
            }

            $validated['image'] = $request->file('image')->store('events', 'public');
        }

        $event->update($validated);

        return back()->with('toast', ['type' => 'success', 'message' => 'Event updated.']);
    }

    /**
     * Soft delete the specified event.
     */
    public function destroy(Request $request, Event $event): RedirectResponse
    {
        abort_unless($event->user_id === $request->user()->id, 403);

        $event->delete();

        return back()->with('toast', ['type' => 'success', 'message' => 'Event deleted.']);
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    private function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'event_category_id' => ['required', 'exists:event_categories,id'],
            'location' => ['nullable', 'string', 'max:255'],
            'event_date' => ['nullable', 'date', 'required_without:start_date'],
            'start_date' => ['nullable', 'date', 'required_without:event_date'],
            'end_date' => ['nullable', 'date', 'required_with:start_date', 'after_or_equal:start_date'],
            'description' => ['nullable', 'string'],
            'is_paid_event' => ['boolean'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:1900'],
        ];
    }

    /**
     * One-day events only keep event_date; multi-day events keep start/end dates.
     *
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    private function normalizeDates(array $validated): array
    {
        if (! empty($validated['event_date'])) {
            $validated['start_date'] = null;
            $validated['end_date'] = null;
        } else {
            $validated['event_date'] = null;
        }

        return $validated;
    }
}
