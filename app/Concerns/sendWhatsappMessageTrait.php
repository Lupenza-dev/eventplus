<?php

namespace App\Concerns;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

trait sendWhatsappMessageTrait
{
    public function interactiveSms(int $phone_number, string $header_text, string $button_label, array $responses) {
        $rows = [];
        foreach ($responses as $key) {
            $rows[] = [
                'id' => $key->id,
                'title' => $key->name_eng,
            ];
        }

        $data = [
            "messaging_product" =>"whatsapp",
            "recipient_type" => "individual", 
            "to" => $phone_number,
            "type" => "interactive",
            "interactive" => [
                "type" => "list",
                "body" => [
                    "text" => $header_text,
                ],
                "action" => [
                    "button" => $button_label,
                    "sections" => [
                        [
                            "title" => $button_label,
                            "rows" => $rows,
                        ],
                    ],
                ],
            ],
        ];

        //$json_data = json_encode($data);
        //return $json_data;
       // Log::debug($data);
      // $this->createBotThread($phone_number,$header_text);
       $response =$this->sendSms($data);

       // return $response;

        //return $json_data;
    }

    public function textSms(int $phone_number, string $message) {
        $data = [
            'messaging_product' => 'whatsapp',
            'recipient_type'    => 'individual',
            'to'      => $phone_number,
            'type'    => 'text',
            'text'    => [
                'preview_url' =>false,
                'body'        =>$message
            ]
        ];

        // Log::debug($data);

      //  $json_data = json_encode($data);

       // return $json_data;

       // Log::debug($data);
       // $this->createBotThread($phone_number,$message);
        $response =$this->sendSms($data);

       // return $response;
    }

    public function sendSms($data){
        Log::debug('----------------------- send api request-------------------');
        $base_url =env('META_BASE_URL');
        $version  =env('META_VERSION');
        $endpoint =env('META_ENDPOINT');
        $phone_id =env('META_PHONE_ID');
        $token    =env('META_TOKEN');

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'Authorization' => "Bearer $token",
        ])
        ->post("{$base_url}/{$version}/{$phone_id}/{$endpoint}",$data);
        Log::debug('-----------------------response-------------------');
        Log::debug($response);

        
        // Retrieve the response
        $responseData = $response->json();
        Log::debug($responseData);
        return response()->json(['status' => 'ok'], 200);
      //  return  http_response_code(200);
       // return $responseData;
    }
    

    public function imageSms(int $phone_number, string $header_text, string $button_label, array $responses) {
        $rows = [];
        foreach ($responses as $key) {
            $rows[] = [
                'id' => $key->id,
                'title' =>$key->name_eng,
            ];
        }

        $data = [
            "messaging_product" =>"whatsapp",
            "recipient_type" => "individual", 
            "to" => $phone_number,
            "type" => "interactive",
            "interactive" => [
                "type" => "list",
                "header" =>[
                    "type" => "image",
                    "image" =>[
                        "id" =>asset('assets/logo.jpeg'),
                    ]
                ],
                "body" => [
                    "text" => $header_text,
                ],
                "action" => [
                    "button" => $button_label,
                    "sections" => [
                        [
                            "title" => $button_label,
                            "rows" => $rows,
                        ],
                    ],
                ],
            ],
        ];

        //$json_data = json_encode($data);
        //return $json_data;
       // Log::debug($data);
      // $this->createBotThread($phone_number,$header_text);
       $response =$this->sendSms($data);

       // return $response;

        //return $json_data;
    }
}
