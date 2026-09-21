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
import { Check, ChevronDown, X } from "lucide-react";

type Props = {
  services: string[];
  selected: string[];
  onChange: (next: string[]) => void;
  className?: string;
};

/** Searchable, multi-select service filter driven by the approved service list. */
export function ServiceFilter({ services, selected, onChange, className }: Props) {
  const toggle = (name: string) => {
    onChange(selected.includes(name) ? selected.filter((s) => s !== name) : [...selected, name]);
  };

  return (
    <div className={className}>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-between font-normal">
            <span className="truncate">
              {selected.length === 0
                ? "Filter by Service"
                : selected.length === 1
                  ? selected[0]
                  : `${selected.length} services selected`}
            </span>
            <ChevronDown size={16} className="ml-2 shrink-0 opacity-60" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] min-w-64 p-0" align="start">
          <Command>
            <CommandInput placeholder="Search services…" />
            <CommandList>
              <CommandEmpty>No service found.</CommandEmpty>
              <CommandGroup>
                {services.map((name) => (
                  <CommandItem key={name} value={name} onSelect={() => toggle(name)}>
                    <Check
                      size={14}
                      className={selected.includes(name) ? "mr-2 opacity-100" : "mr-2 opacity-0"}
                    />
                    {name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selected.length > 0 && (
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
      )}
    </div>
  );
}
