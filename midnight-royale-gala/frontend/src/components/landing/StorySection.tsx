import SectionTitle from "@/components/ui/SectionTitle";
import GoldenDivider from "@/components/ui/GoldenDivider";
import ScrollReveal from "@/components/animations/ScrollReveal";
import ImageReveal from "@/components/animations/ImageReveal";

export default function StorySection() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden bg-midnight-950">
      <div className="absolute inset-0 bg-gradient-to-b from-midnight-900/50 via-transparent to-midnight-900/50 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <SectionTitle
            title="Where Luxury Meets the Night"
            subtitle="An unforgettable evening of elegance, entertainment, and enchantment"
            align="center"
          />
        </ScrollReveal>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left: Story text */}
          <ScrollReveal direction="left" delay={0.2}>
            <div className="space-y-6">
              <p className="text-gray-300 text-lg leading-relaxed">
                Step into a world where the ordinary fades and the extraordinary
                begins. The Midnight Royale Gala is not merely an event — it is an
                experience crafted for those who demand the finest things in life.
              </p>
              <p className="text-gray-400 text-base leading-relaxed">
                Set against the opulent backdrop of the Grand Imperial Ballroom,
                this enchanted evening promises to transport guests through a
                carefully curated journey of sensory delights. From the moment you
                arrive on the red carpet, every detail has been orchestrated to
                create memories that will last a lifetime.
              </p>
              <p className="text-gray-400 text-base leading-relaxed">
                Join an exclusive gathering of visionaries, artists, and
                luminaries as we celebrate the convergence of elegance and
                imagination beneath the shimmering midnight sky.
              </p>
            </div>
          </ScrollReveal>

          {/* Right: Image placeholders */}
          <div className="space-y-6">
            <ScrollReveal direction="right" delay={0.3}>
              <ImageReveal>
                <div className="relative h-[300px] rounded-lg overflow-hidden bg-gradient-to-br from-gold-500/20 to-midnight-800 border border-gold-500/10 flex items-center justify-center">
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-full h-full">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-px h-full bg-gradient-to-b from-transparent via-gold-500/30 to-transparent"
                          style={{ left: `${(i + 1) * 12.5}%` }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="relative z-10 text-center">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full border border-gold-500/30 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-gold-500/20" />
                    </div>
                    <p className="text-gold-400/60 text-sm tracking-widest uppercase">
                      Grand Ballroom
                    </p>
                  </div>
                </div>
              </ImageReveal>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={0.5}>
              <ImageReveal>
                <div className="relative h-[300px] rounded-lg overflow-hidden bg-gradient-to-tr from-gold-500/20 to-midnight-800 border border-gold-500/10 flex items-center justify-center">
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-full h-full">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div
                          key={i}
                          className="absolute h-px w-full bg-gradient-to-r from-transparent via-gold-500/30 to-transparent"
                          style={{ top: `${(i + 1) * 16.67}%` }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="relative z-10 text-center">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full border border-gold-500/30 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-gold-500/20" />
                    </div>
                    <p className="text-gold-400/60 text-sm tracking-widest uppercase">
                      Evening Elegance
                    </p>
                  </div>
                </div>
              </ImageReveal>
            </ScrollReveal>
          </div>
        </div>

        <ScrollReveal delay={0.6}>
          <div className="mt-16 flex justify-center">
            <GoldenDivider width="w-48" />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
