<?php

namespace App\Concerns;

use App\Models\Event;
use App\Models\EventCategory;
use App\Models\PaymentPartner;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

trait GeminiAiTrait
{
    use sendWhatsappMessageTrait;

    public function sendRequest(string $content, int $phone_number)
    {
        $payload = [
            'model' => 'gemini-3.5-flash',
            'input' => $content,
            'stream' => false,
            'tools' => $this->tools(),
        ];

        $response = Http::withHeaders([
            'x-goog-api-key' => env('GEMINI_KEY'),
            'Content-Type' => 'application/json',
        ])->post('https://generativelanguage.googleapis.com/v1beta/interactions', $payload);

        $data = $response->json();
        Log::info('Gemini Interaction Response', ['data' => $data]);

        if (($data['status'] ?? null) === 'requires_action') {
            return $this->handleFunctionCalls($data, $phone_number);
        }

        $message = $this->extractMessageText($data);

        if (!empty($message)) {
            $this->textSms($phone_number, $message);
        }

        return response()->json($data);
    }

    private function handleFunctionCalls(array $data, int $phone_number)
    {
        $steps = $data['steps'] ?? [];
        $functionCallStep = null;

        foreach ($steps as $step) {
            if (($step['type'] ?? null) === 'function_call') {
                $functionCallStep = $step;
                break;
            }
        }

        if (!$functionCallStep) {
            Log::error('Status is requires_action, but no function_call step was found.');
            return response()->json($data, 400);
        }

        $toolName = $functionCallStep['name'];
        $callId = $functionCallStep['id'];
        $arguments = $functionCallStep['arguments'] ?? [];

        // 1. Execute local function/query
        $result = $this->executeTool($toolName, $arguments);

        // 2. Format function_result correctly as an array item under 'input'
        $payload = [
            'model' => 'gemini-3.5-flash',
            'previous_interaction_id' => $data['id'],
            'input' => [
                [
                    'type' => 'function_result',
                    'call_id' => $callId,
                    'response' => [
                        'result' => $result,
                    ],
                ]
            ],
            'stream' => false,
            'tools' => $this->tools(),
        ];

        $response = Http::withHeaders([
            'x-goog-api-key' => env('GEMINI_KEY'),
            'Content-Type' => 'application/json',
        ])->post('https://generativelanguage.googleapis.com/v1beta/interactions', $payload);

        $followUpData = $response->json();
        Log::info('Gemini Follow-up Response', ['data' => $followUpData]);

        // If Gemini makes chained tool calls, loop again
        if (($followUpData['status'] ?? null) === 'requires_action') {
            return $this->handleFunctionCalls($followUpData, $phone_number);
        }

        // Extract final text response and send SMS
        $message = $this->extractMessageText($followUpData);

        if (!empty($message)) {
            $this->textSms($phone_number, $message);
        }

        return response()->json($followUpData);
    }

    private function extractMessageText(array $data): ?string
    {
        $steps = $data['steps'] ?? [];

        foreach ($steps as $step) {
            if (($step['type'] ?? null) === 'model_output' && isset($step['content'])) {
                foreach ($step['content'] as $content) {
                    if (($content['type'] ?? null) === 'text' && !empty($content['text'])) {
                        return $content['text'];
                    }
                }
            }
        }

        return null;
    }

    public function eventCategory()
    {
        return EventCategory::query()
            // ->where('is_active', true)
            ->get(['id', 'name'])
            ->map(fn (EventCategory $category): array => [
                'id' => $category->id,
                'name' => $category->name,
            ])
            ->toArray();
    }

    public function eventList($categoryId = null)
    {
        return Event::query()
            ->where('is_active', true)
            ->where('is_approved', 1)
            ->with(['category:id,name', 'tickets'])
            ->when($categoryId, function ($query, $categoryId) {
                $query->where('event_category_id', $categoryId);
            })
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
            ])
            ->toArray();
    }

    public function eventTickets($eventId = null)
    {
        $event = Event::query()
            ->where('id', $eventId)
            ->with(['tickets'])
            ->first();

        if (!$event) {
            return ['error' => 'Event not found'];
        }

        return $event->tickets->map(fn ($ticket) => [
            'id' => $ticket->id,
            'name' => $ticket->name,
            'price' => $ticket->price,
            'quantity' => $ticket->quantity,
        ])->toArray();
    }

    public function paymentMethod()
    {
        return PaymentPartner::query()
            // ->where('is_active', true)
            ->get(['id', 'name', 'image'])
            ->map(fn (PaymentPartner $partner): array => [
                'id' => $partner->id,
                'name' => $partner->name,
                'image' => $partner->image,
            ])
            ->toArray();
    }

    private function tools(): array
    {
        return [
            [
                'type' => 'function',
                'name' => 'event_category',
                'description' => 'Get all active event categories available on EventPlus.',
                'parameters' => [
                    'type' => 'object',
                    'properties' => (object) [],
                ],
            ],
            [
                'type' => 'function',
                'name' => 'event_list',
                'description' => 'Get available active and approved events. Use this when the user asks to find, browse, or recommend events.',
                'parameters' => [
                    'type' => 'object',
                    'properties' => [
                        'category_id' => [
                            'type' => 'integer',
                            'description' => 'Optional event category ID.',
                        ],
                    ],
                ],
            ],
            [
                'type' => 'function',
                'name' => 'event_tickets',
                'description' => 'Get ticket types and prices for a specific event.',
                'parameters' => [
                    'type' => 'object',
                    'properties' => [
                        'event_id' => [
                            'type' => 'integer',
                            'description' => 'The ID of the event.',
                        ],
                    ],
                    'required' => ['event_id'],
                ],
            ],
            [
                'type' => 'function',
                'name' => 'payment_method',
                'description' => 'Get available payment methods on EventPlus.',
                'parameters' => [
                    'type' => 'object',
                    'properties' => (object) [],
                ],
            ],
        ];
    }

    private function executeTool(string $name, array $arguments = [])
    {
        return match ($name) {
            'event_category' => $this->eventCategory(),
            'event_list' => $this->eventList($arguments['category_id'] ?? null),
            'event_tickets' => $this->eventTickets($arguments['event_id'] ?? null),
            'payment_method' => $this->paymentMethod(),
            default => ['error' => "Unknown tool: {$name}"],
        };
    }
}