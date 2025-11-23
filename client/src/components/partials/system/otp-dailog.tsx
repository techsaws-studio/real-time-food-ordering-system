"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export function OtpDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [otp, setOtp] = useState("");

  const handleVerify = () => {
    if (!/^\d{6}$/.test(otp)) {
      toast.error("Please enter a valid 6-digit code.");
      return;
    }
    toast.success("Code verified");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[var(--popover)] text-[var(--popover-foreground)] border-[var(--border)]">
        <DialogHeader>
          <DialogTitle className="text-heading lg:text-xl md:text-lg text-base font-inter">
            Verify Your Table
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <p className="md:text-base text-sm">
            Please enter the 6-digit verification code provided by our staff to
            confirm your table session.
          </p>

          <InputOTP
            maxLength={6}
            value={otp}
            onChange={(v) => setOtp(v.replace(/\D/g, ""))}
            aria-label="Enter OTP"
          >
            <InputOTPGroup>
              {Array.from({ length: 6 }).map((_, i) => (
                <InputOTPSlot key={i} index={i} />
              ))}
            </InputOTPGroup>
          </InputOTP>

          <Button
            className="flex-1 h-[45px] w-full bg-accent text-accent-foreground hover:bg-accent-hover font-semibold"
            disabled={otp.length < 6}
            onClick={handleVerify}
          >
            Verify & Continue
          </Button>

          <p className="text-xs text-muted-foreground">
            Your table session will remain active once verified.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
