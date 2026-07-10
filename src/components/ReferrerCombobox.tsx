import { useEffect, useMemo, useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

type Referrer = { id: string; first_name: string | null; last_name: string | null; company: string | null };

export function ReferrerCombobox({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [list, setList] = useState<Referrer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await (supabase as any).rpc("referrers_directory");
      setList((data ?? []) as Referrer[]);
      setLoading(false);
    })();
  }, []);

  const selected = useMemo(() => list.find((r) => r.id === value) ?? null, [list, value]);
  const label = (r: Referrer) =>
    `${r.first_name ?? ""} ${r.last_name ?? ""}`.trim() + (r.company ? ` · ${r.company}` : "");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          className="w-full justify-between font-normal"
          disabled={loading}
        >
          <span className="flex items-center gap-2 truncate text-left">
            <Search size={14} className="text-muted-foreground shrink-0" />
            <span className={cn("truncate", !selected && "text-muted-foreground")}>
              {selected ? label(selected) : loading ? "Loading members…" : "Search members…"}
            </span>
          </span>
          <ChevronsUpDown size={14} className="opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Type a name or company…" />
          <CommandList>
            <CommandEmpty>No matching member.</CommandEmpty>
            <CommandGroup>
              {value && (
                <CommandItem
                  value="__clear__"
                  onSelect={() => { onChange(null); setOpen(false); }}
                  className="text-muted-foreground"
                >
                  Clear selection
                </CommandItem>
              )}
              {list.map((r) => (
                <CommandItem
                  key={r.id}
                  value={label(r) + " " + r.id}
                  onSelect={() => { onChange(r.id); setOpen(false); }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === r.id ? "opacity-100" : "opacity-0")} />
                  {label(r)}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}