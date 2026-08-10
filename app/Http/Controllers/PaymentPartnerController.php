<?php

namespace App\Http\Controllers;

use App\Models\PaymentPartner;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PaymentPartnerController extends Controller
{
    /**
     * Display a listing of the payment partners.
     */
    public function index(): Response
    {
        return Inertia::render('system-settings/payment-partners', [
            'partners' => PaymentPartner::query()
                ->latest()
                ->get(['id', 'name', 'is_active', 'image', 'created_at'])
                ->map(fn (PaymentPartner $partner) => $partner->append('image_url')),
        ]);
    }

    /**
     * Store a newly created payment partner.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validateData($request);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('payment-partners', 'public');
        }

        PaymentPartner::create($validated);

        return back()->with('toast', ['type' => 'success', 'message' => 'Payment partner created.']);
    }

    /**
     * Update the specified payment partner.
     */
    public function update(Request $request, PaymentPartner $paymentPartner): RedirectResponse
    {
        $validated = $this->validateData($request, $paymentPartner);

        if ($request->hasFile('image')) {
            if ($paymentPartner->image) {
                Storage::disk('public')->delete($paymentPartner->image);
            }

            $validated['image'] = $request->file('image')->store('payment-partners', 'public');
        }

        $paymentPartner->update($validated);

        return back()->with('toast', ['type' => 'success', 'message' => 'Payment partner updated.']);
    }

    /**
     * Soft delete the specified payment partner.
     */
    public function destroy(PaymentPartner $paymentPartner): RedirectResponse
    {
        $paymentPartner->delete();

        return back()->with('toast', ['type' => 'success', 'message' => 'Payment partner deleted.']);
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    private function validateData(Request $request, ?PaymentPartner $partner = null): array
    {
        return $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique(PaymentPartner::class, 'name')
                    ->ignore($partner)
                    ->whereNull('deleted_at'),
            ],
            'is_active' => ['boolean'],
            'image' => ['nullable', 'image', 'mimes:png,jpg,jpeg,webp,svg', 'max:2048'],
        ]);
    }
}
