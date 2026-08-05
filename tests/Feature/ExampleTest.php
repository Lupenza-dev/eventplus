<?php

use Inertia\Testing\AssertableInertia as Assert;

test('returns a successful response', function () {
    $response = $this->get(route('home'));

    $response->assertOk();
});

test('renders the welcome landing page', function () {
    $response = $this->get(route('home'));

    $response->assertInertia(fn (Assert $page) => $page->component('welcome'));
});
