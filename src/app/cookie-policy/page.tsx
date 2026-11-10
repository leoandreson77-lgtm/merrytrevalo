import type { Metadata } from "next";
import { CookiePolicyPage } from "@/views/cookie-policy";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "Information about how JetWithFly Flights uses cookies and similar technologies.",
};

export default function Page() {
  return <CookiePolicyPage />;
}
