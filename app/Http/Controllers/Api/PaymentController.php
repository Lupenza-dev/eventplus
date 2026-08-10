<?php

namespace App\Http\Controllers\Api;

use App\Concerns\AzamPayTrait;
use App\Concerns\GeminiAiTrait;
use App\Http\Controllers\Controller;

class PaymentController extends Controller
{
    use AzamPayTrait,GeminiAiTrait;

    public function generateToken()
    {
        $response = $this->sendRequest('Kuna aina gani za event zinazopatikana?');

        return $response;

        // if ($response->successful()) {
        //     return response()->json([
        //         'success' => true,
        //         'data' => $response->json(),
        //     ]);
        // } else {
        //     return response()->json([
        //         'success' => false,
        //         'message' => 'Failed to generate token',
        //         'error' => $response->body(),
        //     ], $response->status());
        // }
    }
}
