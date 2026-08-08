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
    name: string;
    date: string;
    location: string;
    price: string;
    category: string;
    image: string;
}

export const events: EventItem[] = [
    {
        name: 'Sauti za Busara Festival',
        date: 'Fri, Feb 13 · 6:00 PM',
        location: 'Stone Town, Zanzibar',
        price: 'TZS 45',
        category: 'Music',
        image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=800&q=70',
    },
    {
        name: 'TechCrunch Startup Summit',
        date: 'Sat, Mar 7 · 9:00 AM',
        location: 'Dar es Salaam',
        price: 'TZS 120',
        category: 'Conference',
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=70',
    },
    {
        name: 'Serengeti Marathon',
        date: 'Sun, Apr 12 · 5:30 AM',
        location: 'Arusha',
        price: 'TZS 30',
        category: 'Sports',
        image: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=800&q=70',
    },
    {
        name: 'Taste of the City Food Fest',
        date: 'Sat, Mar 21 · 12:00 PM',
        location: 'Mwanza',
        price: 'TZS 15',
        category: 'Food & Drink',
        image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=70',
    },
    {
        name: 'Contemporary Art Biennale',
        date: 'Thu, May 1 · 10:00 AM',
        location: 'Dodoma',
        price: 'TZS 20',
        category: 'Arts',
        image: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=800&q=70',
    },
    {
        name: 'Comedy Night Live',
        date: 'Fri, Mar 27 · 8:00 PM',
        location: 'Dar es Salaam',
        price: 'TZS 25',
        category: 'Comedy',
        image: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=800&q=70',
    },
];

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
