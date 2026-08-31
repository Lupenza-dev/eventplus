<?php

namespace App\Mail;

use App\Models\TicketPurchase;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TicketGenerated extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public TicketPurchase $purchase)
    {
        $this->purchase->loadMissing('event', 'ticket');
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Your ticket for '.$this->purchase->event->title);
    }

    public function content(): Content
    {
        return new Content(view: 'emails.tickets.generated');
    }

    /**
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return [Attachment::fromStorageDisk('public', $this->purchase->ticket_path)
            ->as('ticket-'.$this->purchase->uuid.'.png')
            ->withMime('image/png')];
    }
}
