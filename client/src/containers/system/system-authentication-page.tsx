"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";

export default function SystemAuthenticationPage() {
  return (
    <main className="layout-standard section-margin-standard flex flex-col items-center">
      <section className="mb-8 text-center">
        <h1
          className="text-3xl md:text-4xl font-bold"
          style={{
            color: "var(--heading)",
            fontFamily: "Orbitron, sans-serif",
          }}
        >
          Secure Access
        </h1>
        <p
          className="mt-2 text-[var(--paragraph)] max-w-2xl"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          Sign in to manage orders, monitor status, and oversee operations.
          Accounts are provisioned internally—no sign-up required.
        </p>
      </section>

      <Card
        className="max-w-xl bg-[var(--card)] border"
        style={{ borderColor: "var(--border)" }}
      >
        <CardHeader>
          <CardTitle className="text-[var(--heading)]">Choose Role</CardTitle>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="kitchen" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-[50px]">
              <TabsTrigger
                value="kitchen"
                className="h-[40px] flex items-center justify-center"
              >
                Kitchen
              </TabsTrigger>
              <TabsTrigger
                value="admin"
                className="h-[40px] flex items-center justify-center"
              >
                Admin
              </TabsTrigger>
            </TabsList>

            {/* Kitchen Login */}
            <TabsContent value="kitchen" className="mt-6">
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

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                    <Checkbox id="kitchen-remember" className="rounded-full" />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    className="text-xs underline text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition"
                    aria-label="Forgot password"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="submit"
                    className="hover:bg-accent-hover font-semibold bg-accent text-accent-foreground w-full h-[45px]"
                  >
                    Sign In
                  </Button>
                  <Button
                    type="button"
                    className="w-full h-[46px] bg-background hover:text-accent text-primary-foreground"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* Admin Login */}
            <TabsContent value="admin" className="mt-6">
              <form
                className="space-y-5"
                onSubmit={(e) => e.preventDefault()}
                aria-label="Admin sign-in form"
              >
                <div className="space-y-2">
                  <Label htmlFor="admin-username">Username</Label>
                  <Input
                    id="admin-username"
                    placeholder="Enter username"
                    autoComplete="username"
                    className="bg-[var(--input)] h-[50px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-password">Password</Label>
                  <Input
                    id="admin-password"
                    type="password"
                    placeholder="Enter password"
                    autoComplete="current-password"
                    className="bg-[var(--input)] h-[50px]"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                    <Checkbox id="admin-remember" className="rounded-full" />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    className="text-xs underline text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition"
                    aria-label="Forgot password"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="submit"
                    className="hover:bg-accent-hover font-semibold bg-accent text-accent-foreground w-full h-[45px]"
                  >
                    Sign In
                  </Button>
                  <Button
                    type="button"
                    className="w-full h-[46px] bg-background hover:text-accent text-primary-foreground"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>

          {/* Compliance / Notice */}
          <div
            className="mt-6 rounded-xl border p-4 text-xs leading-relaxed bg-[var(--accent-background)]"
            style={{ borderColor: "var(--border)" }}
          >
            <p className="text-[var(--muted-foreground)]">
              <strong className="text-[var(--foreground)]">Notice:</strong>{" "}
              Access is limited to authorized personnel. By signing in, you
              agree to abide by company policies and maintain confidentiality of
              operational data.
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
