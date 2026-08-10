import { Head } from '@inertiajs/react';
import { MotionConfig } from 'framer-motion';
import EventsSection from '@/components/landing/events-section';
import Footer from '@/components/landing/footer';
import Hero from '@/components/landing/hero';
import HowItWorks from '@/components/landing/how-it-works';
import Navbar from '@/components/landing/navbar';
import Testimonials from '@/components/landing/testimonials';
import TopBar from '@/components/landing/top-bar';
import WhyChoose from '@/components/landing/why-choose';
import type { EventItem } from '@/components/landing/data';

export default function Welcome({ events }: { events: EventItem[] }) {
    return (
        <MotionConfig reducedMotion="user">
            <Head title="EventPlus — Discover Events and Buy Tickets Through WhatsApp">
                <meta
                    name="description"
                    content="EventPlus connects event organizers and attendees through an intelligent WhatsApp-powered platform. Discover events, chat with our AI bot, and buy tickets instantly."
                />
            </Head>
            <div className="scroll-smooth bg-white font-sans text-[#2D3436] antialiased">
                <TopBar />
                <Navbar />
                <main>
                    <Hero />
                    <HowItWorks />
                    <EventsSection events={events} />
                    <WhyChoose />
                    <Testimonials />
                </main>
                <Footer />
            </div>
        </MotionConfig>
    );
}
