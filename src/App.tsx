import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { VendorGuard } from "./components/VendorGuard";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Rotas reservadas - não passam pelo VendorGuard */}
          <Route path="/login" element={<NotFound />} />
          <Route path="/checkout" element={<NotFound />} />
          <Route path="/api/*" element={<NotFound />} />
          
          {/* Rota raiz - funciona com subdomínio ou vendedor admin */}
          <Route path="/" element={
            <VendorGuard>
              <Index />
            </VendorGuard>
          } />
          
          {/* Rota dinâmica - funciona com path (ex: /joao) */}
          <Route path="/:vendor" element={
            <VendorGuard>
              <Index />
            </VendorGuard>
          } />
          
          {/* Catch-all para 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;