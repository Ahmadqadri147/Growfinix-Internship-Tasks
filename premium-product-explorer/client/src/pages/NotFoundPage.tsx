import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Compass, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5 px-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", damping: 20 }}
      >
        <div className="relative mx-auto flex h-32 w-32 items-center justify-center">
          <div className="absolute inset-0 animate-float-slow rounded-full bg-gradient-to-br from-indigo-500/20 to-blue-500/20 blur-xl" />
          <span className="text-7xl font-extrabold text-gradient">404</span>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="space-y-2"
      >
        <h1 className="text-2xl font-bold">Page not found</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex flex-wrap justify-center gap-3"
      >
        <Button onClick={() => navigate("/")}>
          <Home className="mr-1 h-4 w-4" /> Go home
        </Button>
        <Button variant="outline" onClick={() => navigate("/products")}>
          <Search className="mr-1 h-4 w-4" /> Browse products
        </Button>
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <Compass className="mr-1 h-4 w-4" /> Go back
        </Button>
      </motion.div>
    </div>
  );
}
