import type { Metadata } from "next";
import { PrivacyPolicyPage } from "@/views/privacy-policy";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy and personal data protection principles of MerryTravelo Flights.",
};

export default function Page() {
  return <PrivacyPolicyPage />;
}
