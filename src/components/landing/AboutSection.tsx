import { ScrollReveal } from "@/components/ScrollReveal";

const team = [
  {
    name: "Russell Bahar",
    role: "Director & Co-founder",
    image:
      "https://asian-jewish-business-network-cdn.s3.eu-west-2.amazonaws.com/wp-content/uploads/2024/07/26115709/1.jpg",
    bio:
      "Over 25 years in sales — 15 in media sales, 15+ in exhibition sales and events, and 12 in senior and project management. Now runs his own consultancy.",
    quote: "Be who you want to be, do what you want to do, and succeed in what you're good at.",
  },
  {
    name: "Bianca Weber",
    role: "Director",
    image:
      "https://asian-jewish-business-network-cdn.s3.eu-west-2.amazonaws.com/wp-content/uploads/2024/07/26115733/1698403774634.jpg",
    bio:
      "A commercially driven senior business professional with a 20-year career spanning events and exhibitions, fundraising, publishing and media. Skilled in advertising, sales, fundraising and event management.",
  },
  {
    name: "Justin Cohen",
    role: "Co-founder",
    image:
      "https://asian-jewish-business-network-cdn.s3.eu-west-2.amazonaws.com/wp-content/uploads/2024/07/26115756/Justin-Cohen.jpg",
    bio:
      "Journalist, news editor and publisher of 17 years, now shaping the direction of a growing media business. A regular commentator on the BBC, Sky, Channel 4 and LBC, with columns in The Times, Independent, Telegraph and Evening Standard.",
  },
];

export function AboutSection() {
  return (
    <section id="about" className="py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
        <ScrollReveal>
          <p className="text-sm tracking-widest uppercase text-teal font-medium mb-3 text-center">
            About Us
          </p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-12">
            Fostering business ties between the Asian and Jewish communities
          </h2>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-8 mb-20">
          <ScrollReveal>
            <div className="bg-card border rounded-xl p-7 h-full">
              <h3 className="font-display text-xl font-semibold mb-3">Our Mission</h3>
              <p className="text-muted-foreground leading-relaxed">
                The Asian-Jewish Business Network (AJBN) is dedicated to fostering business
                ties between the Asian and Jewish communities in the UK. Our mission is to
                create a collaborative environment where professional leaders and leading
                business figures from Finance, Property, Legal, Tech, Marketing and other
                sectors can share best practices and drive growth.
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={80}>
            <div className="bg-card border rounded-xl p-7 h-full">
              <h3 className="font-display text-xl font-semibold mb-3">Our Story</h3>
              <p className="text-muted-foreground leading-relaxed">
                Founded in 2019, AJBN is the only network of its kind in the UK, promoting
                business relationships between these two vibrant communities. What started as
                a small initiative has grown into a face-to-face members club — including the
                London Members Club and the Women Inspired Members Club — alongside our
                annual flagship networking event, which attracts over 600 attendees.
              </p>
            </div>
          </ScrollReveal>
        </div>

        <ScrollReveal>
          <p className="text-sm tracking-widest uppercase text-teal font-medium mb-3 text-center">
            Meet the Team
          </p>
          <h3 className="text-2xl md:text-3xl font-display font-bold text-center mb-12">
            The people behind AJBN
          </h3>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6">
          {team.map((m, i) => (
            <ScrollReveal key={m.name} delay={i * 90}>
              <div className="bg-card border rounded-xl overflow-hidden h-full flex flex-col shadow-sm hover:shadow-md transition-shadow">
                <div className="aspect-[4/5] bg-muted overflow-hidden">
                  <img
                    src={m.image}
                    alt={`${m.name}, ${m.role}`}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <p className="font-display text-lg font-semibold">{m.name}</p>
                  <p className="text-xs uppercase tracking-wider text-teal font-medium mb-3">{m.role}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{m.bio}</p>
                  {m.quote && (
                    <p className="mt-4 pt-4 border-t text-sm italic text-foreground/80">
                      &ldquo;{m.quote}&rdquo;
                    </p>
                  )}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}