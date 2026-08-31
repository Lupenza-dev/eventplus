<?php

use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ScannerAuthController;
use App\Http\Controllers\Api\ScannerController;
use App\Http\Controllers\Api\WhatsappController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');

Route::get('/generate-token', [PaymentController::class, 'generateToken']);
Route::get('web-callback', [WhatsappController::class, 'verifyWebhook']);
Route::post('web-callback', [WhatsappController::class, 'processMessage']);

Route::post('login', [ScannerAuthController::class, 'login'])->middleware('throttle:login');

Route::middleware(['auth:sanctum', 'role:App User'])->group(function () {
    Route::post('logout', [ScannerAuthController::class, 'logout']);
    Route::get('scanner/dashboard', [ScannerController::class, 'dashboard']);
    Route::get('scanner/events', [ScannerController::class, 'events']);
    Route::get('scanner/events/{event}', [ScannerController::class, 'show']);
    Route::get('scanner/events/{event}/check-ins', [ScannerController::class, 'checkIns']);
    Route::post('scanner/validate-ticket', [ScannerController::class, 'validateTicket']);
    Route::post('scanner/check-in', [ScannerController::class, 'checkIn']);
});
