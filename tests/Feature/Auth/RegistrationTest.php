<?php

use App\Models\Vendor;
use Database\Seeders\RoleSeeder;
use Laravel\Fortify\Features;

beforeEach(function () {
    $this->skipUnlessFortifyHas(Features::registration());
    $this->seed(RoleSeeder::class);
});

test('registration screen can be rendered', function () {
    $response = $this->get(route('register'));

    $response->assertOk();
});

test('new users can register', function () {
    $response = $this->post(route('register.store'), [
        'business_name' => 'Kilimanjaro Events Ltd',
        'business_address' => 'Dar es Salaam, Tanzania',
        'name' => 'Test User',
        'phone' => '+255 700 000 000',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));
});

test('registration creates vendor and assigns vendor role', function () {
    $response = $this->post(route('register.store'), [
        'business_name' => 'Zanzibar Events Co',
        'business_address' => 'Stone Town, Zanzibar',
        'name' => 'Vendor Owner',
        'phone' => '+255 711 111 111',
        'email' => 'vendor@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertRedirect(route('dashboard', absolute: false));

    $vendor = Vendor::where('name', 'Zanzibar Events Co')->first();
    expect($vendor)->not->toBeNull();
    expect($vendor->address)->toBe('Stone Town, Zanzibar');

    $user = auth()->user();
    expect($user->phone)->toBe('+255 711 111 111');
    expect($user->hasRole('Vendor'))->toBeTrue();

    $this->assertDatabaseHas('vendor_users', [
        'vendor_id' => $vendor->id,
        'user_id' => $user->id,
    ]);
});
