import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Home";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Layout from "./components/Layout";
import Donate from "./pages/Donate";
import Donations from "./pages/Donations";
import AvailableFood from "./pages/AvailableFood";
import Claims from "./pages/Claims";
import AdminUsers from "./pages/AdminUsers";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminDonations from "./pages/AdminDonations";
import Logistics from "./pages/Logistics";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Donor Routes */}
            <Route path="/donate" element={<Donate />} />
            <Route path="/donations" element={<Donations />} />

            {/* NGO Routes */}
            <Route path="/available-food" element={<AvailableFood />} />
            <Route path="/claims" element={<Claims />} />
            <Route path="/logistics" element={<Logistics />} />

            {/* Admin Routes */}
            <Route path="/users" element={<AdminUsers />} />
            <Route path="/analytics" element={<AdminAnalytics />} />
            <Route path="/all-donations" element={<AdminDonations />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
