<?php

namespace App\Http\Controllers;

use App\Models\Thread;
use App\Models\ThreadLink;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ThreadLinkController extends Controller
{
    /**
     * Display the thread to thread links.
     */
    public function index(): Response
    {
        return Inertia::render('bot-settings/thread-links', [
            'links' => ThreadLink::query()
                ->with('thread:id,title_eng,title_sw', 'linkedThread:id,title_eng,title_sw')
                ->latest()
                ->get(['id', 'thread_id', 'linked_thread_id', 'created_at']),
            'threads' => Thread::query()
                ->whereDoesntHave('threadLinks')
                // ->latest()
                ->get(['id', 'title_eng', 'title_sw','step']),
        ]);
    }

    /**
     * Store a newly created thread link.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validateLink($request);

        ThreadLink::create($validated + ['user_id' => $request->user()->id]);

        return back()->with('toast', ['type' => 'success', 'message' => 'Thread link created.']);
    }

    /**
     * Update the specified thread link.
     */
    public function update(Request $request, ThreadLink $link): RedirectResponse
    {
        $link->update($this->validateLink($request, $link));

        return back()->with('toast', ['type' => 'success', 'message' => 'Thread link updated.']);
    }

    /**
     * Soft delete the specified thread link.
     */
    public function destroy(ThreadLink $link): RedirectResponse
    {
        $link->delete();

        return back()->with('toast', ['type' => 'success', 'message' => 'Thread link deleted.']);
    }

    /**
     * @return array{thread_id: int, linked_thread_id: int}
     */
    private function validateLink(Request $request, ?ThreadLink $link = null): array
    {
        return $request->validate([
            'thread_id' => [
                'required',
                'integer',
                Rule::exists(Thread::class, 'id')->whereNull('deleted_at'),
                Rule::unique(ThreadLink::class, 'thread_id')
                    ->ignore($link?->id)
                    ->whereNull('deleted_at'),
            ],
            'linked_thread_id' => [
                'required',
                'integer',
                'different:thread_id',
                Rule::exists(Thread::class, 'id')->whereNull('deleted_at'),
            ],
        ]);
    }
}
