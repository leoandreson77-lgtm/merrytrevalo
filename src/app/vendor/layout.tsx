import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vendor & Affiliate Portal",
  robots: { index: false, follow: false },
};

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
