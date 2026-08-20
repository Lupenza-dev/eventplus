<?php

use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\WhatsappController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');

Route::get('/generate-token', [PaymentController::class, 'generateToken']);
Route::get('web-callback',[WhatsappController::class,'verifyWebhook']);
Route::post('web-callback',[WhatsappController::class,'processMessage']);
