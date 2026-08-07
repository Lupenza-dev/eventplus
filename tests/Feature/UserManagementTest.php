<?php

use App\Models\User;
use Spatie\Permission\Models\Permission;

test('guests cannot view users', function () {
    $this->get(route('users.index'))->assertRedirect(route('login'));
});

test('users can view the users list', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->get(route('users.index'))->assertOk();
});

test('users can create a user', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('users.store'), [
        'name' => 'Jane Doe',
        'email' => 'jane@example.com',
        'phone' => '+255712345678',
        'password' => 'SecurePass123!',
        'password_confirmation' => 'SecurePass123!',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('users', [
        'email' => 'jane@example.com',
        'phone' => '+255712345678',
    ]);
});

test('users can update a user', function () {
    $user = User::factory()->create();
    $target = User::factory()->create();

    $response = $this->actingAs($user)->put(route('users.update', $target), [
        'name' => 'Updated Name',
        'email' => $target->email,
        'phone' => '+255700000000',
    ]);

    $response->assertRedirect();
    expect($target->fresh()->name)->toBe('Updated Name');
    expect($target->fresh()->phone)->toBe('+255700000000');
});

test('users can assign permissions to a user', function () {
    $user = User::factory()->create();
    $target = User::factory()->create();
    $permission = Permission::firstOrCreate(['name' => 'view events', 'guard_name' => 'web']);

    $response = $this->actingAs($user)->patch(
        route('users.permissions.sync', $target),
        ['permissions' => ['view events']],
    );

    $response->assertRedirect();
    expect($target->fresh()->hasPermissionTo($permission))->toBeTrue();
});

test('users can unassign permissions from a user', function () {
    $user = User::factory()->create();
    $target = User::factory()->create();
    $target->givePermissionTo(
        Permission::firstOrCreate(['name' => 'delete events', 'guard_name' => 'web']),
    );

    $this->actingAs($user)->patch(
        route('users.permissions.sync', $target),
        ['permissions' => []],
    );

    expect($target->fresh()->permissions)->toHaveCount(0);
});

test('users cannot delete their own account', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->delete(route('users.destroy', $user))
        ->assertForbidden();
});

test('users can delete another user', function () {
    $user = User::factory()->create();
    $target = User::factory()->create();

    $response = $this->actingAs($user)->delete(route('users.destroy', $target));

    $response->assertRedirect();
    $this->assertDatabaseMissing('users', ['id' => $target->id]);
});
