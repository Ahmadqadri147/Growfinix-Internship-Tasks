import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowUpRight,
  Boxes,
  DollarSign,
  Eye,
  Flame,
  Package,
  Search,
  ShoppingBag,
  Star,
  TrendingUp,
  UserPlus,
  Users
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis
} from "recharts";
import { adminService } from "@/services/admin.service";
import { AnimatedCounter } from "@/components/common/AnimatedCounter";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, timeAgo } from "@/constants";

const CHART_COLORS = ["#6366f1", "#3b82f6", "#22c55e", "#f59e0b", "#ec4899"];

function StatCard({
  icon: Icon,
  label,
  value,
  suffix,
  format,
  delay
}: {
  icon: typeof Package;
  label: string;
  value: number;
  suffix?: string;
  format?: (n: number) => string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
    >
      <Card className="transition-shadow hover:shadow-lift">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className="truncate text-2xl font-bold">
              <AnimatedCounter value={value} format={format} />
              {suffix}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function CardSkeleton({ className }: { className?: string }) {
  return <Skeleton className={className ?? "h-32 rounded-xl"} />;
}

export default function AdminDashboardPage() {
  const stats = useQuery({ queryKey: ["admin", "stats"], queryFn: adminService.stats });
  const topSearches = useQuery({ queryKey: ["admin", "top-searches"], queryFn: () => adminService.topSearches(30, 8) });
  const searchVolume = useQuery({ queryKey: ["admin", "search-volume"], queryFn: () => adminService.searchVolume(14) });
  const revenue = useQuery({ queryKey: ["admin", "revenue"], queryFn: () => adminService.revenueByDay(14) });
  const mostViewed = useQuery({ queryKey: ["admin", "most-viewed"], queryFn: () => adminService.mostViewed(6) });
  const activity = useQuery({ queryKey: ["admin", "activity"], queryFn: () => adminService.recentActivity(10) });
  const categories = useQuery({ queryKey: ["admin", "categories"], queryFn: adminService.categoryDistribution });

  const activityIcons: Record<string, typeof Package> = {
    ORDER: ShoppingBag,
    USER: UserPlus,
    SEARCH: Search
  };

  return (
    <div className="container py-6">
      <Breadcrumbs items={[{ label: "Admin", href: "/admin" }, { label: "Dashboard" }]} />
      <div className="mb-6 mt-2 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin dashboard</h1>
          <p className="text-sm text-muted-foreground">Platform analytics and overview</p>
        </div>
        <Badge variant="indigo" className="gap-1">
          <Activity className="h-3 w-3" /> Live
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.isPending ? (
          Array.from({ length: 4 }, (_, i) => <CardSkeleton key={i} />)
        ) : (
          <>
            <StatCard icon={Package} label="Products" value={stats.data?.counts.products ?? 0} delay={0} />
            <StatCard icon={Boxes} label="Categories" value={stats.data?.counts.categories ?? 0} delay={0.05} />
            <StatCard icon={Users} label="Users" value={stats.data?.counts.users ?? 0} delay={0.1} />
            <StatCard icon={ShoppingBag} label="Orders" value={stats.data?.counts.orders ?? 0} delay={0.15} />
          </>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.isPending ? (
          Array.from({ length: 4 }, (_, i) => <CardSkeleton key={i} />)
        ) : (
          <>
            <StatCard icon={DollarSign} label="Revenue" value={stats.data?.revenue.total ?? 0} format={(n) => formatCurrency(n)} delay={0} />
            <StatCard icon={Star} label="Avg rating items" value={stats.data?.counts.reviews ?? 0} delay={0.05} />
            <StatCard icon={TrendingUp} label="Wishlist saves" value={stats.data?.counts.wishlists ?? 0} delay={0.1} />
            <StatCard icon={Eye} label="Total stock units" value={stats.data?.inventory.totalStock ?? 0} delay={0.15} />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Search volume (last 14 days)</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {searchVolume.isPending ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={searchVolume.data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="searchGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d) => d.slice(5)} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <ChartTooltip />
                  <Area type="monotone" dataKey="searches" stroke="#6366f1" fill="url(#searchGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Revenue (last 14 days)</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {revenue.isPending ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenue.data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d) => d.slice(5)} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <ChartTooltip formatter={(value) => [formatCurrency(Number(value)), "Revenue"]} />
                  <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                    {revenue.data?.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* Top searches */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Flame className="h-4 w-4 text-orange-500" /> Top searches
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topSearches.isPending ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-8" />)}
              </div>
            ) : (
              <div className="space-y-1">
                {topSearches.data?.map((s, i) => (
                  <div key={s.query} className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/50">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary/10 text-xs font-bold text-primary">
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{s.query}</span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <ArrowUpRight className="h-3 w-3 text-emerald-500" /> {s.count}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Most viewed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Eye className="h-4 w-4 text-primary" /> Most viewed products
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mostViewed.isPending ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-10" />)}
              </div>
            ) : (
              <div className="space-y-1">
                {mostViewed.data?.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/50">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{p.title}</p>
                      <p className="text-xs text-muted-foreground">{p.category.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{formatCurrency(p.price)}</p>
                      <p className="text-xs text-muted-foreground">{p.viewCount.toLocaleString()} views</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Activity className="h-4 w-4 text-emerald-500" /> Recent activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activity.isPending ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-8" />)}
              </div>
            ) : (
              <div className="space-y-1">
                {activity.data?.map((a, i) => {
                  const Icon = activityIcons[a.type] ?? Activity;
                  return (
                    <div key={`${a.type}-${a.date}-${i}`} className="flex items-start gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/50">
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Icon className="h-3.5 w-3.5 text-primary" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm">{a.text}</p>
                        <p className="text-xs text-muted-foreground">{timeAgo(a.date)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Category distribution */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-sm">Product distribution by category</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          {categories.isPending ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categories.data}
                  dataKey="products"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={2}
                  label={(entry) => entry.name}
                  labelLine={false}
                >
                  {categories.data?.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip formatter={(value, name) => [`${Number(value).toLocaleString()} products`, name]} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
