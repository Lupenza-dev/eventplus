<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\LoginScannerRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ScannerAuthController extends Controller
{
    public function login(LoginScannerRequest $request): JsonResponse
    {
        $user = User::query()->where('email', $request->validated('email'))->first();

        if (! $user || ! Hash::check($request->validated('password'), $user->password)) {
            return response()->json([
                'message' => 'The provided credentials are incorrect.',
                'errors' => ['email' => ['The provided credentials are incorrect.']],
            ], 422);
        }

        if (! $user->hasRole('App User')) {
            return response()->json(['message' => 'This account is not permitted to use the scanner.'], 403);
        }

        $token = $user->createToken('eventplus-scanner')->plainTextToken;

        return response()->json([
            'success' => true,
            'data' => [
                'user' => $this->userData($user),
                'token' => $token,
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json(['success' => true]);
    }

    /** @return array{id: int, name: string, email: string, role: string|null} */
    private function userData(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->getRoleNames()->first(),
        ];
    }
}
