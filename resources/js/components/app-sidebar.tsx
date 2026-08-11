import { Link } from '@inertiajs/react';
import { Bot, CalendarDays, LayoutGrid, Settings2, Ticket, Users } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
} from '@/components/ui/sidebar';
import {
    botSettings,
    dashboard,
    systemSettings,
    ticketsSold,
} from '@/routes';
import { index as eventsIndex } from '@/routes/events';
import { index as usersIndex } from '@/routes/users';
import type { NavItem } from '@/types';

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

const adminNavItems: NavItem[] = [
    {
        title: 'Users',
        href: usersIndex(),
        icon: Users,
    },
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
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarSeparator className="mx-0" />

            <SidebarContent>
                <NavMain items={mainNavItems} />
                <SidebarSeparator className="mx-2" />
                <NavMain items={adminNavItems} label="Administration" />
            </SidebarContent>
        </Sidebar>
    );
}
