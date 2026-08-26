// components/billing/UpgradeButton.tsx
"use client";
import { createCheckoutSession } from "@/server-actions/checkout";

export function UpgradeButton() {
  const handleUpgrade = async () => {
    const url = await createCheckoutSession("premium");
    if (url) window.location.href = url;
  };
  return (
    <button
      onClick={handleUpgrade}
      className="rounded bg-black px-4 py-2 text-white hover:bg-gray-800"
    >
      Upgrade to Premium
    </button>
  );
}
