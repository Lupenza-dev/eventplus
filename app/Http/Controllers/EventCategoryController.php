<?php

namespace App\Http\Controllers;

use App\Models\EventCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class EventCategoryController extends Controller
{
    /**
     * Display a listing of the event categories.
     */
    public function index(): Response
    {
        return Inertia::render('system-settings/event-categories', [
            'categories' => EventCategory::query()
                ->latest()
                ->get(['id', 'name', 'slug', 'created_at']),
        ]);
    }

    /**
     * Store a newly created event category.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique(EventCategory::class, 'name')->whereNull('deleted_at')],
        ]);

        EventCategory::create($validated);

        return back()->with('toast', ['type' => 'success', 'message' => 'Category created.']);
    }

    /**
     * Update the specified event category.
     */
    public function update(Request $request, EventCategory $eventCategory): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique(EventCategory::class, 'name')->ignore($eventCategory->id)->whereNull('deleted_at')],
        ]);

        $eventCategory->update($validated);

        return back()->with('toast', ['type' => 'success', 'message' => 'Category updated.']);
    }

    /**
     * Soft delete the specified event category.
     */
    public function destroy(EventCategory $eventCategory): RedirectResponse
    {
        $eventCategory->delete();

        return back()->with('toast', ['type' => 'success', 'message' => 'Category deleted.']);
    }
}
