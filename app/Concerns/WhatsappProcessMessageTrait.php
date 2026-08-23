<?php

namespace App\Concerns;

use App\Models\BotLog;
use App\Models\BotUserLog;
use App\Models\EventCategory;
use App\Models\Thread;
use App\Models\ThreadLink;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Str;

trait WhatsappProcessMessageTrait
{
    use sendWhatsappMessageTrait,WhatsappMessageState;

    public function analyseMessage(int $phone_number, string $message_id, string $type, string $body,  $reply_id = null)
    {

        $message_exist = BotLog::where('message_id', $message_id)->first();

        if ($message_exist) {
            return response()->json(['status' => 'ok'], 200);
        }

        $log = BotLog::with('thread')->where('phone_number', $phone_number)->where('status', 'OPEN')
            ->where('created_at', '>=', Carbon::now()->subMinutes(3))
            ->latest()->first();
        // if log exist means chat is still open and we can continue the conversation, else we can start a new conversation
        if ($log) {
            $next_thread =ThreadLink::with('linkedThread')->where('thread_id',$log->thread_id)->first();
            if($next_thread){
                //heck type of message

               $type_of_message = $next_thread->linkedThread?->thread_type;
                    // Log::info('next thread');
                    // Log::info($next_thread->linkedThread);
               if($type_of_message == "text"){

               $builded_message = $this->botStepManagement($next_thread->linkedThread,$body,$reply_id);
               Log::info('builded');
               Log::info($builded_message);

               $this->createUserLog($phone_number, 'thread_initiated', $body, $next_thread->linkedThread->close_thread);
               $this->createBotLog($phone_number,$message_id,$body,$reply_id,$next_thread->linkedThread->step,$next_thread->linkedThread->id,$type,$next_thread->linkedThread->close_thread);

               if($builded_message['type'] == 'text'){
 
                $this->textSms($phone_number,$builded_message['data']);
               }else if ($builded_message['type'] == 'interactive'){
                    $this->interactiveSms($phone_number, $builded_message['header_text'],$builded_message['button_label'], $builded_message['data']);
               }
              
               }else if ($type_of_message == "carousel"){
                $message_response = $this->botStepManagementForCarousel($next_thread->linkedThread,$body);
                // if count = 2 means carousel
                if ($message_response['count'] == 2) {
                    $this->createUserLog($phone_number, 'thread_initiated', $body, $next_thread->linkedThread->close_thread);
                    $this->createBotLog($phone_number,$message_id,$body,$reply_id,$next_thread->linkedThread->step,$next_thread->linkedThread->id,$type,$next_thread->linkedThread->close_thread);
     
                    $this->carouselSms($phone_number,$message_response['message']);
                } else {
                    # code...
                }
                
               }

            }else{
                //No thread
            }
        } else {
            // # new thread
            $thread = Thread::with('responses')->where('step', 1)->first();
            $this->createUserLog($phone_number, 'thread_initiated', $body, $thread->close_thread);

            $message   =$thread->title_eng;
           // $button_label  ="Event Categories";
            //$responses =EventCategory::get(['id','name'])->toArray();;

            $this->createBotLog($phone_number,$message_id,$body,$reply_id,$thread->step,$thread->id,$type,$thread->close_thread);
            $this->textSms($phone_number,$message);
            return true;
        }

        return response()->json(['status' => 'ok'], 200);

    }

    public function createBotLog(int $phone_number,string $message_id,string $body,?int $reply_id,int $step,int $thread_id,string $type,string $thread_status){
        BotLog::create([
            'phone_number' =>$phone_number,
            'message_id'   =>$message_id,
            'text'         =>$body,
            'reply_id'     =>$reply_id ?? null,
            'step'         =>$step,
            'thread_id'    =>$thread_id,
            'type'         =>$type,
            'uuid'         =>(string)Str::orderedUuid(),
             'status'       =>$thread_status ? "CLOSED" : "OPEN",
           ]);

           return true;
      
}

    public function createUserLog(int $phone_number, string $label, string $body, string $status)
    {
        $data = [
            $label => $body,
        ];

        $check_log = BotUserLog::where('phone_number', $phone_number)->where('is_active', true)->latest()->first();
        if ($check_log) {
            $exit_log = json_decode($check_log->log, true) ?? [];
            $updated_data = array_merge($exit_log, $data);
            $check_log->update([
                'log' => json_encode($updated_data),
                'is_active' => $status ? false : true,
            ]);
        } else {
            // create new user Log
            BotUserLog::create([
                'phone_number' => $phone_number,
                'log' => json_encode($data),
            ]);
        }

        return true;

    }

    public function closeUserLog(int $phone_number)
    {
        $log = BotUserLog::where('phone_number', $phone_number)->where('is_active', true)->latest()->first();
        if ($log) {
            $log->is_active = false;
            $log->save();
        }

        return true;

    }

    public function clearLogs(int $phone_number)
    {
        $logs = BotLog::where('phone_number', $phone_number)->where('status', 'OPEN')->get();
        foreach ($logs as $key) {
            $key->update(['status' => 'CLOSED']);
        }
    }
}
