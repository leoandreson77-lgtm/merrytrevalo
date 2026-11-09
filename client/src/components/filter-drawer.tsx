import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  fares: string[];
  selectedFare: string;
  setSelectedFare: (f: string) => void;
  zeroCancellation: boolean;
  setZeroCancellation: (v: boolean) => void;
  totalResults?: number;

  // Filter wiring
  uniqueAirlines: string[];
  selectedAirlines: Set<string>;
  toggleAirline: (airline: string) => void;

  uniqueStops: (number | string)[];
  selectedStops: Set<number | string>;
  toggleStop: (stop: number | string) => void;

  priceMin: number;
  priceMax: number;
  priceRange: [number, number];
  setPriceRange: (v: [number, number]) => void;

  departureTimeRanges: Set<string>;
  toggleDepartureTimeRange: (label: string) => void;
  arrivalTimeRanges: Set<string>;
  toggleArrivalTimeRange: (label: string) => void;
  onApply?: () => void;
};

export function FilterDrawer({ open, onOpenChange, fares, selectedFare, setSelectedFare, zeroCancellation, setZeroCancellation, totalResults = 0,
  uniqueAirlines, selectedAirlines, toggleAirline,
  uniqueStops, selectedStops, toggleStop,
  priceMin, priceMax, priceRange, setPriceRange,
  departureTimeRanges, toggleDepartureTimeRange,
  arrivalTimeRanges, toggleArrivalTimeRange,
  onApply,
}: Props) {
  // Responsive detection for desktop vs mobile animation direction
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mm = typeof window !== "undefined" && window.matchMedia ? window.matchMedia("(min-width: 640px)") : null;
    const init = () => setIsDesktop(Boolean(mm && mm.matches));
    init();
    const handler = (e: any) => setIsDesktop(Boolean(e.matches));
    mm && mm.addEventListener && mm.addEventListener("change", handler);
    return () => mm && mm.removeEventListener && mm.removeEventListener("change", handler);
  }, []);

  // Prevent body scroll when drawer is open to get canvas-like behavior
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
    return;
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fixed left-0 top-0 z-40 w-full max-w-none m-0 p-0 rounded-none">
        <AnimatePresence>
          {open && (
            <>
              <motion.div
                key="overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="fixed inset-0 bg-black/40 z-40"
                onClick={() => onOpenChange(false)}
              />

                <motion.div
                key="sheet"
                initial={isDesktop ? { x: "100%", opacity: 0, scale: 0.98 } : { y: "50%", opacity: 0, scale: 0.98 }}
                animate={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                exit={isDesktop ? { x: "100%", opacity: 0, scale: 0.98 } : { y: "50%", opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.32, ease: "easeOut" }}
                className="fixed z-50 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden flex flex-col"
                style={{ inset: '25px', maxHeight: 'calc(100vh - 50px)', borderRadius: 12 }}
              >

                <div className="p-4 border-b border-border flex items-center justify-between">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-bold">Filters</DialogTitle>
                    <DialogDescription className="sr-only">Adjust filters to narrow search results and update visible flights</DialogDescription>
                  </DialogHeader>
                  <button aria-label="Close filters" className="p-2 rounded-md" onClick={() => onOpenChange(false)}>
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 flex overflow-hidden">
                  <nav className="hidden sm:block w-44 border-r border-border p-3 overflow-auto">
                    <ul className="space-y-2 text-sm">
                      <li className="font-semibold">Filters</li>
                      <li className="pt-2">Prime & Delivery</li>
                      <li>Brands</li>
                      <li>RAM Size</li>
                      <li>Storage Capacity</li>
                      <li>Price and Deals</li>
                      <li>Customer Reviews</li>
                    </ul>
                  </nav>

                  <div className="flex-1 p-4 overflow-auto">
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold">Special fares</h4>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {fares.map((f) => (
                          <button
                            key={f}
                            type="button"
                            onClick={() => setSelectedFare(f)}
                            className={`px-3 py-1 rounded-full border text-sm ${selectedFare === f ? "bg-primary/10 border-primary text-primary" : "bg-background border-border text-foreground"}`}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="inline-flex items-center gap-3 text-foreground font-medium">
                        <Checkbox checked={zeroCancellation} onCheckedChange={(v) => setZeroCancellation(v === true)} />
                        Add Zero Cancellation
                      </label>
                      <p className="text-xs text-muted-foreground mt-2">Get 100% refund on cancellation</p>
                    </div>

                    <div className="mb-6">
                      <h4 className="text-sm font-semibold mb-2">Stops</h4>
                      <div className="space-y-2">
                        {uniqueStops.map((s) => (
                          <label key={String(s)} className="inline-flex items-center gap-2">
                            <Checkbox checked={selectedStops.has(s)} onCheckedChange={() => toggleStop(s)} />
                            <span className="text-sm">{String(s)} Stop{String(s) !== '1' ? 's' : ''}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="mb-6">
                      <h4 className="text-sm font-semibold mb-2">Airlines</h4>
                      <div className="space-y-2 max-h-48 overflow-auto">
                        {uniqueAirlines.map((air) => (
                          <label key={air} className="inline-flex items-center gap-2">
                            <Checkbox checked={selectedAirlines.has(air)} onCheckedChange={() => toggleAirline(air)} />
                            <span className="text-sm">{air}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="mb-6">
                      <h4 className="text-sm font-semibold mb-2">Price Range</h4>
                      <div className="px-2">
                        <Slider value={priceRange} onValueChange={(v) => setPriceRange(v as [number, number])} min={priceMin} max={priceMax} />
                        <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                          <span>${priceRange[0].toLocaleString()}</span>
                          <span>${priceRange[1].toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h4 className="text-sm font-semibold mb-2">Departure Time</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {['morning','afternoon','evening','night'].map((label) => (
                          <button
                            key={label}
                            type="button"
                            onClick={() => toggleDepartureTimeRange(label)}
                            className={`px-3 py-2 rounded-lg border text-sm ${departureTimeRanges.has(label) ? 'bg-primary/10 border-primary text-primary' : 'bg-background border-border text-foreground'}`}
                          >
                            {label.charAt(0).toUpperCase() + label.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-6">
                      <h4 className="text-sm font-semibold mb-2">Arrival Time</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {['morning','afternoon','evening','night'].map((label) => (
                          <button
                            key={label}
                            type="button"
                            onClick={() => toggleArrivalTimeRange(label)}
                            className={`px-3 py-2 rounded-lg border text-sm ${arrivalTimeRanges.has(label) ? 'bg-primary/10 border-primary text-primary' : 'bg-background border-border text-foreground'}`}
                          >
                            {label.charAt(0).toUpperCase() + label.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mt-auto" />
                  </div>
                </div>

                <div className="p-4 border-t border-border sticky bottom-0 bg-white dark:bg-slate-900">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Aggregated</p>
                      <p className="text-2xl font-bold">{totalResults}</p>
                    </div>
                    <div className="flex-1">
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        whileHover={{ scale: 1.02 }}
                        type="button"
                        className="w-full h-12 bg-primary text-white rounded-md"
                        onClick={() => {
                          // Close sheet first (triggers exit animation), then call onApply
                          onOpenChange(false);
                          if (onApply) {
                            // wait for exit animation to complete (match transition.duration)
                            setTimeout(() => {
                              try {
                                onApply();
                              } catch (e) {
                                // swallow
                              }
                            }, 340);
                          }
                        }}
                      >
                        Show {totalResults || "results"}
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

export default FilterDrawer;
