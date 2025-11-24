import React from "react";

import { Separator } from "../ui/separator";

import RefreshButton from "@/utils/refresh-button";

function DashboardPageHeader({ title }: { title: string }) {
  return (
    <div className="flex flex-col w-full gap-4">
      <div className="flex items-center justify-between w-full">
        <h1 className="text-5xl font-inter font-light text-black">{title}</h1>

        <RefreshButton />
      </div>

      <Separator className="h-[3px] bg-primary" />
    </div>
  );
}

export default DashboardPageHeader;
