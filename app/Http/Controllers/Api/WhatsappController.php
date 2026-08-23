<?php

namespace App\Http\Controllers\Api;

use App\Concerns\WhatsappProcessMessageTrait;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WhatsappController extends Controller
{
    use WhatsappProcessMessageTrait;

    public function verifyWebhook(Request $request)
    {
        Log::info('verification');
        Log::debug($request->all());
        $mode = $request->query('hub_mode');
        $token = $request->query('hub_verify_token');
        $challenge = $request->query('hub_challenge');

        if ($mode && $token) {
            if ($mode === 'subscribe' && $token === "ChatBot@2027") {
                return response($challenge, 200);
            } else {
                return response('Forbidden', 403);
            }
        }

        return response('Bad Request', 400);
    }

    public function processMessage(Request $request)
    {
        Log::info('process');
        Log::debug($request->all());
        $response = json_decode(file_get_contents('php://input'), true);
        Log::debug($response);

        if (array_key_exists('messages', $response['entry'][0]['changes'][0]['value'])) {

            $type = $response['entry'][0]['changes'][0]['value']['messages'][0]['type'];
            $reply_id = null;
            $body = null;
            if ($type == 'text') {
                $phone_number = $response['entry'][0]['changes'][0]['value']['messages'][0]['from'];
                $message_id = $response['entry'][0]['changes'][0]['value']['messages'][0]['id'];
                $type = $response['entry'][0]['changes'][0]['value']['messages'][0]['type'];
                $body = $response['entry'][0]['changes'][0]['value']['messages'][0]['text']['body'];
            } elseif ($type == 'image') {
                $phone_number = $response['entry'][0]['changes'][0]['value']['messages'][0]['from'];
                $message_id = $response['entry'][0]['changes'][0]['value']['messages'][0]['id'];
                $type = $response['entry'][0]['changes'][0]['value']['messages'][0]['type'];
                $body = $response['entry'][0]['changes'][0]['value']['messages'][0]['image']['sha256'];
            } 
            elseif ($type == 'interactive') {
                $phone_number = $response['entry'][0]['changes'][0]['value']['messages'][0]['from'];
                $message_id = $response['entry'][0]['changes'][0]['value']['messages'][0]['id'];
                $type = $response['entry'][0]['changes'][0]['value']['messages'][0]['type'];
                $body = $response['entry'][0]['changes'][0]['value']['messages'][0]['interactive']['list_reply']['title'];
                $reply_id = $response['entry'][0]['changes'][0]['value']['messages'][0]['interactive']['list_reply']['id'];
            } 
            elseif ($type == 'button') {
                $phone_number = $response['entry'][0]['changes'][0]['value']['messages'][0]['from'];
                $message_id = $response['entry'][0]['changes'][0]['value']['messages'][0]['id'];
                $type = $response['entry'][0]['changes'][0]['value']['messages'][0]['type'];
                $body = $response['entry'][0]['changes'][0]['value']['messages'][0]['button']['text'];
                $reply_id = $response['entry'][0]['changes'][0]['value']['messages'][0]['button']['payload'];
                // $reply_id = $response['entry'][0]['changes'][0]['value']['messages'][0]['interactive']['list_reply']['id'];
            } 
            else {
                return response()->json(['status' => 'ok'], 200);
            }

            return $this->analyseMessage($phone_number, $message_id, $type, $body, $reply_id);
        }
    }
}
