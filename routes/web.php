<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EventCategoryController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\EventTicketController;
use App\Http\Controllers\PaymentPartnerController;
use App\Http\Controllers\PublicEventController;
use App\Http\Controllers\ResponseThreadLinkController;
use App\Http\Controllers\ThreadController;
use App\Http\Controllers\ThreadLinkController;
use App\Http\Controllers\ThreadResponseController;
use App\Http\Controllers\TicketPurchaseController;
use App\Http\Controllers\TicketSoldController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WelcomeController;
use Illuminate\Support\Facades\Route;

Route::get('/', [WelcomeController::class, 'index'])->name('home');
Route::get('events/{event}', [PublicEventController::class, 'show'])->name('events.show');
Route::post('events/{event}/tickets/{ticket}/purchase', [TicketPurchaseController::class, 'store'])
    ->name('events.tickets.purchase');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])
        ->name('dashboard');

    Route::resource('events', EventController::class)
        ->only(['index', 'store', 'update', 'destroy']);

    Route::resource('events.tickets', EventTicketController::class)
        ->only(['index', 'create', 'store', 'update', 'destroy'])
        ->parameters(['tickets' => 'ticket']);

    Route::get('tickets-sold', [TicketSoldController::class, 'index'])
        ->name('tickets-sold');

    Route::resource('users', UserController::class)
        ->only(['index', 'store', 'edit', 'update', 'destroy']);
    Route::patch('users/{user}/permissions', [UserController::class, 'syncPermissions'])
        ->name('users.permissions.sync');

    Route::middleware([])->group(function (): void {
        Route::inertia('system-settings', 'system-settings/index')->name('system-settings');
        Route::resource('system-settings/event-categories', EventCategoryController::class)
            ->only(['index', 'store', 'update', 'destroy'])
            ->names('event-categories');
        Route::resource('system-settings/payment-partners', PaymentPartnerController::class)
            ->only(['index', 'store', 'update', 'destroy'])
            ->names('payment-partners');

        Route::inertia('bot-settings', 'bot-settings/index')->name('bot-settings');

        Route::resource('bot-settings/thread-menus', ThreadController::class)
            ->only(['index', 'store', 'update', 'destroy'])
            ->parameters(['thread-menus' => 'thread'])
            ->names('thread-menus');

        Route::get('bot-settings/thread-responses/{thread}', [ThreadResponseController::class, 'index'])
            ->name('thread-responses.index');
        Route::post('bot-settings/thread-responses/{thread}', [ThreadResponseController::class, 'store'])
            ->name('thread-responses.store');
        Route::put('bot-settings/thread-responses/{thread}/{response}', [ThreadResponseController::class, 'update'])
            ->name('thread-responses.update');
        Route::delete('bot-settings/thread-responses/{thread}/{response}', [ThreadResponseController::class, 'destroy'])
            ->name('thread-responses.destroy');

        Route::resource('bot-settings/response-thread-links', ResponseThreadLinkController::class)
            ->only(['index', 'store', 'update', 'destroy'])
            ->parameters(['response-thread-links' => 'link'])
            ->names('response-thread-links');

        Route::resource('bot-settings/thread-links', ThreadLinkController::class)
            ->only(['index', 'store', 'update', 'destroy'])
            ->parameters(['thread-links' => 'link'])
            ->names('thread-links');
    });
});

require __DIR__.'/settings.php';
