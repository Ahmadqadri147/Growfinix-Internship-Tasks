import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, User, Ticket, LayoutDashboard, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/contexts/AuthContext";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/events/featured", label: "Events" },
  { to: "/events/luxury-venue", label: "Venue" },
  { to: "/events/midnight-ball/tickets", label: "Tickets" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header
      className={cn(
        "fixed left-0 right-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-white/10 bg-midnight-950/80 backdrop-blur-xl"
          : "bg-transparent",
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-serif text-xl font-bold gold-text">
            Midnight
            <span className="text-white"> Royale</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  "relative text-sm font-medium transition-colors duration-200",
                  isActive ? "text-gold-400" : "text-gray-300 hover:text-white",
                )
              }
            >
              {({ isActive }) => (
                <>
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gold-500"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Always show profile (no login/register) */}
        <div className="hidden items-center gap-4 md:flex">
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-1.5 text-sm font-medium text-gold-400 transition-all duration-200 hover:bg-gold-500/20"
            >
              <User className="h-4 w-4" />
              <span>{user?.name || "Guest"}</span>
            </button>

            <AnimatePresence>
              {profileOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-gold-lg border border-white/10 bg-midnight-900/95 backdrop-blur-xl shadow-glass"
                  >
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        navigate("/dashboard");
                      }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </button>
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        navigate("/admin");
                      }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
                    >
                      <Shield className="h-4 w-4" />
                      Admin Panel
                    </button>
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        navigate("/dashboard");
                      }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
                    >
                      <Ticket className="h-4 w-4" />
                      My Bookings
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-gray-300 transition-colors hover:text-white md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-white/10 bg-midnight-950/95 backdrop-blur-xl md:hidden"
          >
            <div className="space-y-1 px-4 py-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "block rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-gold-500/10 text-gold-400"
                        : "text-gray-300 hover:bg-white/5 hover:text-white",
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>

            <div className="border-t border-white/10 px-4 py-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3 px-4 py-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-500/20 text-sm font-medium text-gold-400">
                    {(user?.name?.charAt(0) || "G").toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {user?.name || "Guest"}
                    </p>
                    <p className="text-xs text-gray-400">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    navigate("/dashboard");
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-gray-300 transition-colors hover:bg-white/5"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </button>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    navigate("/admin");
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-gray-300 transition-colors hover:bg-white/5"
                >
                  <Shield className="h-4 w-4" />
                  Admin Panel
                </button>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    navigate("/dashboard");
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-gray-300 transition-colors hover:bg-white/5"
                >
                  <Ticket className="h-4 w-4" />
                  My Bookings
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
