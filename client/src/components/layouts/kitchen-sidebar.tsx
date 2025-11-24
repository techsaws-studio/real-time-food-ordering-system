"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { KitchenSidebarNavLinks } from "@/data/layout-data";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

function KitchenSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar {...props} className="border-border">
      <SidebarHeader className="px-4 py-4 border-b-2 border-border">
        <h2 className="text-xl font-orbitron font-semibold text-primary">
          Kitchen Console
        </h2>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="py-4 gap-4">
              {KitchenSidebarNavLinks.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.path}
                        className={`flex items-center gap-3 px-4 !py-6 rounded-sm transition-colors ${
                          isActive
                            ? "bg-accent text-accent-foreground"
                            : "text-heading hover:!bg-muted-hover hover:!text-accent"
                        }`}
                      >
                        <Icon size={18} />
                        <span className="text-sm font-medium">
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}

export default KitchenSidebar;
