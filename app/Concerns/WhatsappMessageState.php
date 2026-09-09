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
                }else if($body == 2){
                    // search event
                    $thread =Thread::where('step',9)->first();
                    return [
                        'type' => 'text',
                        'data' => $thread->title_eng
                    ];
                }
                else if($body == 3){
                    // my ticket
                    return [
                        'type' => 'text',
                        'data' => "Currently you dont have any ticket"
                    ];
                }
                else if($body == 4){
                    // how event work
                    $message ="EventPlus makes it easy to discover events and buy tickets directly through WhatsApp.

1️⃣ *Find an Event*
Browse available events or search by event name.

2️⃣ *Choose Your Ticket*
Select the event, ticket type, and number of tickets you want.

3️⃣ *Make Payment*
Choose your preferred payment method and complete the payment.

4️⃣ *Receive Your Ticket*
After successful payment, your digital ticket will be sent to you on WhatsApp.

5️⃣ *Attend the Event*
Present your ticket QR code at the entrance for verification.";
                    return [
                        'type' => 'text',
                        'data' => $message
                    ];
                }
                else if($body == 5){
                    // contact support
                    return [
                        'type' => 'address',
                        'data' => "company address"
                    ];
                }
                 else {
                    
                    return [
                        'type' => 'text',
                        'data'=> $this->wrongChoiseMessage();
                    ]
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
        // check that selection of category its valid
        $event_category =EventCategory::find($body);
        if (!$event_category) {
            return [
                'count' =>0,
                'message' =>$this->wrongChoiseMessage()
            ]
        }
        $events = Event::where('event_category_id',$body)->get();

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
                $event = Event::where('event_category_id',$body)->first();
                $data = [
                    'image_url' => asset('storage/' . $event->image),
                    'header'    => '🎫 ' . $event->title,
                    'event_date' => '📅 ' . $event->event_date,
                    'location'  => '📍 ' . $event->location,
                    'id'        => $event->id
                ];

                return [
                    'count' => 1,
                    'message' => $data
                ];
            }
        } else {
            return [
                'count' => 0,
                'message' => $this->warningMessage();
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

    public function wrongChoiseMessage(){
        $message = "⚠️ *Oops! That's not a valid option.*\n\n"
    . "Please reply with one of the numbers shown in the menu.\n\n";
    return $message;
    }

    public function warningMessage(){
        $message = "⚠️ *Oops! No event available on that category you choose.*\n\n"
    . "Please reply with one other option shown in the menu.\n\n";
    return $message;
    }
}
