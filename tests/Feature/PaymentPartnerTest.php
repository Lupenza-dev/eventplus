<?php

use App\Models\PaymentPartner;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

test('guests cannot view payment partners', function () {
    $this->get(route('payment-partners.index'))->assertRedirect(route('login'));
});

test('users can view payment partners', function () {
    $user = User::factory()->create();
    $partner = PaymentPartner::factory()->create(['name' => 'Vodacom M-Pesa']);

    $this->actingAs($user)->get(route('payment-partners.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('system-settings/payment-partners')
            ->has('partners', 1)
            ->where('partners.0.name', 'Vodacom M-Pesa')
            ->where('partners.0.is_active', true));
});

test('users can create a payment partner', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->post(route('payment-partners.store'), [
        'name' => 'Vodacom M-Pesa',
        'is_active' => '1',
    ])
        ->assertRedirect()
        ->assertSessionHas('toast');

    $this->assertDatabaseHas('payment_partners', [
        'name' => 'Vodacom M-Pesa',
        'is_active' => true,
    ]);
});

test('users can create a payment partner with a logo', function () {
    Storage::fake('public');

    $user = User::factory()->create();

    $this->actingAs($user)->post(route('payment-partners.store'), [
        'name' => 'Tigo Pesa',
        'is_active' => '0',
        'image' => UploadedFile::fake()->image('logo.png'),
    ])->assertRedirect();

    $partner = PaymentPartner::query()->first();
    expect($partner->name)->toBe('Tigo Pesa');
    expect($partner->is_active)->toBeFalse();
    expect($partner->image)->not->toBeNull();
    Storage::disk('public')->assertExists($partner->image);
});

test('payment partner names must be unique', function () {
    $user = User::factory()->create();
    PaymentPartner::factory()->create(['name' => 'Vodacom M-Pesa']);

    $this->actingAs($user)->from(route('payment-partners.index'))
        ->post(route('payment-partners.store'), ['name' => 'Vodacom M-Pesa'])
        ->assertRedirect(route('payment-partners.index'))
        ->assertSessionHasErrors('name');
});

test('users can update a payment partner', function () {
    $user = User::factory()->create();
    $partner = PaymentPartner::factory()->create(['name' => 'Vodacom M-Pesa', 'is_active' => true]);

    $this->actingAs($user)->put(route('payment-partners.update', $partner), [
        'name' => 'Airtel Money',
        'is_active' => '0',
    ])
        ->assertRedirect()
        ->assertSessionHas('toast');

    expect($partner->refresh())
        ->name->toBe('Airtel Money')
        ->is_active->toBeFalse();
});

test('users can delete a payment partner', function () {
    $user = User::factory()->create();
    $partner = PaymentPartner::factory()->create();

    $this->actingAs($user)->delete(route('payment-partners.destroy', $partner))
        ->assertRedirect()
        ->assertSessionHas('toast');

    $this->assertSoftDeleted('payment_partners', ['id' => $partner->id]);
});
