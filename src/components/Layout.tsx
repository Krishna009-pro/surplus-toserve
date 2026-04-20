import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useEffect, useState } from "react";
import { auth } from "@backend/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setSession(!!user);
      const isPublicRoute = location.pathname === "/" || location.pathname === "/auth";
      if (!user && !isPublicRoute) {
        navigate("/auth");
      }
    });

    return () => unsubscribe();
  }, [navigate, location.pathname]);

  if (session === null) {
    return null; // Loading state
  }

  // If user is on the auth page or landing page (and not logged in), don't show the sidebar layout
  // But if logged in, we might want to show sidebar even on home
  if (location.pathname === "/auth") {
    return <main className="w-full min-h-screen">{children}</main>;
  }

  if (!session && location.pathname === "/") {
    return <main className="w-full min-h-screen">{children}</main>;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background/50">
        <AppSidebar />
        <main className="flex-1 w-full relative">
          <div className="p-2 absolute top-0 left-0 z-10">
            <SidebarTrigger />
          </div>
          <div className="container mx-auto p-6 pt-16 animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
