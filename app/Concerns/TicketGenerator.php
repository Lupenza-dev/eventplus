<?php

namespace App\Concerns;

use App\Mail\TicketGenerated;
use App\Models\EventTicket;
use App\Models\TicketPurchase;
use BaconQrCode\Renderer\GDLibRenderer;
use BaconQrCode\Writer;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

trait TicketGenerator
{
    /**
     * Create a ticket image from the purchase's ticket design, email it to the
     * buyer, and return the relative path where it was stored.
     */
    public function generateTicket(int $ticketPurchaseId): string
    {
        $purchase = TicketPurchase::query()
            ->with('ticket')
            ->find($ticketPurchaseId);

        if (! $purchase instanceof TicketPurchase) {
            throw (new ModelNotFoundException)->setModel(TicketPurchase::class, [$ticketPurchaseId]);
        }

        $ticket = $purchase->ticket;

        if (! $ticket instanceof EventTicket) {
            throw new RuntimeException('The ticket purchase does not have a ticket design.');
        }

        $templatePath = $ticket->design_image;

        if (! $templatePath || ! Storage::disk('public')->exists($templatePath)) {
            throw new RuntimeException('A ticket design image is required before a ticket can be generated.');
        }

        $template = @imagecreatefromstring(Storage::disk('public')->get($templatePath));

        if ($template === false) {
            throw new RuntimeException('The ticket design image could not be read.');
        }

        try {
            $width = imagesx($template);
            $height = imagesy($template);
            $qrCode = imagecreatefromstring($this->qrCode($purchase->uuid));

            if ($qrCode === false) {
                throw new RuntimeException('The QR code could not be created.');
            }

            try {
                $destinationX = (int) round($width * ((float) $ticket->qr_code_x / 100));
                $destinationY = (int) round($height * ((float) $ticket->qr_code_y / 100));
                $destinationWidth = max(1, (int) round($width * ((float) $ticket->qr_code_width / 100)));
                $destinationHeight = max(1, (int) round($height * ((float) $ticket->qr_code_height / 100)));

                imagecopyresampled(
                    $template,
                    $qrCode,
                    $destinationX,
                    $destinationY,
                    0,
                    0,
                    $destinationWidth,
                    $destinationHeight,
                    imagesx($qrCode),
                    imagesy($qrCode),
                );
            } finally {
                imagedestroy($qrCode);
            }

            ob_start();
            imagepng($template);
            $image = ob_get_clean();

            if (! is_string($image)) {
                throw new RuntimeException('The ticket image could not be saved.');
            }
        } finally {
            imagedestroy($template);
        }

        $path = "generated-tickets/{$purchase->uuid}.png";
        Storage::disk('public')->put($path, $image);
        $purchase->forceFill(['ticket_path' => $path])->save();

        Mail::to($purchase->email)->send(new TicketGenerated($purchase));

        return $path;
    }

    private function qrCode(string $uuid): string
    {
        $payload = rtrim((string) config('app.url'), '/').'/'.$uuid;

        return (new Writer(new GDLibRenderer(1200, 4, 'png')))->writeString($payload);
    }
}
