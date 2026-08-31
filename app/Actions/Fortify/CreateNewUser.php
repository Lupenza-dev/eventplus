<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\User;
use App\Models\Vendor;
use App\Models\VendorUser;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            ...$this->profileRules(),
            'business_name' => ['required', 'string', 'max:255'],
            'business_address' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:32'],
            'password' => $this->passwordRules(),
        ])->validate();

        return DB::transaction(function () use ($input): User {
            $vendor = Vendor::create([
                'name' => $input['business_name'],
                'address' => $input['business_address'],
            ]);

            $user = User::create([
                'name' => $input['name'],
                'email' => $input['email'],
                'phone' => $input['phone'],
                'password' => $input['password'],
            ]);

            VendorUser::create([
                'vendor_id' => $vendor->id,
                'user_id' => $user->id,
                'vendor_type' => 'Vendor',
            ]);

            $user->assignRole('Vendor');

            return $user;
        });
    }
}
