import { Link } from '@inertiajs/react';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';

export function NavMain({
    items = [],
    label = 'Platform',
}: {
    items: NavItem[];
    label?: string;
}) {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <SidebarGroup className="px-2 py-1.5">
            <SidebarGroupLabel className="mb-1 h-7 px-2 text-[10px] font-bold tracking-[0.16em] text-sidebar-foreground/45 uppercase">
                {label}
            </SidebarGroupLabel>
            <SidebarMenu className="gap-1">
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            asChild
                            isActive={isCurrentUrl(item.href)}
                            tooltip={{ children: item.title }}
                            className="group/nav-item relative h-11 gap-3 rounded-xl px-2.5 text-sidebar-foreground/70 transition-all duration-200 group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:px-2! hover:translate-x-0.5 hover:bg-background/70 hover:text-sidebar-foreground data-[active=true]:bg-background data-[active=true]:font-semibold data-[active=true]:text-primary data-[active=true]:shadow-[0_8px_24px_-16px_rgba(108,92,231,0.8)]"
                        >
                            <Link href={item.href} prefetch>
                                {item.icon && (
                                    <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-sidebar-accent/60 text-sidebar-foreground/55 transition-colors group-hover/nav-item:text-primary group-data-[active=true]/nav-item:bg-primary/12 group-data-[active=true]/nav-item:text-primary group-data-[collapsible=icon]:size-6 group-data-[collapsible=icon]:bg-transparent [&>svg]:size-4 group-data-[collapsible=icon]:[&>svg]:size-4">
                                        <item.icon aria-hidden="true" />
                                    </span>
                                )}
                                <span>{item.title}</span>
                                <span className="ml-auto size-1.5 rounded-full bg-primary opacity-0 shadow-[0_0_0_4px_rgba(108,92,231,0.12)] transition-opacity group-data-[active=true]/nav-item:opacity-100 group-data-[collapsible=icon]:hidden" />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
