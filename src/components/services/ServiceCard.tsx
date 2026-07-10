import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  title: string;
  tagline: string;
  description: string;
  cta: string;
  onClick: () => void;
}

export function ServiceCard({ icon: Icon, title, tagline, description, cta, onClick }: Props) {
  return (
    <div className="group relative h-full rounded-2xl border border-gold/25 bg-card/60 backdrop-blur-sm p-6 md:p-8 shadow-sm hover:border-gold/60 hover:shadow-lg transition-all flex flex-col">
      <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center mb-5">
        <Icon size={22} className="text-gold" />
      </div>
      <h3 className="font-display text-xl md:text-2xl font-bold mb-1.5">{title}</h3>
      <p className="text-sm text-gold/90 mb-3 italic">{tagline}</p>
      <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1">{description}</p>
      <Button onClick={onClick} className="w-full sm:w-auto self-start">{cta}</Button>
    </div>
  );
}