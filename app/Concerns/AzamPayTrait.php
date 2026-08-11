<?php

namespace App\Concerns;

use Illuminate\Support\Facades\Http;

trait AzamPayTrait
{
    public function tokenGeneration()
    {

        // return env('AZAM_APPNAME').''.env('AZAM_CLIENT_ID').''.env('AZAM_CLIENT_SECRET');
        $response = Http::withToken(''.env('AZAM_TOKEN').'')
            ->post('https://authenticator-sandbox.azampay.co.tz/AppRegistration/GenerateToken ', [
                'appName' => env('AZAM_APPNAME'),
                'clientId' => env('AZAM_CLIENT_ID'),
                'clientSecret' => env('AZAM_CLIENT_SECRET'),
            ]);

        return $response->json();

    }
}
