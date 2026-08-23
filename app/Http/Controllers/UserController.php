<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * Display a listing of the users.
     */
    public function index(): Response
    {
        return Inertia::render('users/index', [
            'users' => User::query()
                ->with('roles:id,name')
                ->orderBy('name')
                ->get(['id', 'name', 'email', 'phone', 'created_at'])
                ->map(fn (User $user): array => [
                    ...$user->only(['id', 'name', 'email', 'phone', 'created_at']),
                    'roles' => $user->roles->pluck('name')->values(),
                ]),
            'roles' => Role::query()
                ->where('guard_name', 'web')
                ->orderBy('name')
                ->pluck('name'),
        ]);
    }

    /**
     * Store a newly created user.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:20'],
            'password' => ['required', 'confirmed', Password::defaults()],
            'role' => [
                'required',
                'string',
                Rule::exists('roles', 'name')->where('guard_name', 'web'),
            ],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'password' => $validated['password'],
        ]);

        $user->assignRole($validated['role']);

        return back()->with('toast', ['type' => 'success', 'message' => 'User created.']);
    }

    /**
     * Show the form for editing the user and assigning permissions.
     */
    public function edit(User $user): Response
    {
        return Inertia::render('users/edit', [
            'user' => $user->only(['id', 'name', 'email', 'phone']),
            'userPermissions' => $user->permissions()->pluck('name'),
            'permissions' => Permission::query()->orderBy('name')->pluck('name'),
        ]);
    }

    /**
     * Update the specified user.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'phone' => ['nullable', 'string', 'max:20'],
        ]);

        $user->update($validated);

        return back()->with('toast', ['type' => 'success', 'message' => 'User updated.']);
    }

    /**
     * Sync the permissions assigned to the user.
     */
    public function syncPermissions(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'permissions' => ['array'],
            'permissions.*' => ['string', Rule::exists('permissions', 'name')],
        ]);

        $user->syncPermissions($validated['permissions'] ?? []);

        return back()->with('toast', ['type' => 'success', 'message' => 'Permissions updated.']);
    }

    /**
     * Remove the specified user.
     */
    public function destroy(Request $request, User $user): RedirectResponse
    {
        abort_if($user->id === $request->user()->id, 403, 'You cannot delete your own account.');

        $user->delete();

        return back()->with('toast', ['type' => 'success', 'message' => 'User deleted.']);
    }
}
