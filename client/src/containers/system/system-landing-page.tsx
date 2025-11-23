import React, { useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { OtpDialog } from "@/components/partials/system/landing/otp-dailog";
import PageHeading from "@/components/partials/page-heading";
import QrScannerCard from "@/components/partials/system/landing/qr-scanner-card";
import ManualCodeCard from "@/components/partials/system/landing/manual-code-card";

export default function SystemLandingPage() {
  const [otpOpen, setOtpOpen] = useState(false);

  return (
    <main className="layout-standard section-margin-standard">
      <PageHeading
        title="Welcome to Our Smart Ordering System"
        description=" Enjoy a seamless dining experience. Connect to your table and explore
          our full menu, place orders instantly, and track every step right from
          your seat."
      />

      <section className="grid gap-4 lg:grid-cols-2">
        <QrScannerCard />
        <ManualCodeCard setOtpOpen={setOtpOpen} />
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
