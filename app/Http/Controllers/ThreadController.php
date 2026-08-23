<?php

namespace App\Http\Controllers;

use App\Models\Thread;
use App\Models\ThreadFlag;
use App\Models\ThreadLabel;
use App\Models\ThreadType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ThreadController extends Controller
{
    /**
     * Display a listing of the bot thread menus.
     */
    public function index(): Response
    {
        return Inertia::render('bot-settings/thread-menus', [
            'threads' => Thread::query()
                ->with('user:id,name')
                ->get(['id', 'title_eng', 'title_sw', 'step', 'flag', 'thread_type', 'label', 'back_status', 'close_thread', 'user_id', 'created_at']),
            'flags' => ThreadFlag::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->pluck('name'),
            'threadTypes' => ThreadType::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->pluck('name'),
            'labels' => ThreadLabel::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->pluck('name'),
        ]);
    }

    /**
     * Store a newly created thread menu.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validateThread($request);

        Thread::create($validated + ['user_id' => $request->user()->id]);

        return back()->with('toast', ['type' => 'success', 'message' => 'Thread menu created.']);
    }

    /**
     * Update the specified thread menu.
     */
    public function update(Request $request, Thread $thread): RedirectResponse
    {
        $validated = $this->validateThread($request);

        $thread->update($validated);

        return back()->with('toast', ['type' => 'success', 'message' => 'Thread menu updated.']);
    }

    /**
     * Soft delete the specified thread menu.
     */
    public function destroy(Thread $thread): RedirectResponse
    {
        $thread->delete();

        return back()->with('toast', ['type' => 'success', 'message' => 'Thread menu deleted.']);
    }

    /**
     * @return array{title_eng: string, title_sw: string, step: string, flag: string, thread_type: string, label: string, back_status: bool, close_thread: bool}
     */
    private function validateThread(Request $request): array
    {
        $validated = $request->validate([
            'title_eng' => ['required', 'string', 'max:255'],
            'title_sw' => ['required', 'string', 'max:255'],
            'step' => ['required', 'string', 'max:255'],
            'flag' => ['required', 'string', Rule::exists('thread_flags', 'name')->where('is_active', true)],
            'thread_type' => ['required', 'string', Rule::exists('thread_types', 'name')->where('is_active', true)],
            'label' => ['required', 'string', Rule::exists('thread_labels', 'name')->where('is_active', true)],
            'back_status' => ['sometimes', 'boolean'],
            'close_thread' => ['sometimes', 'boolean'],
        ]);

        return [
            ...$validated,
            'back_status' => $request->boolean('back_status'),
            'close_thread' => $request->boolean('close_thread'),
        ];
    }
}
