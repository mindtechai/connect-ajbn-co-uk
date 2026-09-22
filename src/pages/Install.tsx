import { AppLayout } from "@/components/AppLayout";
import { Smartphone, Monitor, Share2, PlusCircle, ArrowLeft } from "lucide-react";

const STEP = "flex items-start gap-3 text-foreground/90 leading-relaxed";
const ICON_BOX =
  "shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary";

export default function InstallPage() {
  return (
    <AppLayout back={{ to: "/", label: "Home" }} maxWidth="3xl">
      <article className="max-w-none">
        <header className="mb-8 border-b pb-6">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-primary mb-2">
            Install AJBN Connect
          </h1>
          <p className="text-muted-foreground">
            Add the app to your home screen for the fastest way to stay connected.
          </p>
        </header>

        <section className="mb-10">
          <h2 className="font-display text-xl font-semibold text-primary mb-4 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-teal" aria-hidden="true" />
            iPhone & iPad (Safari)
          </h2>
          <ol className="space-y-4">
            <li className={STEP}>
              <span className={ICON_BOX}>
                <Share2 size={18} aria-hidden="true" />
              </span>
              <span>
                Tap the <strong>Share</strong> button in Safari’s toolbar (the square with an arrow).
              </span>
            </li>
            <li className={STEP}>
              <span className={ICON_BOX}>
                <PlusCircle size={18} aria-hidden="true" />
              </span>
              <span>
                Scroll down and tap <strong>Add to Home Screen</strong>.
              </span>
            </li>
            <li className={STEP}>
              <span className={ICON_BOX}>3</span>
              <span>
                Tap <strong>Add</strong> in the top-right corner. The AJBN Connect icon will appear on your home screen.
              </span>
            </li>
          </ol>
        </section>

        <section className="mb-10">
          <h2 className="font-display text-xl font-semibold text-primary mb-4 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-teal" aria-hidden="true" />
            Chrome (phone or tablet)
          </h2>
          <ol className="space-y-4">
            <li className={STEP}>
              <span className={ICON_BOX}>1</span>
              <span>
                Open this site in Chrome and tap the menu (three dots) in the top-right.
              </span>
            </li>
            <li className={STEP}>
              <span className={ICON_BOX}>
                <PlusCircle size={18} aria-hidden="true" />
              </span>
              <span>
                Tap <strong>Add to Home screen</strong> or <strong>Install app</strong>.
              </span>
            </li>
            <li className={STEP}>
              <span className={ICON_BOX}>3</span>
              <span>Tap <strong>Add</strong> or <strong>Install</strong> to confirm.</span>
            </li>
          </ol>
        </section>

        <section className="mb-10">
          <h2 className="font-display text-xl font-semibold text-primary mb-4 flex items-center gap-2">
            <Monitor className="w-5 h-5 text-teal" aria-hidden="true" />
            Desktop (Chrome / Edge)
          </h2>
          <ol className="space-y-4">
            <li className={STEP}>
              <span className={ICON_BOX}>1</span>
              <span>
                Look for the install icon in the address bar (a small monitor or plus icon).
              </span>
            </li>
            <li className={STEP}>
              <span className={ICON_BOX}>2</span>
              <span>
                Click <strong>Install AJBN Connect</strong> and follow the prompts.
              </span>
            </li>
          </ol>
        </section>

        <div className="rounded-xl bg-muted p-5">
          <h3 className="font-semibold text-foreground mb-2">Mobile app</h3>
          <p className="text-foreground/80 text-sm leading-relaxed">
            Installing AJBN Connect from your browser gives you the same full app experience, with its own
            icon on your home screen.
          </p>
        </div>
      </article>
    </AppLayout>
  );
}
