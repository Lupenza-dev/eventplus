<?php

namespace App\Http\Controllers;

use App\Models\Thread;
use App\Models\ThreadResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ThreadResponseController extends Controller
{
    /**
     * Display the responses for a thread menu.
     */
    public function index(Thread $thread): Response
    {
        return Inertia::render('bot-settings/thread-responses', [
            'thread' => [
                'id' => $thread->id,
                'title_eng' => $thread->title_eng,
                'title_sw' => $thread->title_sw,
                'thread_type' => $thread->thread_type,
            ],
            'responses' => ThreadResponse::query()
                ->where('thread_id', $thread->id)
                ->latest()
                ->get(['id', 'name_eng', 'name_sw', 'order_no', 'created_at']),
        ]);
    }

    /**
     * Store a new thread response.
     */
    public function store(Request $request, Thread $thread): RedirectResponse
    {
        $validated = $this->validateResponse($request);

        ThreadResponse::create($validated + [
            'thread_id' => $thread->id,
            'user_id' => $request->user()->id,
        ]);

        return back()->with('toast', ['type' => 'success', 'message' => 'Response created.']);
    }

    /**
     * Update the specified thread response.
     */
    public function update(Request $request, Thread $thread, ThreadResponse $response): RedirectResponse
    {
        abort_unless($response->thread_id === $thread->id, 404);

        $response->update($this->validateResponse($request));

        return back()->with('toast', ['type' => 'success', 'message' => 'Response updated.']);
    }

    /**
     * Soft delete the specified thread response.
     */
    public function destroy(Thread $thread, ThreadResponse $response): RedirectResponse
    {
        abort_unless($response->thread_id === $thread->id, 404);

        $response->delete();

        return back()->with('toast', ['type' => 'success', 'message' => 'Response deleted.']);
    }

    /**
     * @return array{name_eng: string, name_sw: string, order_no: string}
     */
    private function validateResponse(Request $request): array
    {
        return $request->validate([
            'name_eng' => ['required', 'string', 'max:255'],
            'name_sw' => ['required', 'string', 'max:255'],
            'order_no' => ['required', 'integer'],
        ]);
    }
}
