<?php

use App\Concerns\TicketGenerator;
use App\Mail\TicketGenerated;
use App\Models\TicketPurchase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

class TicketGeneratorHarness
{
    use TicketGenerator;
}

test('it creates and emails a ticket image from the purchase id', function () {
    Storage::fake('public');
    Mail::fake();

    $purchase = TicketPurchase::factory()->create();
    $template = UploadedFile::fake()->image('ticket.png', 1000, 500);
    $templatePath = $template->store('tickets', 'public');

    $purchase->ticket->update([
        'design_image' => $templatePath,
        'qr_code_x' => 60,
        'qr_code_y' => 50,
        'qr_code_width' => 20,
        'qr_code_height' => 30,
    ]);

    $path = (new TicketGeneratorHarness)->generateTicket($purchase->id);

    expect($path)->toBe("generated-tickets/{$purchase->uuid}.png");
    Storage::disk('public')->assertExists($path);
    expect($purchase->fresh()->ticket_path)->toBe($path);
    Mail::assertSent(TicketGenerated::class, fn (TicketGenerated $mail) => $mail->hasTo($purchase->email));
});
