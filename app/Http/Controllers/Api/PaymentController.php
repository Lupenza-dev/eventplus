<?php

namespace App\Http\Controllers\Api;

use App\Concerns\AzamPayTrait;
use App\Http\Controllers\Controller;

class PaymentController extends Controller
{
    use AzamPayTrait;

    public function generateToken()
    {
        $response = $this->tokenGeneration();

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
