import {
    Bell,
    CalendarCheck,
    CreditCard,
    LucideIcon,
    MessageCircle,
    QrCode,
    Search,
    Ticket,
    Zap,
} from 'lucide-react';

export interface Step {
    icon: LucideIcon;
    title: string;
    description: string;
}

export const steps: Step[] = [
    {
        icon: Search,
        title: 'Browse events',
        description:
            'Explore concerts, conferences, sports, and more — filtered by city, date, and category.',
    },
    {
        icon: MessageCircle,
        title: 'Open the WhatsApp bot',
        description:
            'Say hello to our AI assistant on WhatsApp. No app downloads, no new accounts.',
    },
    {
        icon: CreditCard,
        title: 'Pick and pay',
        description:
            'Choose your event, select seats, and pay securely — right inside the chat.',
    },
    {
        icon: QrCode,
        title: 'Get your ticket instantly',
        description:
            'Your digital QR ticket arrives in seconds. Show it at the gate and walk in.',
    },
];

export interface EventItem {
    id: number;
    name: string;
    date: string | null;
    location: string | null;
    price: string;
    category: string | null;
    image: string | null;
}

export interface Feature {
    icon: LucideIcon;
    title: string;
    description: string;
}

export const features: Feature[] = [
    {
        icon: MessageCircle,
        title: 'WhatsApp integration',
        description:
            'Discover, book, and manage tickets in the app your attendees already use every day.',
    },
    {
        icon: Zap,
        title: 'Instant ticket delivery',
        description:
            'Tickets land in the chat the moment payment clears — no email, no waiting.',
    },
    {
        icon: CreditCard,
        title: 'Secure payments',
        description:
            'PCI-compliant checkout with mobile money and card support, encrypted end to end.',
    },
    {
        icon: QrCode,
        title: 'QR-code verification',
        description:
            'Every ticket carries a unique QR code. Scan at the door, validate in milliseconds.',
    },
    {
        icon: Bell,
        title: 'Real-time notifications',
        description:
            'Reminders, gate changes, and low-stock alerts delivered straight to WhatsApp.',
    },
    {
        icon: CalendarCheck,
        title: 'Easy event management',
        description:
            'Organizers create events, track sales, and check in guests from one dashboard.',
    },
];

export interface Testimonial {
    name: string;
    role: string;
    image: string;
    quote: string;
}

export const testimonials: Testimonial[] = [
    {
        name: 'Amina Hassan',
        role: 'Festival-goer',
        image: 'https://i.pravatar.cc/96?img=47',
        quote: 'I bought two festival tickets during my lunch break — entirely on WhatsApp. The QR ticket arrived before I finished typing "thank you".',
    },
    {
        name: 'Daniel Mwakalinga',
        role: 'Event organizer',
        image: 'https://i.pravatar.cc/96?img=12',
        quote: 'EventPlus cut our gate queues in half. Attendees arrive with QR codes ready, and check-in is a single scan.',
    },
    {
        name: 'Grace Njoroge',
        role: 'Conference attendee',
        image: 'https://i.pravatar.cc/96?img=32',
        quote: 'No app to install, no account to create. I asked the bot for tech events near me and paid in the same conversation.',
    },
];

export const stats = [
    { value: '500+', label: 'Events' },
    { value: '50,000+', label: 'Tickets sold' },
    { value: '10,000+', label: 'Users' },
];

export const contact = {
    phone: '+255 700 000 000',
    email: 'hello@eventplus.co',
    address: '12 Ocean Road, Dar es Salaam, Tanzania',
    hours: 'Mon–Fri: 8:00 AM – 6:00 PM',
    whatsappUrl: 'https://wa.me/255700000000?text=Hi%20EventPlus!',
};
