import { Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import RootLayout from "@/layouts/RootLayout";
import DashboardLayout from "@/layouts/DashboardLayout";
import LoadingScreen from "@/components/layout/LoadingScreen";
import PageTransition from "@/components/layout/PageTransition";
import { AuthProvider } from "@/contexts/AuthContext";

const LandingPage = lazy(() => import("@/pages/LandingPage"));
const EventDetails = lazy(() => import("@/pages/EventDetails"));
const Venue = lazy(() => import("@/pages/Venue"));
const Tickets = lazy(() => import("@/pages/Tickets"));
const SeatSelection = lazy(() => import("@/pages/SeatSelection"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const BookingSuccess = lazy(() => import("@/pages/BookingSuccess"));
const UserDashboard = lazy(() => import("@/pages/UserDashboard"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const NotFound = lazy(() => import("@/pages/NotFound"));

function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<LoadingScreen />}>
        <Routes location={location} key={location.pathname}>
          <Route element={<RootLayout />}>
            <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
            <Route path="/events/:id" element={<PageTransition><EventDetails /></PageTransition>} />
            <Route path="/events/:id/venue" element={<PageTransition><Venue /></PageTransition>} />
            <Route path="/events/:id/tickets" element={<PageTransition><Tickets /></PageTransition>} />
            <Route path="/events/:id/seats" element={<PageTransition><SeatSelection /></PageTransition>} />
            <Route path="/checkout" element={<PageTransition><Checkout /></PageTransition>} />
            <Route path="/booking/success" element={<PageTransition><BookingSuccess /></PageTransition>} />
            <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
          </Route>
          {/* Dashboard routes — no ProtectedRoute wrapper, directly accessible */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<PageTransition><UserDashboard /></PageTransition>} />
            <Route path="/admin" element={<PageTransition><AdminDashboard /></PageTransition>} />
          </Route>
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
