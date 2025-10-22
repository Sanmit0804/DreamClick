"use client";
import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { ChevronRight } from "lucide-react";

interface SubMenuItem {
  id: string;
  label: string;
  path: string;
  icon?: React.ComponentType<any>;
}
interface MenuItem {
  id: string;
  icon: React.ComponentType<any>;
  label: string;
  path?: string;
  subItems?: SubMenuItem[];
}

export function AppSidebar({ items }: { items: MenuItem[] }) {
  const { open } = useSidebar();
  const location = useLocation();

  const isActive = (path?: string) => (path ? location.pathname === path : false);
  const isGroupOpen = (item: MenuItem) =>
    item.subItems?.some((sub) => location.pathname === sub.path) ?? false;

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          {open && <SidebarGroupLabel>Admin Panel</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) =>
                item.subItems ? (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton asChild isActive={isGroupOpen(item)}>
                      <details open={isGroupOpen(item)} className="group/menu">
                        <summary className="flex cursor-pointer list-none items-center justify-between">
                          <div className="flex items-center gap-2">
                            <item.icon className="h-4 w-4" />
                            <span>{item.label}</span>
                          </div>
                          <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-open/menu:rotate-90" />
                        </summary>
                        <SidebarMenuSub>
                          {item.subItems.map((sub) => (
                            <SidebarMenuSubItem key={sub.id}>
                              <SidebarMenuSubButton asChild isActive={isActive(sub.path)}>
                                <Link to={sub.path}>
                                  {sub.icon && <sub.icon className="mr-2 h-4 w-4" />}
                                  {sub.label}
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </details>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ) : (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton asChild isActive={isActive(item.path)}>
                      <Link to={item.path!}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}