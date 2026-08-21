<?php

namespace App\Concerns;

use App\Models\Event;
use App\Models\EventCategory;
use App\Models\Thread;

trait WhatsappMessageState
{
    public function botStepManagement(Thread $thread, $body = null){

        switch ($thread->step) {
            case 2:
                if ($body == 1) {
                    // fetch event categories
                    $message =$thread->title_en;
                    $categories =EventCategory::get();
                    foreach ($categories as $catgory) {
                        $message .= "{$catgory->id}️⃣ {$catgory->name}\n";
                    }
                    
                    $message .= "\nReply with a number to continue.";

                    return $message;

                } else {
                    # code...
                }
                
                break;
            
            default:
                # code...
                break;
        }

    }

    public function botStepManagementForCarousel(Thread $thread, $body = null){

        $events =Event::where('event_category_id',$body)->get();

        if ($events) {
            
            if (count($events) > 1) {
                $data =[];
                foreach ($events as $event) {
                    $data[] =[
                        'image_url' =>asset('storage/' . $event->image),
                        'header'    => '🎫 '.$event->title,
                        'event_date' =>'📅 '.$event->event_date,
                        'location'  =>'📍 '.$event->location,
                        'id'        =>$event->id
                    ];
                }

                return [
                    'count' =>2,
                    'message' =>$data
                ];
            } else {
                # code...
            }
            
        } else {
            return [
                'count' => 0,
                'message' =>"Currently No Event "
            ];
        }
        

    }
}
