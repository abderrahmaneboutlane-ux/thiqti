"use client";

import { usePathname } from "next/navigation";
import MarketingNavbar from "@/components/MarketingNavbar";

export default function MarketingNav() {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return <MarketingNavbar />;
}
