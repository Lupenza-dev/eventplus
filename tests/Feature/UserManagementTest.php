<?php

use App\Models\User;
use App\Models\Vendor;
use App\Models\VendorUser;
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

test('vendors only see users assigned to their vendor', function () {
    $vendor = Vendor::factory()->create();
    $otherVendor = Vendor::factory()->create();
    $vendorUser = User::factory()->create(['name' => 'Vendor Owner']);
    $visibleUser = User::factory()->create(['name' => 'Visible User']);
    $hiddenUser = User::factory()->create(['name' => 'Hidden User']);

    $vendorUser->assignRole(Role::findOrCreate('Vendor', 'web'));
    Role::findOrCreate('App User', 'web');
    VendorUser::create(['vendor_id' => $vendor->id, 'user_id' => $vendorUser->id, 'vendor_type' => 'Vendor']);
    VendorUser::create(['vendor_id' => $vendor->id, 'user_id' => $visibleUser->id, 'vendor_type' => 'App User']);
    VendorUser::create(['vendor_id' => $otherVendor->id, 'user_id' => $hiddenUser->id, 'vendor_type' => 'App User']);

    $this->actingAs($vendorUser)
        ->get(route('users.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('users', 2)
            ->where('users.0.id', $vendorUser->id)
            ->where('users.1.id', $visibleUser->id)
            ->where('roles', ['App User', 'Vendor']));
});

test('admins can see users from every vendor', function () {
    $admin = User::factory()->create();
    $firstUser = User::factory()->create(['name' => 'First Vendor User']);
    $secondUser = User::factory()->create(['name' => 'Second Vendor User']);

    $admin->assignRole(Role::findOrCreate('Admin', 'web'));
    VendorUser::create(['vendor_id' => Vendor::factory()->create()->id, 'user_id' => $firstUser->id]);
    VendorUser::create(['vendor_id' => Vendor::factory()->create()->id, 'user_id' => $secondUser->id]);

    $this->actingAs($admin)
        ->get(route('users.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->has('users', 3));
});

test('vendors cannot manage users from another vendor', function () {
    $vendorUser = User::factory()->create();
    $otherVendorUser = User::factory()->create();

    $vendorUser->assignRole(Role::findOrCreate('Vendor', 'web'));
    VendorUser::create(['vendor_id' => Vendor::factory()->create()->id, 'user_id' => $vendorUser->id]);
    VendorUser::create(['vendor_id' => Vendor::factory()->create()->id, 'user_id' => $otherVendorUser->id]);

    $this->actingAs($vendorUser)
        ->get(route('users.edit', $otherVendorUser))
        ->assertForbidden();
});

test('vendors can only create vendor and app user accounts for their vendor', function () {
    $vendor = Vendor::factory()->create();
    $vendorUser = User::factory()->create();
    $vendorUser->assignRole(Role::findOrCreate('Vendor', 'web'));
    VendorUser::create(['vendor_id' => $vendor->id, 'user_id' => $vendorUser->id, 'vendor_type' => 'Vendor']);
    Role::findOrCreate('Admin', 'web');
    Role::findOrCreate('Internal User', 'web');
    Role::findOrCreate('App User', 'web');

    $this->actingAs($vendorUser)
        ->post(route('users.store'), [
            'name' => 'Vendor App User',
            'email' => 'vendor-app-user@example.com',
            'phone' => '+255712345678',
            'password' => 'SecurePass123!',
            'password_confirmation' => 'SecurePass123!',
            'role' => 'App User',
        ])
        ->assertRedirect();

    $createdUser = User::where('email', 'vendor-app-user@example.com')->firstOrFail();

    expect($createdUser->hasRole('App User'))->toBeTrue();
    $this->assertDatabaseHas('vendor_users', [
        'vendor_id' => $vendor->id,
        'user_id' => $createdUser->id,
        'vendor_type' => 'App User',
    ]);

    $this->actingAs($vendorUser)
        ->post(route('users.store'), [
            'name' => 'Unauthorized Admin',
            'email' => 'unauthorized-admin@example.com',
            'password' => 'SecurePass123!',
            'password_confirmation' => 'SecurePass123!',
            'role' => 'Admin',
        ])
        ->assertSessionHasErrors('role');
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
