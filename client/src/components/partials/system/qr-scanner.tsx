"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import { Scanner } from "@yudiel/react-qr-scanner";
import type { IDetectedBarcode } from "@yudiel/react-qr-scanner";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function QRScanner() {
  const [open, setOpen] = useState(false);
  const [constraints, setConstraints] = useState<MediaTrackConstraints>({
    facingMode: { ideal: "environment" },
  });
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState<string | undefined>(undefined);
  const [scannerKey, setScannerKey] = useState(0);

  const pickBestCamera = (list: MediaDeviceInfo[]) => {
    const cams = list.filter((d) => d.kind === "videoinput");
    if (!cams.length) return undefined;

    const back = cams.find((d) => /back|rear|environment/i.test(d.label || ""));
    return (back || cams[0]).deviceId;
  };

  const refreshDevices = async () => {
    const list = await navigator.mediaDevices.enumerateDevices();
    setDevices(list);
    const chosen = pickBestCamera(list);
    setDeviceId(chosen);
    if (chosen) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setConstraints({ deviceId: { exact: chosen } as any });
      setScannerKey((prev) => prev + 1);
    }
  };

  const ensureCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: deviceId ? { deviceId: { exact: deviceId } } : constraints,
        audio: false,
      });
      stream.getTracks().forEach((t) => t.stop());
      toast.success("Camera ready");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      if (e?.name === "NotAllowedError") {
        toast.error(
          "Camera permission blocked. Click the address-bar camera icon and Allow."
        );
      } else if (e?.name === "NotReadableError") {
        toast.error(
          "Could not start video. Close other apps using the camera (Zoom/Teams) and retry."
        );

        const others = devices.filter(
          (d) => d.kind === "videoinput" && d.deviceId !== deviceId
        );
        if (others.length) {
          const next = others[0].deviceId;
          setDeviceId(next);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setConstraints({ deviceId: { exact: next } as any });
          setScannerKey((k) => k + 1);
        }
      } else if (e?.name === "NotFoundError") {
        setConstraints({ facingMode: "user" });
        toast.error("No camera found. Use manual code instead.");
      } else if (e?.name === "OverconstrainedError") {
        toast.error(
          "Camera doesn't support requested settings. Switching to default."
        );
        setConstraints({});
        setScannerKey((k) => k + 1);
      } else {
        toast.error("Could not access camera.");
      }
    }
  };

  const handleScan = (detectedCodes: IDetectedBarcode[]) => {
    const value = detectedCodes[0]?.rawValue?.trim();
    if (value) {
      toast.success("QR detected");
      setOpen(false);
    }
  };

  const handleError = (err: unknown) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const name = (err as any)?.name || "Error";
    if (name === "NotAllowedError") {
      toast.error("Permission denied. Enable camera access and retry.");
    } else if (name === "NotReadableError") {
      toast.error("Camera in use by another app. Close it and retry.");
    } else {
      toast.error("Camera error. Try switching device or use manual code.");
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          className="w-full md:w-auto bg-accent h-[45px] text-accent-foreground hover:bg-accent-hover font-semibold"
          onClick={async () => {
            setOpen(true);
            await refreshDevices();
            await ensureCamera();
          }}
        >
          Open Scanner
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-[var(--secondary-background)] border-[var(--border)]">
        <SheetHeader>
          <SheetTitle className="text-[var(--heading)]">
            Scan Your Table QR
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div
            className="rounded-2xl border overflow-hidden"
            style={{ borderColor: "var(--border)" }}
          >
            <Scanner
              key={scannerKey}
              onScan={handleScan}
              onError={handleError}
              constraints={
                deviceId
                  ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    { deviceId: { exact: deviceId } as any }
                  : constraints
              }
              classNames={{
                container: "w-full h-[240px] rounded-2xl overflow-hidden",
                video: "w-full h-full object-cover",
              }}
            />
          </div>

          <ul className="text-xs text-[var(--muted-foreground)] list-disc pl-5 space-y-1">
            <li>Ensure proper lighting for accurate scanning.</li>
            <li>If scanning is unavailable, switch to manual entry.</li>
          </ul>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="w-full h-[45px] bg-background text-accent border-border hover:bg-accent hover:text-accent-foreground"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
