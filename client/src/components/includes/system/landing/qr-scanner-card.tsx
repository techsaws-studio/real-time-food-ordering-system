import React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QRScanner } from "./qr-scanner";

function QrScannerCard() {
  return (
    <Card className="bg-card border-border" aria-label="Scan QR option card">
      <CardHeader>
        <CardTitle className="text-heading lg:text-xl md:text-lg text-base">
          Scan QR Code
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="md:text-base text-sm">
          Point your camera at the QR code available on your table to connect
          instantly.
        </p>
        <QRScanner />
        <div className="text-xs text-muted-foreground">
          If scanning fails, you can also enter your table code manually.
        </div>
      </CardContent>
    </Card>
  );
}

export default QrScannerCard;
