"use client";

import React, { useEffect, useState } from "react";

import { UserInfo } from "@/types/components.layouts-interfaces";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

import { LogoutFunction } from "@/utils/logout-function";

import { Power } from "lucide-react";

function ReceptionistHeader() {
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    const userInfoCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("user_info="));

    if (userInfoCookie) {
      const userInfo = JSON.parse(
        decodeURIComponent(userInfoCookie.split("=")[1])
      );
      setUser(userInfo);
    }
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="w-full h-[90px] border-b border-border bg-background sticky top-0 z-50">
      <div className="dashboard-layout-standard h-full flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-8 w-[2px] rounded"
          />
          <h1 className="text-2xl font-orbitron font-semibold text-heading">
            Receptionist
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Power
                className="hover:text-accent text-primary cursor-pointer"
                onClick={LogoutFunction}
              />
            </TooltipTrigger>

            <TooltipContent className="bg-secondary-background border border-border text-heading mt-2">
              <p>Logout</p>
            </TooltipContent>
          </Tooltip>
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-8 w-[2px] rounded"
          />
          <div className="flex items-center gap-2">
            <Avatar className="h-10 w-10 border-2 border-accent text-secondary font-semibold">
              <AvatarFallback>
                {user ? getInitials(user.name) : "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col leading-tight">
              <span className="text-accent text-sm font-semibold">
                {user?.name || "Loading..."}
              </span>
              <span className="text-[var(--muted-foreground)] text-xs">
                {user?.email || ""}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default ReceptionistHeader;
