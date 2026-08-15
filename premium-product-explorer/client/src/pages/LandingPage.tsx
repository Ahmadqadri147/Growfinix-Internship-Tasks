import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgePercent,
  Boxes,
  Flame,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Timer,
  TrendingUp,
  Truck,
  Zap
} from "lucide-react";
import { SearchBar } from "@/components/search/SearchBar";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductGridSkeleton } from "@/components/common/Skeletons";
import { SectionHeading } from "@/components/common/SectionHeading";
import { AnimatedCounter } from "@/components/common/AnimatedCounter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useHomeData } from "@/hooks/useProducts";

const heroStats = [
  { label: "Products", value: 50000 },
  { label: "Brands", value: 60 },
  { label: "Categories", value: 20 },
  { label: "Happy users", value: 12000 }
];

const trustPoints = [
  { icon: Truck, title: "Free shipping over $50", desc: "On all standard deliveries" },
  { icon: ShieldCheck, title: "Secure checkout", desc: "Bank-grade encryption" },
  { icon: Timer, title: "30-day returns", desc: "No questions asked" },
  { icon: Star, title: "4.5+ avg rating", desc: "From verified buyers" }
];

export default function LandingPage() {
  const navigate = useNavigate();
  const home = useHomeData();

  return (
    <div className="pb-20">
      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 top-20 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />

        <div className="container relative flex flex-col items-center gap-8 py-20 text-center sm:py-28">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <Badge variant="indigo" className="gap-1.5 px-3 py-1 text-xs">
              <Sparkles className="h-3 w-3" /> 50,000+ premium products, searchable in milliseconds
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl"
          >
            Discover the <span className="text-gradient">perfect product</span> in seconds
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="max-w-2xl text-base text-muted-foreground sm:text-lg"
          >
            Search, filter, sort and paginate through an enterprise-grade catalog built for speed.
            Smart suggestions, instant results and a buttery-smooth experience.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="w-full max-w-2xl"
          >
            <SearchBar size="large" autoFocus />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground"
          >
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5 text-primary" /> Trending:
            </span>
            {["wireless headphones", "running shoes", "smartwatch"].map((q) => (
              <button
                key={q}
                onClick={() => navigate(`/products?q=${encodeURIComponent(q)}`)}
                className="rounded-full border bg-background/60 px-3 py-1 text-xs transition-colors hover:border-primary/50 hover:text-primary"
              >
                {q}
              </button>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
            className="mt-6 grid w-full max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4"
          >
            {heroStats.map((stat) => (
              <div key={stat.label} className="rounded-xl border bg-background/50 p-4 backdrop-blur-sm">
                <div className="text-2xl font-extrabold text-primary">
                  <AnimatedCounter value={stat.value} format={(n) => (stat.value >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k+` : String(n))} />
                </div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-b bg-muted/30">
        <div className="container grid grid-cols-2 gap-6 py-6 lg:grid-cols-4">
          {trustPoints.map((point) => (
            <div key={point.title} className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <point.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">{point.title}</p>
                <p className="text-xs text-muted-foreground">{point.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container py-16">
        <SectionHeading
          title="Shop by category"
          subtitle="Browse 20 curated categories with thousands of products each"
          align="center"
        />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {(home.data?.categories ?? []).slice(0, 10).map((category, i) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              whileHover={{ y: -4 }}
            >
              <Link
                to={`/products?category=${category.slug}`}
                className="group flex flex-col items-center gap-3 rounded-xl border p-6 text-center transition-colors hover:border-primary/40"
              >
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-500/20 to-blue-500/20 transition-transform duration-300 group-hover:scale-110">
                  <Boxes className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold group-hover:text-primary">{category.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(category._count?.products ?? 0).toLocaleString()} products
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Best deals */}
      <section className="container py-8">
        <SectionHeading
          title={
            <span className="flex items-center gap-2">
              <BadgePercent className="h-6 w-6 text-destructive" /> Best deals
            </span>
          }
          subtitle="Up to 60% off across the catalog — while stock lasts"
          className="mb-6"
        />
        {home.isLoading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {home.data?.bestDeals.slice(0, 4).map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}
        <div className="mt-8 text-center">
          <Button variant="outline" size="lg" onClick={() => navigate("/products?sort=discount")}>
            View all deals <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Trending */}
      <section className="border-y bg-muted/30">
        <div className="container py-16">
          <SectionHeading
            title={
              <span className="flex items-center gap-2">
                <Flame className="h-6 w-6 text-orange-500" /> Trending now
              </span>
            }
            subtitle="The most popular products our community is loving right now"
            align="center"
          />
          {home.isLoading ? (
            <ProductGridSkeleton count={8} />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {home.data?.trending.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured */}
      <section className="container py-16">
        <SectionHeading
          title={
            <span className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" /> Featured picks
            </span>
          }
          subtitle="Hand-picked premium products from our top brands"
        />
        {home.isLoading ? (
          <ProductGridSkeleton count={8} />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {home.data?.featured.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* New arrivals */}
      <section className="container py-8">
        <SectionHeading
          title="New arrivals"
          subtitle="Fresh drops from the last few weeks"
        />
        {home.isLoading ? (
          <ProductGridSkeleton count={8} />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {home.data?.newArrivals.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}
        <div className="mt-10 text-center">
          <Button size="lg" onClick={() => navigate("/products")}>
            <Search className="mr-1 h-4 w-4" /> Browse all 50,000+ products
          </Button>
        </div>
      </section>
    </div>
  );
}
