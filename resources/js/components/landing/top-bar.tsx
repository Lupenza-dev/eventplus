import { Clock, Facebook, Instagram, Linkedin, Mail, Phone, Twitter } from 'lucide-react';
import { contact } from './data';

const socials = [
    { icon: Facebook, label: 'Facebook', href: 'https://facebook.com' },
    { icon: Instagram, label: 'Instagram', href: 'https://instagram.com' },
    { icon: Twitter, label: 'X (Twitter)', href: 'https://x.com' },
    { icon: Linkedin, label: 'LinkedIn', href: 'https://linkedin.com' },
];

export default function TopBar() {
    return (
        <div className="hidden bg-[#2D3436] text-white/80 md:block">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 text-xs sm:px-6 lg:px-8">
                <div className="flex items-center gap-3">
                    {socials.map(({ icon: Icon, label, href }) => (
                        <a
                            key={label}
                            href={href}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={label}
                            className="rounded-full p-1 transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-[#6C5CE7] focus-visible:outline-none"
                        >
                            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                        </a>
                    ))}
                </div>
                <div className="flex items-center gap-6">
                    <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-[#FDCB6E]" aria-hidden="true" />
                        {contact.hours}
                    </span>
                    <a
                        href={`mailto:${contact.email}`}
                        className="flex items-center gap-1.5 transition-colors hover:text-white"
                    >
                        <Mail className="h-3.5 w-3.5 text-[#FDCB6E]" aria-hidden="true" />
                        {contact.email}
                    </a>
                    <a
                        href={`tel:${contact.phone.replace(/\s/g, '')}`}
                        className="flex items-center gap-1.5 transition-colors hover:text-white"
                    >
                        <Phone className="h-3.5 w-3.5 text-[#FDCB6E]" aria-hidden="true" />
                        {contact.phone}
                    </a>
                </div>
            </div>
        </div>
    );
}
