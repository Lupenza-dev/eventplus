<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\VendorUser;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    private const VendorRoles = ['Vendor', 'App User'];

    /**
     * Display a listing of the users.
     */
    public function index(Request $request): Response
    {
        /** @var User $authenticatedUser */
        $authenticatedUser = $request->user();

        return Inertia::render('users/index', [
            'users' => User::query()
                ->when(
                    $this->isVendorUser($authenticatedUser),
                    fn ($query) => $query->whereHas('vendors', fn ($vendorQuery) => $vendorQuery
                        ->whereIn('vendors.id', $authenticatedUser->vendors()->select('vendors.id'))),
                )
                ->with('roles:id,name')
                ->orderBy('name')
                ->get(['id', 'name', 'email', 'phone', 'created_at'])
                ->map(fn (User $user): array => [
                    ...$user->only(['id', 'name', 'email', 'phone', 'created_at']),
                    'roles' => $user->roles->pluck('name')->values(),
                ]),
            'roles' => $this->availableRoleNames($authenticatedUser),
        ]);
    }

    /**
     * Store a newly created user.
     */
    public function store(Request $request): RedirectResponse
    {
        /** @var User $authenticatedUser */
        $authenticatedUser = $request->user();
        $availableRoleNames = $this->availableRoleNames($authenticatedUser);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:20'],
            'password' => ['required', 'confirmed', Password::defaults()],
            'role' => [
                'required',
                'string',
                Rule::in($availableRoleNames),
            ],
        ]);

        DB::transaction(function () use ($authenticatedUser, $validated): void {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'password' => $validated['password'],
            ]);

            $user->assignRole($validated['role']);

            if ($this->isVendorUser($authenticatedUser)) {
                $vendor = $authenticatedUser->vendors()->firstOrFail();

                VendorUser::create([
                    'vendor_id' => $vendor->id,
                    'user_id' => $user->id,
                    'vendor_type' => $validated['role'],
                ]);
            }
        });

        return back()->with('toast', ['type' => 'success', 'message' => 'User created.']);
    }

    /**
     * Show the form for editing the user and assigning permissions.
     */
    public function edit(User $user): Response
    {
        /** @var User $authenticatedUser */
        $authenticatedUser = request()->user();

        $this->ensureUserIsManageable($authenticatedUser, $user);

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
        /** @var User $authenticatedUser */
        $authenticatedUser = $request->user();

        $this->ensureUserIsManageable($authenticatedUser, $user);

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
        /** @var User $authenticatedUser */
        $authenticatedUser = $request->user();

        $this->ensureUserIsManageable($authenticatedUser, $user);

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
        /** @var User $authenticatedUser */
        $authenticatedUser = $request->user();

        $this->ensureUserIsManageable($authenticatedUser, $user);

        abort_if($user->id === $request->user()->id, 403, 'You cannot delete your own account.');

        $user->delete();

        return back()->with('toast', ['type' => 'success', 'message' => 'User deleted.']);
    }

    /**
     * @return array<int, string>
     */
    private function availableRoleNames(User $user): array
    {
        return Role::query()
            ->where('guard_name', 'web')
            ->when(
                $this->isVendorUser($user),
                fn ($query) => $query->whereIn('name', self::VendorRoles),
            )
            ->orderBy('name')
            ->pluck('name')
            ->all();
    }

    private function ensureUserIsManageable(User $authenticatedUser, User $user): void
    {
        if (! $this->isVendorUser($authenticatedUser)) {
            return;
        }

        abort_unless(
            $user->vendors()
                ->whereIn('vendors.id', $authenticatedUser->vendors()->select('vendors.id'))
                ->exists(),
            403,
        );
    }

    private function isVendorUser(User $user): bool
    {
        return $user->hasRole('Vendor') && ! $user->hasRole('Admin');
    }
}
