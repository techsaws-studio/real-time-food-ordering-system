"use client";

import React from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SystemAuthenticationPage() {
  return (
    <main className="layout-standard flex-center h-[calc(100svh-90px)]">
      <Card className="md:w-[500px] w-full bg-card border-border">
        <CardContent className="pt-6">
          <form
            className="space-y-5"
            onSubmit={(e) => e.preventDefault()}
            aria-label="Kitchen sign-in form"
          >
            <div className="space-y-2">
              <Label htmlFor="kitchen-username">Username</Label>
              <Input
                id="kitchen-username"
                placeholder="Enter username"
                autoComplete="username"
                className="bg-[var(--input)] h-[50px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="kitchen-password">Password</Label>
              <Input
                id="kitchen-password"
                type="password"
                placeholder="Enter password"
                autoComplete="current-password"
                className="bg-[var(--input)] h-[50px]"
              />
            </div>

            <div className="w-full flex items-center justify-end">
              <Button
                type="submit"
                className="hover:bg-accent md:w-fit md:px-8 font-semibold bg-background text-accent hover:text-accent-foreground w-full h-[43px] border-border"
              >
                Sign In
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
