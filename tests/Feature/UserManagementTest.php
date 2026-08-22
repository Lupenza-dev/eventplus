<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

test('guests cannot view users', function () {
    $this->get(route('users.index'))->assertRedirect(route('login'));
});

test('users can view the users list', function () {
    $user = User::factory()->create();
    $role = Role::findOrCreate('Admin', 'web');
    $user->assignRole($role);

    $this->actingAs($user)
        ->get(route('users.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('users/index')
            ->where('users.0.roles', [$role->name]));
});

test('users can create a user', function () {
    $user = User::factory()->create();
    $role = Role::findOrCreate('Internal User', 'web');

    $response = $this->actingAs($user)->post(route('users.store'), [
        'name' => 'Jane Doe',
        'email' => 'jane@example.com',
        'phone' => '+255712345678',
        'password' => 'SecurePass123!',
        'password_confirmation' => 'SecurePass123!',
        'role' => $role->name,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('users', [
        'email' => 'jane@example.com',
        'phone' => '+255712345678',
    ]);
    expect(User::where('email', 'jane@example.com')->firstOrFail()->hasRole($role))->toBeTrue();
});

test('users must select a valid role when creating a user', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('users.store'), [
        'name' => 'Jane Doe',
        'email' => 'jane@example.com',
        'phone' => '+255712345678',
        'password' => 'SecurePass123!',
        'password_confirmation' => 'SecurePass123!',
        'role' => 'Unknown Role',
    ]);

    $response->assertSessionHasErrors('role');
    $this->assertDatabaseMissing('users', ['email' => 'jane@example.com']);
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
