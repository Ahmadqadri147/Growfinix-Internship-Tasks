import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, Calendar, Users, Ticket, Percent, Search, Plus, Edit3, Trash2,
  DollarSign, Activity, TrendingUp, Eye, RefreshCw,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  Button, GlassCard, Input, Select, Badge, Modal, DataTable, Tabs,
} from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";

const revenueData = [
  { month: "Jan", revenue: 85000 },
  { month: "Feb", revenue: 92000 },
  { month: "Mar", revenue: 78000 },
  { month: "Apr", revenue: 105000 },
  { month: "May", revenue: 112000 },
  { month: "Jun", revenue: 98000 },
  { month: "Jul", revenue: 125000 },
  { month: "Aug", revenue: 118000 },
  { month: "Sep", revenue: 135000 },
  { month: "Oct", revenue: 142000 },
  { month: "Nov", revenue: 155000 },
  { month: "Dec", revenue: 185000 },
];

const mockEvents = [
  { id: "1", title: "Midnight Royale Gala", date: "2026-12-31", status: "upcoming", ticketsSold: 1240 },
  { id: "2", title: "New Year's Eve Ball", date: "2026-12-31", status: "upcoming", ticketsSold: 856 },
  { id: "3", title: "Summer Soirée", date: "2026-07-15", status: "completed", ticketsSold: 2100 },
  { id: "4", title: "Autumn Gala", date: "2026-10-20", status: "completed", ticketsSold: 1800 },
];

const mockBookings = [
  { id: "1", ref: "MRG-A1B2C3", user: "John Doe", event: "Midnight Royale Gala", amount: 2500, status: "confirmed", date: "2026-06-15" },
  { id: "2", ref: "MRG-D4E5F6", user: "Jane Smith", event: "New Year's Eve Ball", amount: 1800, status: "pending", date: "2026-06-14" },
  { id: "3", ref: "MRG-G7H8I9", user: "Alice Brown", event: "Summer Soirée", amount: 3200, status: "completed", date: "2026-06-10" },
  { id: "4", ref: "MRG-J0K1L2", user: "Bob Wilson", event: "Autumn Gala", amount: 1500, status: "cancelled", date: "2026-06-08" },
  { id: "5", ref: "MRG-M3N4O5", user: "Carol Davis", event: "Midnight Royale Gala", amount: 4000, status: "confirmed", date: "2026-06-05" },
];

const mockUsers = [
  { id: "1", name: "John Doe", email: "john@example.com", role: "user", bookings: 3 },
  { id: "2", name: "Jane Smith", email: "jane@example.com", role: "user", bookings: 5 },
  { id: "3", name: "Admin User", email: "admin@midnightroyale.com", role: "admin", bookings: 0 },
  { id: "4", name: "Alice Brown", email: "alice@example.com", role: "user", bookings: 2 },
];

const mockTickets = [
  { id: "1", tier: "Diamond VIP", price: 2500, available: 50, sold: 38 },
  { id: "2", tier: "VIP", price: 1500, available: 100, sold: 72 },
  { id: "3", tier: "Premium", price: 500, available: 300, sold: 210 },
  { id: "4", tier: "Economy", price: 200, available: 500, sold: 340 },
];

const mockCoupons = [
  { id: "1", code: "GALA20", discount: 20, type: "percentage", uses: 45, expires: "2026-12-31", active: true },
  { id: "2", code: "VIP100", discount: 100, type: "fixed", uses: 12, expires: "2026-12-25", active: true },
  { id: "3", code: "EARLYBIRD", discount: 15, type: "percentage", uses: 0, expires: "2026-11-30", active: false },
];

const statusColors: Record<string, "success" | "warning" | "error" | "info"> = {
  confirmed: "success",
  pending: "warning",
  completed: "info",
  cancelled: "error",
  upcoming: "info",
};

type ModalMode = "create" | "edit";

