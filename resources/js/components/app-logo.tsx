import { Ticket } from 'lucide-react';

export default function AppLogo() {
    return (
        <>
            <span className="flex aspect-square size-9 items-center justify-center rounded-xl bg-linear-to-br from-[#6C5CE7] to-[#8E7CF8] shadow-lg shadow-[#6C5CE7]/25">
                <Ticket className="h-5 w-5 text-white" aria-hidden="true" />
            </span>
            <span className="truncate text-lg font-bold tracking-tight text-[#2D3436] dark:text-sidebar-foreground">
                Event
                <span className="bg-linear-to-br from-[#6C5CE7] to-[#8E7CF8] bg-clip-text text-transparent">
                    +
                </span>
            </span>
        </>
    );
}
