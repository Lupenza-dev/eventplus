import { useForm } from '@inertiajs/react';
import { CircleCheck, CreditCard, LoaderCircle, Ticket } from 'lucide-react';
import { useState } from 'react';
import { purchase } from '@/routes/events/tickets';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

type PaymentPartnerItem = {
    id: number;
    name: string;
    image_url: string | null;
};

type PurchaseTicket = {
    id: number;
    name: string;
    price: string;
    quantity: number;
};

type Props = {
    event: { id: number; title: string };
    ticket: PurchaseTicket;
    paymentPartners: PaymentPartnerItem[];
};

function formatPrice(price: string): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'TZS',
        maximumFractionDigits: 0,
    }).format(Number(price));
}

function initialPartnerId(isFree: boolean, partners: PaymentPartnerItem[]): string {
    if (isFree || partners.length === 0) {
        return '';
    }

    return String(partners[0].id);
}

export function PurchaseTicketDialog({ event, ticket, paymentPartners }: Props) {
    const [open, setOpen] = useState(false);
    const [purchased, setPurchased] = useState(false);
    const isFree = Number(ticket.price) === 0;
    const soldOut = ticket.quantity <= 0;

    const form = useForm({
        email: '',
        phone_number: '',
        payment_partner_id: initialPartnerId(isFree, paymentPartners),
    });

    const close = () => {
        setOpen(false);
        setPurchased(false);
        form.reset();
        form.clearErrors();
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        form.post(purchase({ event: event.id, ticket: ticket.id }).url, {
            preserveScroll: true,
            onSuccess: () => setPurchased(true),
        });
    };

    return (
        <Dialog open={open} onOpenChange={(next) => (next ? setOpen(true) : close())}>
            <DialogTrigger asChild>
                <button
                    type="button"
                    disabled={soldOut}
                    className={cn(
                        'inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all',
                        soldOut
                            ? 'cursor-not-allowed bg-[#2D3436]/10 text-[#2D3436]/40'
                            : 'bg-[#00B894] text-white shadow-lg shadow-[#00B894]/25 hover:-translate-y-0.5 hover:bg-[#00A483] hover:shadow-xl hover:shadow-[#00B894]/30'
                    )}
                >
                    <Ticket className="h-4 w-4" aria-hidden="true" />
                    {soldOut ? 'Sold out' : 'Buy now'}
                </button>
            </DialogTrigger>

            <DialogContent className="max-w-md overflow-hidden rounded-3xl p-0 sm:max-w-md">
                {purchased ? (
                    <div className="flex flex-col items-center gap-3 px-8 py-14 text-center">
                        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#00B894]/10">
                            <CircleCheck className="h-8 w-8 text-[#00B894]" aria-hidden="true" />
                        </span>
                        <DialogTitle className="text-lg font-bold text-[#2D3436]">
                            {isFree ? 'Spot reserved!' : 'Booking received!'}
                        </DialogTitle>
                        <p className="max-w-xs text-sm leading-relaxed text-[#2D3436]/60">
                            {isFree
                                ? 'You\'re all set for this event. See you there!'
                                : 'Our team will reach out on WhatsApp to confirm your payment and share your ticket.'}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="relative bg-linear-to-br from-[#6C5CE7] to-[#8E7CF8] px-6 pt-6 pb-8">
                            <p className="text-[11px] font-bold tracking-[0.14em] text-white/70 uppercase">
                                EventPlus Ticket
                            </p>
                            <DialogTitle className="mt-1.5 text-xl font-bold text-white">
                                {ticket.name}
                            </DialogTitle>
                            <p className="mt-0.5 truncate text-sm text-white/80">{event.title}</p>

                            <div className="absolute inset-x-6 -bottom-4 flex items-center justify-between">
                                <span className="h-8 w-8 rounded-full bg-white shadow-md shadow-[#2D3436]/10" aria-hidden="true" />
                                <span className="h-px w-full border-t-2 border-dashed border-white/50" aria-hidden="true" />
                                <span className="h-8 w-8 rounded-full bg-white shadow-md shadow-[#2D3436]/10" aria-hidden="true" />
                            </div>
                        </div>

                        <form
                            onSubmit={submit}
                            className="flex flex-col gap-5 px-6 pt-7 pb-6"
                            noValidate
                        >
                            <div className="flex flex-col gap-1.5">
                                <label
                                    htmlFor={`email-${ticket.id}`}
                                    className="text-sm font-semibold text-[#2D3436]"
                                >
                                    Email
                                </label>
                                <input
                                    id={`email-${ticket.id}`}
                                    type="email"
                                    autoComplete="email"
                                    placeholder="you@example.com"
                                    value={form.data.email}
                                    onChange={(e) => form.setData('email', e.target.value)}
                                    className="h-11 w-full rounded-xl border border-[#2D3436]/15 bg-[#F8F9FC] px-3.5 text-sm text-[#2D3436] transition-colors outline-none placeholder:text-[#2D3436]/35 focus:border-[#6C5CE7] focus:ring-2 focus:ring-[#6C5CE7]/20"
                                />
                                {form.errors.email && (
                                    <p className="text-xs font-medium text-[#F35555]">{form.errors.email}</p>
                                )}
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label
                                    htmlFor={`phone-${ticket.id}`}
                                    className="text-sm font-semibold text-[#2D3436]"
                                >
                                    Phone number
                                </label>
                                <input
                                    id={`phone-${ticket.id}`}
                                    type="tel"
                                    autoComplete="tel"
                                    placeholder="+255 7XX XXX XXX"
                                    value={form.data.phone_number}
                                    onChange={(e) => form.setData('phone_number', e.target.value)}
                                    className="h-11 w-full rounded-xl border border-[#2D3436]/15 bg-[#F8F9FC] px-3.5 text-sm text-[#2D3436] transition-colors outline-none placeholder:text-[#2D3436]/35 focus:border-[#6C5CE7] focus:ring-2 focus:ring-[#6C5CE7]/20"
                                />
                                {form.errors.phone_number && (
                                    <p className="text-xs font-medium text-[#F35555]">
                                        {form.errors.phone_number}
                                    </p>
                                )}
                            </div>

                            {!isFree && (
                                <div className="flex flex-col gap-2">
                                    <span className="text-sm font-semibold text-[#2D3436]">
                                        Pay with
                                    </span>
                                    {paymentPartners.length === 0 ? (
                                        <p className="rounded-xl border border-[#FDCB6E]/40 bg-[#FDCB6E]/10 px-3.5 py-3 text-sm text-[#B8860B]">
                                            No payment methods are available right now. Try again
                                            shortly.
                                        </p>
                                    ) : (
                                        <div className="flex flex-col gap-2">
                                            {paymentPartners.map((partner) => (
                                                <label
                                                    key={partner.id}
                                                    className={cn(
                                                        'flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 transition-all',
                                                        form.data.payment_partner_id === String(partner.id)
                                                            ? 'border-[#6C5CE7] bg-[#6C5CE7]/5 ring-2 ring-[#6C5CE7]/15'
                                                            : 'border-[#2D3436]/12 bg-white hover:border-[#6C5CE7]/40'
                                                    )}
                                                >
                                                    <input
                                                        type="radio"
                                                        name={`payment-${ticket.id}`}
                                                        value={String(partner.id)}
                                                        checked={form.data.payment_partner_id === String(partner.id)}
                                                        onChange={() =>
                                                            form.setData(
                                                                'payment_partner_id',
                                                                String(partner.id)
                                                            )
                                                        }
                                                        className="sr-only"
                                                    />
                                                    {partner.image_url ? (
                                                        <img
                                                            src={partner.image_url}
                                                            alt={partner.name}
                                                            className="h-9 w-9 rounded-lg bg-[#F8F9FC] object-contain p-1"
                                                        />
                                                    ) : (
                                                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#6C5CE7]/10 text-sm font-bold text-[#6C5CE7]">
                                                            {partner.name.charAt(0)}
                                                        </span>
                                                    )}
                                                    <span className="flex-1 text-sm font-semibold text-[#2D3436]">
                                                        {partner.name}
                                                    </span>
                                                    <span
                                                        className={cn(
                                                            'flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors',
                                                            form.data.payment_partner_id === String(partner.id)
                                                                ? 'border-[#6C5CE7] bg-[#6C5CE7]'
                                                                : 'border-[#2D3436]/20'
                                                        )}
                                                    >
                                                        {form.data.payment_partner_id === String(partner.id) && (
                                                            <span className="h-1.5 w-1.5 rounded-full bg-white" />
                                                        )}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                    {form.errors.payment_partner_id && (
                                        <p className="text-xs font-medium text-[#F35555]">
                                            {form.errors.payment_partner_id}
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="flex items-center justify-between rounded-xl bg-[#F8F9FC] px-4 py-3">
                                <span className="flex items-center gap-2 text-sm font-medium text-[#2D3436]/70">
                                    <CreditCard className="h-4 w-4 text-[#6C5CE7]" aria-hidden="true" />
                                    {isFree ? 'Free ticket' : 'Amount to pay'}
                                </span>
                                <span className="text-lg font-bold text-[#2D3436]">
                                    {isFree ? 'Free' : formatPrice(ticket.price)}
                                </span>
                            </div>

                            <button
                                type="submit"
                                disabled={form.processing || (!isFree && paymentPartners.length === 0)}
                                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#6C5CE7] px-6 text-sm font-semibold text-white shadow-lg shadow-[#6C5CE7]/25 transition-all hover:-translate-y-0.5 hover:bg-[#5B4BD4] hover:shadow-xl hover:shadow-[#6C5CE7]/30 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                            >
                                {form.processing && (
                                    <LoaderCircle
                                        className="h-4 w-4 animate-spin"
                                        aria-hidden="true"
                                    />
                                )}
                                {isFree ? 'Confirm booking' : `Pay ${formatPrice(ticket.price)}`}
                            </button>
                        </form>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
