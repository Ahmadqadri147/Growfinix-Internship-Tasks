import { Link } from "react-router-dom";
import { Sparkles, Github, Twitter, Linkedin } from "lucide-react";

const footerLinks = {
  Shop: [
    { label: "All Products", to: "/products" },
    { label: "Deals", to: "/products?sort=discount" },
    { label: "Featured", to: "/products?featured=true" },
    { label: "New Arrivals", to: "/products?sort=newest" }
  ],
  Categories: [
    { label: "Electronics", to: "/products?category=electronics" },
    { label: "Fashion", to: "/products?category=fashion" },
    { label: "Home & Kitchen", to: "/products?category=home-kitchen" },
    { label: "Sports", to: "/products?category=sports" },
    { label: "Beauty", to: "/products?category=beauty" },
    { label: "Shoes", to: "/products?category=shoes" }
  ],
  Account: [
    { label: "Sign in", to: "/login" },
    { label: "Create account", to: "/register" },
    { label: "Wishlist", to: "/wishlist" },
    { label: "Admin dashboard", to: "/admin" }
  ]
};

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          <Link to="/" className="flex items-center gap-2 font-bold tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 text-white">
              <Sparkles className="h-4 w-4" />
            </span>
            Premium<span className="text-gradient">Explorer</span>
          </Link>
          <p className="max-w-sm text-sm text-muted-foreground">
            A production-grade search, filtering, sorting and pagination platform. Explore 50,000+
            premium products with sub-second search performance.
          </p>
          <div className="flex gap-2">
            {[Github, Twitter, Linkedin].map((Icon, i) => (
              <a
                key={i}
                href="#"
                onClick={(e) => e.preventDefault()}
                className="flex h-9 w-9 items-center justify-center rounded-lg border transition-colors hover:border-primary/50 hover:text-primary"
                aria-label="Social link"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {Object.entries(footerLinks).map(([heading, links]) => (
          <div key={heading}>
            <h4 className="mb-4 text-sm font-semibold">{heading}</h4>
            <ul className="space-y-2.5">
              {links.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t">
        <div className="container flex flex-col items-center justify-between gap-2 py-5 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Premium Product Explorer. All rights reserved.</p>
          <p>
            Built with React 19, Express, MongoDB & Prisma —{" "}
            <span className="font-medium text-foreground">50,000+ products</span> in the catalog
          </p>
        </div>
      </div>
    </footer>
  );
}
