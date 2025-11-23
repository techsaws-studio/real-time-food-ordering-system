"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

function ManualCodeCard({
  setOtpOpen,
}: {
  setOtpOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [tableCode, setTableCode] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  return (
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
          Enter the unique table code provided by our staff to connect and start
          your order.
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
  );
}

export default ManualCodeCard;
