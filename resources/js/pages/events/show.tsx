import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { CalendarDays, Clock, MapPin, MessageCircle, Ticket } from 'lucide-react';
import Footer from '@/components/landing/footer';
import Navbar from '@/components/landing/navbar';
import TopBar from '@/components/landing/top-bar';
import { contact } from '@/components/landing/data';
import { home } from '@/routes';

type EventInfo = {
    id: number;
    title: string;
    description: string | null;
    location: string | null;
    event_date: string | null;
    start_date: string | null;
    end_date: string | null;
    is_paid_event: boolean;
    image_url: string | null;
    category: string | null;
};

type TicketItem = {
    id: number;
    name: string;
    price: string;
    quantity: number;
    description: string | null;
};

type Props = {
    event: EventInfo;
    tickets: TicketItem[];
};

function formatPrice(price: string): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'TZS',
        maximumFractionDigits: 0,
    }).format(Number(price));
}

function formatEventDate(value: string): string {
    return new Date(value).toLocaleString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

function formatTime(value: string): string {
    return new Date(value).toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
    });
}

function buyOnWhatsApp(eventName: string, ticketName: string): string {
    const message = `Hi EventPlus! I'd like to buy a "${ticketName}" ticket for "${eventName}". Could you help me with the booking?`;

    return `https://wa.me/${contact.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
}

function TicketCard({
    event,
    ticket,
    index,
}: {
    event: EventInfo;
    ticket: TicketItem;
    index: number;
}) {
    const soldOut = ticket.quantity <= 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            className="flex flex-col gap-4 rounded-2xl border border-[#2D3436]/8 bg-white p-6 shadow-md shadow-[#2D3436]/5 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-[#6C5CE7]/10"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#6C5CE7]/10">
                        <Ticket className="h-5 w-5 text-[#6C5CE7]" aria-hidden="true" />
                    </span>
                    <h3 className="text-base font-bold text-[#2D3436]">{ticket.name}</h3>
                </div>
                <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        soldOut ? 'bg-[#FF6B6B]/10 text-[#F35555]' : 'bg-[#00B894]/10 text-[#00B894]'
                    }`}
                >
                    {soldOut ? 'Sold out' : `${ticket.quantity} left`}
                </span>
            </div>

            {ticket.description && (
                <p className="text-sm leading-relaxed text-[#2D3436]/60">{ticket.description}</p>
            )}

            <div className="mt-auto flex items-center justify-between gap-3 border-t border-[#2D3436]/8 pt-4">
                <div>
                    <p className="text-xs text-[#2D3436]/50">Price</p>
                    <p className="text-lg font-bold text-[#2D3436]">{formatPrice(ticket.price)}</p>
                </div>
                <a
                    href={soldOut ? '#' : buyOnWhatsApp(event.title, ticket.name)}
                    target={soldOut ? undefined : '_blank'}
                    rel={soldOut ? undefined : 'noreferrer'}
                    aria-disabled={soldOut}
                    className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${
                        soldOut
                            ? 'cursor-not-allowed bg-[#2D3436]/10 text-[#2D3436]/40'
                            : 'bg-[#00B894] text-white shadow-lg shadow-[#00B894]/25 hover:-translate-y-0.5 hover:bg-[#00A483] hover:shadow-xl hover:shadow-[#00B894]/30'
                    }`}
                >
                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                    {soldOut ? 'Sold out' : 'Buy via WhatsApp'}
                </a>
            </div>
        </motion.div>
    );
}

export default function EventShow({ event, tickets }: Props) {
    const cheapest = tickets.length > 0 ? Math.min(...tickets.map((t) => Number(t.price))) : null;
    const isFree = !event.is_paid_event && (cheapest === null || cheapest === 0);

    return (
        <>
            <Head title={`${event.title} — EventPlus`}>
                <meta
                    name="description"
                    content={event.description ?? `Buy tickets for ${event.title}.`}
                />
            </Head>
            <div className="scroll-smooth bg-white font-sans text-[#2D3436] antialiased">
                <TopBar />
                <Navbar />

                <main className="bg-[#F8F9FC]">
                    <div className="mx-auto max-w-7xl px-4 pt-10 pb-16 sm:px-6 lg:px-8">
                        <Link
                            href={home()}
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#2D3436]/60 transition-colors hover:text-[#6C5CE7]"
                        >
                            <span aria-hidden="true">←</span> Back to all events
                        </Link>

                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="mt-6 overflow-hidden rounded-3xl bg-white shadow-xl shadow-[#2D3436]/8"
                        >
                            <div className="grid md:grid-cols-2">
                                <div className="relative min-h-72 bg-[#6C5CE7]/10">
                                    {event.image_url ? (
                                        <img
                                            src={event.image_url}
                                            alt={event.title}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full min-h-72 w-full items-center justify-center bg-linear-to-br from-[#6C5CE7] to-[#8E7CF8]">
                                            <Ticket className="h-16 w-16 text-white/80" aria-hidden="true" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-5 p-7 md:p-10">
                                    <div className="flex flex-wrap items-center gap-2">
                                        {event.category && (
                                            <span className="rounded-full bg-[#6C5CE7]/10 px-3 py-1 text-xs font-semibold text-[#6C5CE7]">
                                                {event.category}
                                            </span>
                                        )}
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                isFree ? 'bg-[#00B894]/10 text-[#00B894]' : 'bg-[#FDCB6E]/15 text-[#B8860B]'
                                            }`}
                                        >
                                            {isFree ? 'Free event' : 'Paid event'}
                                        </span>
                                    </div>

                                    <h1 className="text-3xl font-bold tracking-tight text-[#2D3436] md:text-4xl">
                                        {event.title}
                                    </h1>

                                    {event.description && (
                                        <p className="leading-relaxed text-[#2D3436]/65">
                                            {event.description}
                                        </p>
                                    )}

                                    <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-[#2D3436]/70">
                                        {event.event_date && (
                                            <span className="flex items-center gap-2">
                                                <CalendarDays className="h-4 w-4 text-[#6C5CE7]" aria-hidden="true" />
                                                {formatEventDate(event.event_date)}
                                            </span>
                                        )}
                                        {event.location && (
                                            <span className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-[#6C5CE7]" aria-hidden="true" />
                                                {event.location}
                                            </span>
                                        )}
                                    </div>

                                    <div className="mt-auto flex flex-wrap items-center justify-between gap-4 border-t border-[#2D3436]/8 pt-5">
                                        <div>
                                            <p className="text-xs text-[#2D3436]/50">Tickets from</p>
                                            <p className="text-2xl font-bold text-[#6C5CE7]">
                                                {isFree ? 'Free' : cheapest !== null ? formatPrice(String(cheapest)) : '—'}
                                            </p>
                                        </div>
                                        {tickets.length > 0 && (
                                            <a
                                                href="#tickets"
                                                className="inline-flex items-center gap-2 rounded-xl bg-[#6C5CE7] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#6C5CE7]/30 transition-all hover:-translate-y-0.5 hover:bg-[#5B4BD4] hover:shadow-xl hover:shadow-[#6C5CE7]/35"
                                            >
                                                <Ticket className="h-4 w-4" aria-hidden="true" />
                                                Choose a ticket
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.section>

                        <section id="tickets" className="mt-12 scroll-mt-24">
                            <div className="mb-6 flex items-end justify-between gap-4">
                                <div>
                                    <p className="text-sm font-semibold tracking-wide text-[#6C5CE7] uppercase">
                                        Tickets
                                    </p>
                                    <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#2D3436]">
                                        Choose your ticket
                                    </h2>
                                </div>
                                <p className="hidden items-center gap-2 text-sm text-[#2D3436]/50 sm:flex">
                                    <Clock className="h-4 w-4" aria-hidden="true" />
                                    Book instantly on WhatsApp
                                </p>
                            </div>

                            {tickets.length === 0 ? (
                                <div className="rounded-3xl border-2 border-dashed border-[#2D3436]/10 bg-white px-6 py-16 text-center">
                                    <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#6C5CE7]/10">
                                        <Ticket className="h-6 w-6 text-[#6C5CE7]" aria-hidden="true" />
                                    </span>
                                    <h3 className="mt-4 text-lg font-bold text-[#2D3436]">
                                        Tickets coming soon
                                    </h3>
                                    <p className="mx-auto mt-1.5 max-w-sm text-sm text-[#2D3436]/60">
                                        Ticket types for this event haven't been published yet. Check
                                        back later or ask the WhatsApp bot.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                    {tickets.map((ticket, i) => (
                                        <TicketCard
                                            key={ticket.id}
                                            event={event}
                                            ticket={ticket}
                                            index={i}
                                        />
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                </main>

                <Footer />
            </div>
        </>
    );
}
