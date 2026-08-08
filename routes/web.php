<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EventCategoryController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\EventTicketController;
use App\Http\Controllers\TicketSoldController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])
        ->name('dashboard');

    Route::resource('events', EventController::class)
        ->only(['index', 'store', 'update', 'destroy']);

    Route::resource('events.tickets', EventTicketController::class)
        ->only(['index', 'store', 'update', 'destroy'])
        ->parameters(['tickets' => 'ticket']);

    Route::get('tickets-sold', [TicketSoldController::class, 'index'])
        ->name('tickets-sold');

    Route::resource('users', UserController::class)
        ->only(['index', 'store', 'edit', 'update', 'destroy']);
    Route::patch('users/{user}/permissions', [UserController::class, 'syncPermissions'])
        ->name('users.permissions.sync');

    Route::inertia('system-settings', 'system-settings/index')->name('system-settings');
    Route::resource('system-settings/event-categories', EventCategoryController::class)
        ->only(['index', 'store', 'update', 'destroy'])
        ->names('event-categories');
});

require __DIR__.'/settings.php';
