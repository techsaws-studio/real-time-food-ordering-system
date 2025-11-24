"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { RefreshCcw } from "lucide-react";

export default function RefreshButton() {
  const router = useRouter();
  const [spinning, setSpinning] = useState(false);

  const handleClick = () => {
    setSpinning(true);
    router.refresh();
    setTimeout(() => setSpinning(false), 600);
  };

  return (
    <span
      onClick={handleClick}
      className="p-2 bg-background rounded-md border-2 border-border hover:border-none hover:bg-accent hover:text-accent-foreground text-accent cursor-pointer"
    >
      <RefreshCcw size={24} className={spinning ? "spin-once" : ""} />
    </span>
  );
}
