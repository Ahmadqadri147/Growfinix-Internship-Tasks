import { Link } from "react-router-dom";
import { Mail, MapPin, Phone, Instagram, Twitter, Youtube } from "lucide-react";
import { APP_NAME } from "@/constants";

const quickLinks = [
  { to: "/", label: "Home" },
  { to: "/events/featured", label: "Events" },
  { to: "/events/luxury-venue", label: "Venue" },
  { to: "/events/midnight-ball/tickets", label: "Tickets" },
  { to: "/dashboard", label: "Dashboard" },
];

const socialLinks = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Youtube, href: "#", label: "YouTube" },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-midnight-900">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.05),transparent_50%)]" />

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <span className="font-serif text-xl font-bold gold-text">
                Midnight<span className="text-white"> Royale</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-400">
              Experience the pinnacle of luxury entertainment. Where
              extraordinary moments become timeless memories.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-gray-400 transition-all duration-200 hover:border-gold-500/50 hover:text-gold-400"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-serif text-sm font-semibold uppercase tracking-wider text-gold-400">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-gray-400 transition-colors hover:text-gold-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-serif text-sm font-semibold uppercase tracking-wider text-gold-400">
              Contact
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
                <span>123 Luxury Avenue, Beverly Hills, CA 90210</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <Phone className="h-4 w-4 shrink-0 text-gold-500" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <Mail className="h-4 w-4 shrink-0 text-gold-500" />
                <span>contact@midnightroyale.com</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-serif text-sm font-semibold uppercase tracking-wider text-gold-400">
              Newsletter
            </h3>
            <p className="mb-4 text-sm text-gray-400">
              Subscribe for exclusive updates and offers.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex gap-2"
            >
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-gold-500/50"
              />
              <button
                type="submit"
                className="rounded-lg bg-gold-gradient px-4 py-2 text-sm font-medium text-midnight-950 transition-all duration-200 hover:shadow-gold-sm"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8 text-center">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
