<?php

namespace App\Http\Controllers;

use App\Models\ResponseThreadLink;
use App\Models\Thread;
use App\Models\ThreadResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ResponseThreadLinkController extends Controller
{
    /**
     * Display the thread response links.
     */
    public function index(): Response
    {
        return Inertia::render('bot-settings/response-thread-links', [
            'links' => ResponseThreadLink::query()
                ->with('threadResponse:id,name_eng,name_sw', 'thread:id,title_eng,title_sw')
                ->latest()
                ->get(['id', 'thread_response_id', 'thread_id', 'created_at']),
            'responses' => ThreadResponse::query()
                ->whereDoesntHave('links')
                ->latest()
                ->get(['id', 'name_eng', 'name_sw']),
            'threads' => Thread::query()
                ->latest()
                ->get(['id', 'title_eng', 'title_sw']),
        ]);
    }

    /**
     * Store a newly created thread response link.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validateLink($request);

        ResponseThreadLink::create($validated + ['user_id' => $request->user()->id]);

        return back()->with('toast', ['type' => 'success', 'message' => 'Response link created.']);
    }

    /**
     * Update the specified thread response link.
     */
    public function update(Request $request, ResponseThreadLink $link): RedirectResponse
    {
        $link->update($this->validateLink($request, $link));

        return back()->with('toast', ['type' => 'success', 'message' => 'Response link updated.']);
    }

    /**
     * Soft delete the specified thread response link.
     */
    public function destroy(ResponseThreadLink $link): RedirectResponse
    {
        $link->delete();

        return back()->with('toast', ['type' => 'success', 'message' => 'Response link deleted.']);
    }

    /**
     * @return array{thread_response_id: int, thread_id: int}
     */
    private function validateLink(Request $request, ?ResponseThreadLink $link = null): array
    {
        return $request->validate([
            'thread_response_id' => [
                'required',
                'integer',
                Rule::exists(ThreadResponse::class, 'id')->whereNull('deleted_at'),
                Rule::unique(ResponseThreadLink::class, 'thread_response_id')
                    ->ignore($link?->id)
                    ->whereNull('deleted_at'),
            ],
            'thread_id' => [
                'required',
                'integer',
                Rule::exists(Thread::class, 'id')->whereNull('deleted_at'),
            ],
        ]);
    }
}
