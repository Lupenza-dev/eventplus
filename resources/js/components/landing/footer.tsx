import { Link } from '@inertiajs/react';
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Ticket } from 'lucide-react';
import { login, register } from '@/routes';
import { contact } from './data';

const socials = [
    { icon: Facebook, label: 'Facebook', href: 'https://facebook.com' },
    { icon: Instagram, label: 'Instagram', href: 'https://instagram.com' },
    { icon: Linkedin, label: 'LinkedIn', href: 'https://linkedin.com' },
];

const companyLinks = [
    { label: 'About us', href: '#home' },
    { label: 'Privacy policy', href: '#' },
    { label: 'Terms and conditions', href: '#' },
];

export default function Footer() {
    return (
        <footer id="contact" className="bg-[#2D3436] text-white/70">
            <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
                <div>
                    <a href="#home" className="flex items-center gap-2" aria-label="EventPlus home">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-[#6C5CE7] to-[#8E7CF8]">
                            <Ticket className="h-5 w-5 text-white" aria-hidden="true" />
                        </span>
                        <span className="text-lg font-bold tracking-tight text-white">
                            Event<span className="text-[#8E7CF8]">Plus</span>
                        </span>
                    </a>
                    <p className="mt-4 text-sm leading-relaxed">
                        The intelligent WhatsApp-powered platform connecting event organizers and
                        attendees.
                    </p>
                    <div className="mt-5 flex gap-3">
                        {socials.map(({ icon: Icon, label, href }) => (
                            <a
                                key={label}
                                href={href}
                                target="_blank"
                                rel="noreferrer"
                                aria-label={label}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/8 transition-colors hover:bg-[#6C5CE7] hover:text-white"
                            >
                                <Icon className="h-4 w-4" aria-hidden="true" />
                            </a>
                        ))}
                    </div>
                </div>

                <nav aria-label="Company">
                    <h3 className="mb-4 text-sm font-bold tracking-wide text-white uppercase">Company</h3>
                    <ul className="space-y-2.5 text-sm">
                        {companyLinks.map((link) => (
                            <li key={link.label}>
                                <a href={link.href} className="transition-colors hover:text-white">
                                    {link.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>

                <nav aria-label="Quick links">
                    <h3 className="mb-4 text-sm font-bold tracking-wide text-white uppercase">
                        Quick links
                    </h3>
                    <ul className="space-y-2.5 text-sm">
                        <li>
                            <a href="#events" className="transition-colors hover:text-white">
                                Events
                            </a>
                        </li>
                        <li>
                            <a href="#contact" className="transition-colors hover:text-white">
                                Contact us
                            </a>
                        </li>
                        <li>
                            <Link href={login()} className="transition-colors hover:text-white">
                                Login
                            </Link>
                        </li>
                        <li>
                            <Link href={register()} className="transition-colors hover:text-white">
                                Register
                            </Link>
                        </li>
                    </ul>
                </nav>

                <div>
                    <h3 className="mb-4 text-sm font-bold tracking-wide text-white uppercase">Contact</h3>
                    <ul className="space-y-3 text-sm">
                        <li>
                            <a
                                href={`tel:${contact.phone.replace(/\s/g, '')}`}
                                className="flex items-center gap-2.5 transition-colors hover:text-white"
                            >
                                <Phone className="h-4 w-4 shrink-0 text-[#8E7CF8]" aria-hidden="true" />
                                {contact.phone}
                            </a>
                        </li>
                        <li>
                            <a
                                href={`mailto:${contact.email}`}
                                className="flex items-center gap-2.5 transition-colors hover:text-white"
                            >
                                <Mail className="h-4 w-4 shrink-0 text-[#8E7CF8]" aria-hidden="true" />
                                {contact.email}
                            </a>
                        </li>
                        <li className="flex items-start gap-2.5">
                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#8E7CF8]" aria-hidden="true" />
                            {contact.address}
                        </li>
                    </ul>
                </div>
            </div>

            <div className="border-t border-white/8">
                <p className="mx-auto max-w-7xl px-4 py-5 text-center text-xs text-white/45 sm:px-6 lg:px-8">
                    © {new Date().getFullYear()} EventPlus. All rights reserved.
                </p>
            </div>
        </footer>
    );
}
