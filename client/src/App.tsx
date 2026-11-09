import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { HomePage } from "./pages/home";
import { SearchResultsPage } from "./pages/search-results";
import { BookingPage } from "./pages/book";
import { BookingSuccessPage } from "./pages/booking-success";
import { PrivacyPolicyPage } from "./pages/privacy-policy";
import { TermsOfServicePage } from "./pages/terms";
import { CookiePolicyPage } from "./pages/cookie-policy";
import { ContactPage } from "./pages/contact";
import { AboutPage } from "./pages/about";
import { CareersPage } from "./pages/careers";
import { ScraperPage } from "./pages/scraper";
import { AdminPage } from "./pages/admin";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/search" component={SearchResultsPage} />
      <Route path="/scraper" component={ScraperPage} />
      <Route path="/book/:id" component={BookingPage} />
      <Route path="/booking-success" component={BookingSuccessPage} />
      <Route path="/privacy-policy" component={PrivacyPolicyPage} />
      <Route path="/terms" component={TermsOfServicePage} />
      <Route path="/cookie-policy" component={CookiePolicyPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/careers" component={CareersPage} />
      <Route path="/admin" component={AdminPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
