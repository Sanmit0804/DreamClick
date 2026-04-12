import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useEffect } from "react";

import "./App.css";
import { AppRoutes } from "./routes";
import authService from "@/services/auth";
import { CartFavProvider, useCartFav } from "@/context/CartFavContext";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

/**
 * Inner app – has access to CartFavContext.
 * Verifies the auth token, then reloads cart/favorites from the right source.
 */
function InnerApp() {
  const { reload } = useCartFav();

  useEffect(() => {
    authService.verify()
      .then((res) => {
        if (res?.user) {
          reload(true, res.user);
        } else {
          reload(false);
        }
      })
      .catch(() => reload(false));
  }, [reload]);

  return <AppRoutes />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <BrowserRouter>
          <CartFavProvider>
            <InnerApp />
          </CartFavProvider>
        </BrowserRouter>
        <Toaster />
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;