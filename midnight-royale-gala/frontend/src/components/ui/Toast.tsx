import { Toaster } from "sonner";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: "rgba(20, 20, 46, 0.95)",
          border: "1px solid rgba(212, 175, 55, 0.3)",
          color: "#fff",
          backdropFilter: "blur(20px)",
        },
      }}
      className="toast-group"
    />
  );
}
