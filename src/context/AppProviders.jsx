import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { ThemeProvider } from "./ThemeContext";
import { queryClient } from "@/lib/queryClient";

export function AppProviders({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>{children}</ThemeProvider>
      <Toaster position="top-right" richColors closeButton />
    </QueryClientProvider>
  );
}