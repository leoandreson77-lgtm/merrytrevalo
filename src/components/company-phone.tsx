"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";

interface CompanyPhoneProps {
  className?: string;
  asLink?: boolean;
  formatted?: boolean;
  children?: React.ReactNode | ((rawNumber: string, displayVal: string) => React.ReactNode);
}

export function CompanyPhone({ className = "", asLink = true, formatted = true, children }: CompanyPhoneProps) {
  const [mounted, setMounted] = React.useState(false);
  
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const { data: settings } = useQuery({
    queryKey: ["globalSettings"],
    queryFn: async () => {
      const res = await fetch("/api/settings");
      return res.json();
    },
    staleTime: 60000,
  });

  const rawNumber = (mounted && settings?.callNumber) || process.env.NEXT_PUBLIC_COMPANY_PHONE || "+18772518760";
  
  // Basic formatting: +18772518760 -> +1 877 251 8760
  const displayVal = formatted 
    ? rawNumber.replace(/^\+1/, "+1 ").replace(/(\d{3})(\d{3})(\d{4})$/, "$1 $2 $3")
    : rawNumber;

  const renderContent = () => {
    if (typeof children === "function") {
      return children(rawNumber, displayVal);
    }
    return children || displayVal;
  };

  if (asLink) {
    return (
      <a
        href={`tel:${rawNumber}`}
        className={className}
      >
        {renderContent()}
      </a>
    );
  }

  return <span className={className}>{renderContent()}</span>;
}
