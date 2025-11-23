"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QRScanner } from "@/components/partials/system/qr-scanner";
import { OtpDialog } from "@/components/partials/system/otp-dailog";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";

export default function SystemLandingPage() {
  const [otpOpen, setOtpOpen] = useState(false);
  const [tableCode, setTableCode] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  return (
    <main className="layout-standard section-margin-standard">
      <section className="w-full max-md:text-center">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-heading font-orbitron">
          Welcome to Our Smart Ordering System
        </h1>
        <p className="mt-2 lg:text-lg md:text-base text-sm max-w-2xl">
          Enjoy a seamless dining experience. Connect to your table and explore
          our full menu, place orders instantly, and track every step right from
          your seat.
        </p>
      </section>

      <Separator className="mt-6 mb-12" />

      <section className="grid gap-4 lg:grid-cols-2">
        {/* SCAN QR */}
        <Card
          className="bg-card border-border"
          aria-label="Scan QR option card"
        >
          <CardHeader>
            <CardTitle className="text-heading lg:text-xl md:text-lg text-base">
              Scan QR Code
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="md:text-base text-sm">
              Point your camera at the QR code available on your table to
              connect instantly.
            </p>
            <QRScanner />
            <div className="text-xs text-muted-foreground">
              If scanning fails, you can also enter your table code manually.
            </div>
          </CardContent>
        </Card>

        {/* MANUAL CODE */}
        <Card
          className="bg-card border-border"
          aria-label="Manual code option card"
        >
          <CardHeader>
            <CardTitle className="text-heading lg:text-xl md:text-lg text-base">
              Enter Table Code
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="md:text-base text-sm">
              Enter the unique table code provided by our staff to connect and
              start your order.
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Enter your table code"
                className="bg-[var(--input)] h-[50px]"
                aria-label="Table code"
                value={tableCode}
                onChange={(e) => setTableCode(e.target.value.trim())}
                disabled={loading}
              />
              <Button
                className="hover:bg-accent bg-background text-accent hover:text-accent-foreground h-[48px] border-2 border-border font-semibold"
                disabled={loading}
                onClick={async () => {
                  if (!tableCode) {
                    toast.error("Please enter your table code");
                    return;
                  }

                  if (tableCode === "1111") {
                    setLoading(true);
                    router.push("/authentication");
                    return;
                  }

                  setLoading(true);
                  setTimeout(() => {
                    setOtpOpen(true);
                    setLoading(false);
                  }, 400);
                }}
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <Spinner />
                    Please wait
                  </span>
                ) : (
                  "Continue"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="lg:mt-8 mt-4">
        <Card className="bg-secondary-background border-border border-dashed">
          <CardContent className="py-6">
            <div className="text-sm text-[var(--muted-foreground)]">
              <strong>Security Notice:</strong> Only guests physically present
              at the restaurant can access a table. Each table session is
              verified for authenticity to ensure privacy and security.
            </div>
          </CardContent>
        </Card>
      </section>

      <OtpDialog open={otpOpen} onOpenChange={setOtpOpen} />
    </main>
  );
}
