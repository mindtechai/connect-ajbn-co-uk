import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { Check, ChevronDown, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

type Props = {
  services: string[];
  selected: string[];
  onChange: (next: string[]) => void;
  className?: string;
};

/** Searchable, multi-select service filter driven by the approved service list. */
export function ServiceFilter({ services, selected, onChange, className }: Props) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  const sorted = useMemo(
    () => [...services].sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" })),
    [services],
  );

  const toggle = (name: string) => {
    onChange(selected.includes(name) ? selected.filter((s) => s !== name) : [...selected, name]);
  };

  // Always start the list at the very top so the first service is never clipped.
  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => {
      if (listRef.current) listRef.current.scrollTop = 0;
    });
    return () => cancelAnimationFrame(id);
  }, [open]);

  const label =
    selected.length === 0
      ? "Filter by Service"
      : selected.length === 1
        ? selected[0]
        : `${selected.length} services selected`;

  const trigger = (
    <Button variant="outline" className="w-full justify-between font-normal">
      <span className="truncate">{label}</span>
      <ChevronDown size={16} className="ml-2 shrink-0 opacity-60" />
    </Button>
  );

  const items = (
    <CommandGroup>
      {sorted.map((name) => (
        <CommandItem key={name} value={name} onSelect={() => toggle(name)}>
          <Check
            size={14}
            className={selected.includes(name) ? "mr-2 opacity-100" : "mr-2 opacity-0"}
          />
          {name}
        </CommandItem>
      ))}
    </CommandGroup>
  );

  const chips = selected.length > 0 && (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {selected.map((name) => (
        <Badge key={name} variant="secondary" className="gap-1 text-[11px]">
          {name}
          <button
            type="button"
            aria-label={`Remove ${name} filter`}
            onClick={() => toggle(name)}
            className="hover:text-destructive"
          >
            <X size={11} />
          </button>
        </Badge>
      ))}
      <button
        type="button"
        onClick={() => onChange([])}
        className="text-[11px] text-muted-foreground underline hover:text-foreground"
      >
        Clear all
      </button>
    </div>
  );

  if (isMobile) {
    return (
      <div className={className}>
        <div onClick={() => setOpen(true)}>{trigger}</div>
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent className="max-h-[85dvh] pb-[calc(env(safe-area-inset-bottom)+16px)]">
            <Command shouldFilter>
              <div className="sticky top-0 z-10 bg-background px-4 pt-3">
                <DrawerTitle className="mb-2 text-base">Select services</DrawerTitle>
                <CommandInput placeholder="Search services…" />
              </div>
              <CommandList
                ref={listRef}
                className="max-h-[50dvh] overflow-y-auto overscroll-contain pt-2 [-webkit-overflow-scrolling:touch]"
              >
                <CommandEmpty>No service found.</CommandEmpty>
                {items}
              </CommandList>
            </Command>
            <div className="border-t px-4 pt-3">
              {chips}
              <Button className="mt-3 w-full" onClick={() => setOpen(false)}>
                Done
              </Button>
            </div>
          </DrawerContent>
        </Drawer>
        {chips}
      </div>
    );
  }

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] min-w-64 p-0" align="start">
          <Command>
            <CommandInput placeholder="Search services…" />
            <CommandList ref={listRef}>
              <CommandEmpty>No service found.</CommandEmpty>
              {items}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {chips}
    </div>
  );
}
