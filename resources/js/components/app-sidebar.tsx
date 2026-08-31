import { Link, usePage } from '@inertiajs/react';
import {
    Bot,
    CalendarDays,
    LayoutGrid,
    Settings2,
    Ticket,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarSeparator,
} from '@/components/ui/sidebar';
import { botSettings, dashboard, systemSettings, ticketsSold } from '@/routes';
import { index as eventsIndex } from '@/routes/events';
import { index as usersIndex } from '@/routes/users';
import type { NavItem } from '@/types';
import type { Auth } from '@/types/auth';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Events',
        href: eventsIndex(),
        icon: CalendarDays,
    },
    {
        title: 'Ticket Sold',
        href: ticketsSold(),
        icon: Ticket,
    },
];

const managementNavItems: NavItem[] = [
    {
        title: 'Users',
        href: usersIndex(),
        icon: Users,
    },
];

const adminNavItems: NavItem[] = [
    {
        title: 'Bot Settings',
        href: botSettings(),
        icon: Bot,
    },
    {
        title: 'System Settings',
        href: systemSettings(),
        icon: Settings2,
    },
];

// const footerNavItems: NavItem[] = [
//     {
//         title: 'Repository',
//         href: 'https://github.com/laravel/react-starter-kit',
//         icon: FolderGit2,
//     },
//     {
//         title: 'Documentation',
//         href: 'https://laravel.com/docs/starter-kits#react',
//         icon: BookOpen,
//     },
// ];

export function AppSidebar() {
    const { auth } = usePage<{ auth: Auth }>().props;

    return (
        <Sidebar
            collapsible="icon"
            variant="inset"
            className="[&_[data-sidebar=sidebar]]:border [&_[data-sidebar=sidebar]]:border-sidebar-border/70 [&_[data-sidebar=sidebar]]:bg-sidebar/95 [&_[data-sidebar=sidebar]]:shadow-[0_18px_55px_-28px_rgba(45,52,54,0.35)] [&_[data-sidebar=sidebar]]:backdrop-blur-xl"
        >
            <SidebarHeader className="p-3 pb-2">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="h-14 rounded-xl px-2 group-data-[collapsible=icon]:size-10! hover:bg-sidebar-accent/70"
                        >
                            <Link
                                href={dashboard()}
                                prefetch
                                aria-label="Event+ dashboard"
                            >
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarSeparator className="mx-3 w-auto opacity-70" />

            <SidebarContent className="gap-1 px-1 py-2">
                <NavMain items={mainNavItems} label="Workspace" />
                <SidebarSeparator className="mx-3 my-1 w-auto opacity-60" />
                <NavMain items={managementNavItems} label="Management" />
                {auth.is_admin && (
                    <>
                        <SidebarSeparator className="mx-3 my-1 w-auto opacity-60" />
                        <NavMain items={adminNavItems} label="Administration" />
                    </>
                )}
            </SidebarContent>

            {/* <SidebarFooter className="p-3 pt-2">
                <div className="relative overflow-hidden rounded-xl border border-sidebar-border bg-background/60 p-3 shadow-sm group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0">
                    <div className="absolute -top-6 -right-6 size-16 rounded-full bg-primary/10 blur-xl" />
                    <div className="relative flex items-center gap-2.5">
                        <span
                            className="relative flex size-2.5 shrink-0"
                            aria-hidden="true"
                        >
                            <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-30 motion-reduce:animate-none" />
                            <span className="relative inline-flex size-2.5 rounded-full border-2 border-background bg-primary" />
                        </span>
                        {/* <div className="min-w-0 group-data-[collapsible=icon]:hidden">
                            <p className="truncate text-xs font-semibold text-sidebar-foreground">
                                Event operations
                            </p>
                            <p className="truncate text-[11px] text-muted-foreground">
                                Manage events and sales
                            </p>
                        </div> */}
            {/* </div>
                </div>
            </SidebarFooter> */}
            <SidebarRail />
        </Sidebar>
    );
}
