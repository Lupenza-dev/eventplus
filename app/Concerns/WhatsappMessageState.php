<?php

namespace App\Concerns;

use App\Models\BotUserLog;
use App\Models\Event;
use App\Models\EventCategory;
use App\Models\EventTicket;
use App\Models\PaymentPartner;
use App\Models\Thread;
use Illuminate\Support\Facades\Log;

trait WhatsappMessageState
{
    public function botStepManagement(Thread $thread, $body = null, $reply_id = null, $phone_number = null)
    {

        switch ($thread->step) {
            case 2:
                if ($body == 1) {
                    // fetch event categories
                    $message = $thread->title_eng;
                    $categories = EventCategory::get();
                    foreach ($categories as $catgory) {
                        $message .= "{$catgory->id}️⃣ {$catgory->name}\n";
                    }

                    $message .= "\nReply with a number to continue.";

                    return [
                        'type' => 'text',
                        'data' => $message
                    ];
                } else {
                    # code...
                }

                break;
            case 4:

                // fetch event tickets
                Log::info('state 4');
                Log::info($thread->title_eng);
                Log::info("event id {$reply_id}");
                $message = $thread->title_eng;
                // $header_text =string_replace
                $event_name = Event::where('id', $reply_id)->first();
                $message_ = str_replace('##event_name##', $event_name->title, $thread->title_eng);
                $tickets = EventTicket::where('event_id', $reply_id)->get();
                $data = [];
                foreach ($tickets as $ticket) {
                    $data[] = [
                        'id'   => $ticket->id,
                        'name' => $ticket->name . " (" . number_format($ticket->price) . ")"
                    ];
                }

                return [
                    'type' => 'interactive',
                    'data' => $data,
                    'header_text' => $message_,
                    'button_label' => "Choose Ticket"
                ];


                break;
            case 5:
                $message = $thread->title_eng;
                return [
                    'type' => 'text',
                    'data' => $message
                ];

                break;
            case 6:
                //$message = $thread->title_eng;
                // construct order summary
                $result =$this->buildOrderSummary($phone_number,$body);
                $summary = "Event: " . $result['event'] . "\n"
                . "Ticket: " . $result['ticket'] . "\n"
                . "Quantity: " . $result['quantity'] . "\n"
                . "Price: TZS " . number_format($result['price']) . " each\n"
                . "Total: TZS " . number_format($result['total']);

                $message = str_replace('##event_summary##', $summary, $thread->title_eng);


                return [
                    'type' => 'text',
                    'data' => $message
                ];

                break;

            case 7:


                $message = $thread->title_eng;
                // $header_text =string_replace
                // $event_name =Event::where('id',$reply_id)->first();
                // $message_ =str_replace('##event_name##',$event_name->title,$thread->title_eng);
                $partners = PaymentPartner::get();
                $data = [];
                foreach ($partners as $partner) {
                    $data[] = [
                        'id'   => $partner->id,
                        'name' => $partner->name,
                    ];
                }

                return [
                    'type' => 'interactive',
                    'data' => $data,
                    'header_text' => $message,
                    'button_label' => "Payment Methods"
                ];
                break;

            case 8:
                $message = $thread->title_eng;
                return [
                    'type' => 'text',
                    'data' => $message
                ];

                break;

            default:
                # code...
                break;
        }
    }

    public function botStepManagementForCarousel(Thread $thread, $body = null)
    {

        $events = Event::where('event_category_id', $body)->get();

        if ($events) {

            if (count($events) > 1) {
                $data = [];
                foreach ($events as $event) {
                    $data[] = [
                        'image_url' => asset('storage/' . $event->image),
                        'header'    => '🎫 ' . $event->title,
                        'event_date' => '📅 ' . $event->event_date,
                        'location'  => '📍 ' . $event->location,
                        'id'        => $event->id
                    ];
                }

                return [
                    'count' => 2,
                    'message' => $data
                ];
            } else {
                # code...
            }
        } else {
            return [
                'count' => 0,
                'message' => "Currently No Event "
            ];
        }
    }

    public function buildOrderSummary(int $phone_number,int $quantityFrom)
    {
        $user_log = BotUserLog::where(['phone_number' => $phone_number, 'is_active' => true])
            ->latest()
            ->first();

        $log = json_decode($user_log->log, true);
        // $event_id =int $log['event_name'];
        $event = Event::find($log['event_name']);
        $ticket = EventTicket::find($log['event_ticket']);
        $quantity = (int) $quantityFrom;
        $total = $ticket->price * $quantity;

        return [
            'event' => $event->title,
            'ticket' => $ticket->name,
            'quantity' => $quantity,
            'price' => $ticket->price,
            'total' => $total,
        ];
    }
}