export default function AdminDashboard() {
  const [liveCount, setLiveCount] = useState(856);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  const [eventModal, setEventModal] = useState(false);
  const [ticketModal, setTicketModal] = useState(false);
  const [couponModal, setCouponModal] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Admin Dashboard | Midnight Royale Gala";
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveCount((c) => c + Math.floor(Math.random() * 3));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-midnight-950">
      <div className="mx-auto max-w-7xl px-6 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-4"
        >
          <div>
            <h1 className="font-serif text-3xl font-bold gold-text">Admin Dashboard</h1>
            <p className="mt-1 text-gray-400">Manage your events and platform</p>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2">
            <Activity className="h-4 w-4 text-green-400" />
            <span className="text-sm text-gray-400">Live Bookings:</span>
            <motion.span
              key={liveCount}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="font-mono text-sm font-bold text-white"
            >
              {liveCount}
            </motion.span>
          </div>
        </motion.div>

        <div className="mt-8">
          <Tabs
            tabs={[
              {
                id: "overview",
                label: "Overview",
                icon: <BarChart3 className="h-4 w-4" />,
                content: <OverviewTab liveCount={liveCount} />,
              },
              {
                id: "events",
                label: "Events",
                icon: <Calendar className="h-4 w-4" />,
                content: (
                  <EventsTab
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    eventModal={eventModal}
                    setEventModal={setEventModal}
                    modalMode={modalMode}
                    setModalMode={setModalMode}
                    editingId={editingId}
                    setEditingId={setEditingId}
                  />
                ),
              },
              {
                id: "bookings",
                label: "Bookings",
                icon: <Ticket className="h-4 w-4" />,
                content: (
                  <BookingsTab
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                  />
                ),
              },
              {
                id: "users",
                label: "Users",
                icon: <Users className="h-4 w-4" />,
                content: (
                  <UsersTab
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    roleFilter={roleFilter}
                    setRoleFilter={setRoleFilter}
                  />
                ),
              },
              {
                id: "tickets",
                label: "Tickets",
                icon: <Ticket className="h-4 w-4" />,
                content: (
                  <TicketsTab
                    ticketModal={ticketModal}
                    setTicketModal={setTicketModal}
                    modalMode={modalMode}
                    setModalMode={setModalMode}
                    editingId={editingId}
                    setEditingId={setEditingId}
                  />
                ),
              },
              {
                id: "coupons",
                label: "Coupons",
                icon: <Percent className="h-4 w-4" />,
                content: (
                  <CouponsTab
                    couponModal={couponModal}
                    setCouponModal={setCouponModal}
                    modalMode={modalMode}
                    setModalMode={setModalMode}
                    editingId={editingId}
                    setEditingId={setEditingId}
                  />
                ),
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

function OverviewTab({ liveCount }: { liveCount: number }) {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Revenue", value: "$1.2M", change: "+12.5%", icon: DollarSign, color: "from-yellow-400 to-amber-600" },
          { label: "Total Bookings", value: liveCount.toLocaleString(), change: "+8.2%", icon: Activity, color: "from-blue-400 to-blue-600" },
          { label: "Active Users", value: "1,234", change: "+5.7%", icon: Users, color: "from-green-400 to-green-600" },
          { label: "Occupancy Rate", value: "78%", change: "+3.1%", icon: TrendingUp, color: "from-purple-400 to-purple-600" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <GlassCard>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                  <p className="font-serif text-3xl font-bold text-white">{stat.value}</p>
                  <p className="mt-1 text-xs text-green-400">{stat.change}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${stat.color} bg-opacity-20`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          <h3 className="mb-6 font-serif text-lg font-semibold text-white">Revenue Overview</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{
                    background: "#1a1a2e",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#D4AF37" }}
                  formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#D4AF37"
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="mb-4 font-serif text-lg font-semibold text-white">Recent Bookings</h3>
          <div className="space-y-3">
            {mockBookings.slice(0, 5).map((booking) => (
              <div key={booking.id} className="flex items-center justify-between rounded-lg bg-white/5 p-3">
                <div>
                  <p className="text-sm font-medium text-white">{booking.user}</p>
                  <p className="text-xs text-gray-500">{booking.ref}</p>
                </div>
                <Badge variant={statusColors[booking.status] || "info"} size="sm">
                  {booking.status}
                </Badge>
              </div>
            ))}
          </div>
          <Button variant="ghost" className="mt-4 w-full text-sm" onClick={() => {}}>
            <RefreshCw className="mr-2 h-4 w-4" /> View All
          </Button>
        </GlassCard>
      </div>
    </div>
  );
}

function EventsTab({
  searchQuery, setSearchQuery, eventModal, setEventModal, modalMode, setModalMode, editingId: _editingId, setEditingId,
}: {
  searchQuery: string; setSearchQuery: (v: string) => void;
  eventModal: boolean; setEventModal: (v: boolean) => void;
  modalMode: ModalMode; setModalMode: (v: ModalMode) => void;
  editingId: string | null; setEditingId: (v: string | null) => void;
}) {
  const filtered = mockEvents.filter((e) =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          onClick={() => {
            setModalMode("create");
            setEditingId(null);
            setEventModal(true);
          }}
        >
          <Plus className="h-4 w-4" /> Create Event
        </Button>
      </div>

      <DataTable
        columns={[
          { key: "title", header: "Title" },
          {
            key: "date",
            header: "Date",
            render: (item) => formatDate(item.date as string),
          },
          {
            key: "status",
            header: "Status",
            render: (item) => (
              <Badge variant={statusColors[item.status as string] || "info"} size="sm">
                {(item.status as string).toUpperCase()}
              </Badge>
            ),
          },
          { key: "ticketsSold", header: "Sold" },
          {
            key: "actions",
            header: "Actions",
            render: (item) => (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setModalMode("edit");
                    setEditingId(item.id as string);
                    setEventModal(true);
                  }}
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => toast.success("Event deleted")}>
                  <Trash2 className="h-4 w-4 text-red-400" />
                </Button>
              </div>
            ),
          },
        ]}
        data={filtered}
      />

      <Modal
        isOpen={eventModal}
        onClose={() => setEventModal(false)}
        title={modalMode === "create" ? "Create Event" : "Edit Event"}
        size="lg"
      >
        <div className="space-y-4">
          <Input label="Title" id="event-title" placeholder="Event title" />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-300">Description</label>
            <textarea
              rows={3}
              className="h-24 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-gold-500/50 focus:bg-white/10 focus:ring-1 focus:ring-gold-500/30"
              placeholder="Event description"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Date" id="event-date" type="date" />
            <Input label="Time" id="event-time" type="time" />
          </div>
          <Input label="Venue" id="event-venue" placeholder="Venue name" />
          <Select
            label="Status"
            options={[
              { value: "upcoming", label: "Upcoming" },
              { value: "ongoing", label: "Ongoing" },
              { value: "completed", label: "Completed" },
              { value: "cancelled", label: "Cancelled" },
            ]}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setEventModal(false)}>Cancel</Button>
            <Button onClick={() => { toast.success(modalMode === "create" ? "Event created" : "Event updated"); setEventModal(false); }}>
              {modalMode === "create" ? "Create Event" : "Save Changes"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function BookingsTab({
  searchQuery, setSearchQuery, statusFilter, setStatusFilter,
}: {
  searchQuery: string; setSearchQuery: (v: string) => void;
  statusFilter: string; setStatusFilter: (v: string) => void;
}) {
  const filtered = mockBookings.filter((b) => {
    const matchesSearch = b.ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.user.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="Search bookings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          options={[
            { value: "all", label: "All Status" },
            { value: "confirmed", label: "Confirmed" },
            { value: "pending", label: "Pending" },
            { value: "completed", label: "Completed" },
            { value: "cancelled", label: "Cancelled" },
          ]}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        />
      </div>

      <DataTable
        columns={[
          { key: "ref", header: "Reference" },
          { key: "user", header: "User" },
          { key: "event", header: "Event" },
          {
            key: "amount",
            header: "Amount",
            render: (item) => formatCurrency(item.amount as number),
          },
          {
            key: "status",
            header: "Status",
            render: (item) => (
              <Badge variant={statusColors[item.status as string] || "info"} size="sm">
                {(item.status as string).toUpperCase()}
              </Badge>
            ),
          },
          {
            key: "date",
            header: "Date",
            render: (item) => formatDate(item.date as string),
          },
          {
            key: "actions",
            header: "Actions",
            render: (_item) => (
              <div className="flex gap-2">
                <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => toast.success("Status updated")}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            ),
          },
        ]}
        data={filtered}
      />
    </div>
  );
}

function UsersTab({
  searchQuery, setSearchQuery, roleFilter, setRoleFilter,
}: {
  searchQuery: string; setSearchQuery: (v: string) => void;
  roleFilter: string; setRoleFilter: (v: string) => void;
}) {
  const filtered = mockUsers.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          options={[
            { value: "all", label: "All Roles" },
            { value: "user", label: "User" },
            { value: "admin", label: "Admin" },
          ]}
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        />
      </div>

      <DataTable
        columns={[
          { key: "name", header: "Name" },
          { key: "email", header: "Email" },
          {
            key: "role",
            header: "Role",
            render: (item) => (
              <Badge variant={item.role === "admin" ? "gold" : "info"} size="sm">
                {(item.role as string).toUpperCase()}
              </Badge>
            ),
          },
          { key: "bookings", header: "Bookings" },
          {
            key: "actions",
            header: "Actions",
            render: (item) => (
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.success(`Role updated for ${item.name}`)}
              >
                Change Role
              </Button>
            ),
          },
        ]}
        data={filtered}
      />
    </div>
  );
}

function TicketsTab({
  ticketModal, setTicketModal, modalMode, setModalMode, editingId: _editingId, setEditingId,
}: {
  ticketModal: boolean; setTicketModal: (v: boolean) => void;
  modalMode: ModalMode; setModalMode: (v: ModalMode) => void;
  editingId: string | null; setEditingId: (v: string | null) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setModalMode("create");
            setEditingId(null);
            setTicketModal(true);
          }}
        >
          <Plus className="h-4 w-4" /> Create Ticket Tier
        </Button>
      </div>

      <DataTable
        columns={[
          { key: "tier", header: "Tier" },
          {
            key: "price",
            header: "Price",
            render: (item) => formatCurrency(item.price as number),
          },
          { key: "available", header: "Available" },
          { key: "sold", header: "Sold" },
          {
            key: "actions",
            header: "Actions",
            render: (item) => (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setModalMode("edit");
                    setEditingId(item.id as string);
                    setTicketModal(true);
                  }}
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => toast.success("Ticket tier deleted")}>
                  <Trash2 className="h-4 w-4 text-red-400" />
                </Button>
              </div>
            ),
          },
        ]}
        data={mockTickets}
      />

      <Modal
        isOpen={ticketModal}
        onClose={() => setTicketModal(false)}
        title={modalMode === "create" ? "Create Ticket Tier" : "Edit Ticket Tier"}
      >
        <div className="space-y-4">
          <Input label="Tier Name" id="tier-name" placeholder="e.g. Diamond VIP" />
          <Input label="Price" id="tier-price" type="number" placeholder="2500" />
          <Input label="Available Quantity" id="tier-qty" type="number" placeholder="100" />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setTicketModal(false)}>Cancel</Button>
            <Button onClick={() => { toast.success(modalMode === "create" ? "Tier created" : "Tier updated"); setTicketModal(false); }}>
              {modalMode === "create" ? "Create" : "Save"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function CouponsTab({
  couponModal, setCouponModal, modalMode, setModalMode, editingId: _editingId, setEditingId,
}: {
  couponModal: boolean; setCouponModal: (v: boolean) => void;
  modalMode: ModalMode; setModalMode: (v: ModalMode) => void;
  editingId: string | null; setEditingId: (v: string | null) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setModalMode("create");
            setEditingId(null);
            setCouponModal(true);
          }}
        >
          <Plus className="h-4 w-4" /> Create Coupon
        </Button>
      </div>

      <DataTable
        columns={[
          { key: "code", header: "Code" },
          {
            key: "discount",
            header: "Discount",
            render: (item) =>
              item.type === "percentage"
                ? `${item.discount}%`
                : formatCurrency(item.discount as number),
          },
          { key: "uses", header: "Uses" },
          {
            key: "expires",
            header: "Expires",
            render: (item) => formatDate(item.expires as string),
          },
          {
            key: "active",
            header: "Active",
            render: (item) => (
              <Badge variant={item.active ? "success" : "error"} size="sm">
                {item.active ? "Active" : "Inactive"}
              </Badge>
            ),
          },
          {
            key: "actions",
            header: "Actions",
            render: (item) => (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setModalMode("edit");
                    setEditingId(item.id as string);
                    setCouponModal(true);
                  }}
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => toast.success("Coupon deleted")}>
                  <Trash2 className="h-4 w-4 text-red-400" />
                </Button>
              </div>
            ),
          },
        ]}
        data={mockCoupons}
      />

      <Modal
        isOpen={couponModal}
        onClose={() => setCouponModal(false)}
        title={modalMode === "create" ? "Create Coupon" : "Edit Coupon"}
      >
        <div className="space-y-4">
          <Input label="Coupon Code" id="coupon-code" placeholder="e.g. SAVE20" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Discount Value" id="coupon-discount" type="number" placeholder="20" />
            <Select
              label="Discount Type"
              options={[
                { value: "percentage", label: "Percentage" },
                { value: "fixed", label: "Fixed Amount" },
              ]}
            />
          </div>
          <Input label="Usage Limit" id="coupon-uses" type="number" placeholder="100" />
          <Input label="Expiry Date" id="coupon-expires" type="date" />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setCouponModal(false)}>Cancel</Button>
            <Button onClick={() => { toast.success(modalMode === "create" ? "Coupon created" : "Coupon updated"); setCouponModal(false); }}>
              {modalMode === "create" ? "Create" : "Save"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
