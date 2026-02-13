import {
  Home,
  LayoutDashboard,
  Gift,
  History,
  Users,
  Settings,
  LogOut,
  PlusCircle,
  CheckCircle,
  PieChart,
  MapPin,
  ChevronUp,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { auth, db } from "@backend/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [role, setRole] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [approved, setApproved] = useState<boolean>(false);
  const [userName, setUserName] = useState<string | null>(null);

  // Use the sidebar hook to get current state
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setRole(null);
        setEmail(null);
        setUserName(null);
        setApproved(false);
        return;
      }

      setEmail(user.email);
      setUserName(user.displayName || user.email?.split('@')[0] || "User");

      // Fetch role from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setRole(data.role);
        setApproved(data.approved === true);
        if (data.name) setUserName(data.name);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/auth");
    toast.success("Logged out successfully");
  };

  const donorItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Donate Food", url: "/donate", icon: PlusCircle },
    { title: "My Donations", url: "/donations", icon: History },
  ];

  const ngoItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Available Food", url: "/available-food", icon: Gift },
    { title: "My Claims", url: "/claims", icon: CheckCircle },
    { title: "Logistics", url: "/logistics", icon: MapPin },
  ];

  const adminItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Manage Users", url: "/users", icon: Users },
    { title: "Platform Analytics", url: "/analytics", icon: PieChart },
    { title: "All Donations", url: "/all-donations", icon: Gift },
  ];

  let items = donorItems;
  let roleLabel = "Donor Account";

  if (role === 'ngo') {
    roleLabel = "NGO Partner";
    if (!approved) {
      items = [{ title: "Dashboard", url: "/dashboard", icon: LayoutDashboard }];
    } else {
      items = ngoItems;
    }
  }
  if (role === 'admin') {
    roleLabel = "Administrator";
    items = adminItems;
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-border/40 bg-card/95 backdrop-blur-xl shadow-xl">
      <SidebarHeader className="pb-4 pt-4 px-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-transparent h-14">
              <div className={`flex aspect-square items-center justify-center rounded-xl text-primary-foreground ${isCollapsed ? 'size-8' : 'size-12'} transition-all duration-300`}>
                <img src="/logo.png" alt="Surplus2Serve Logo" className={`${isCollapsed ? 'size-8' : 'size-12'} object-contain transition-all duration-300`} />
              </div>
              {!isCollapsed && (
                <div className="grid flex-1 text-left text-sm leading-tight ml-2 animate-in fade-in zoom-in-95 duration-300">
                  <span className="truncate font-bold text-lg tracking-tight">Surplus2Serve</span>
                  <span className="truncate text-xs font-medium text-muted-foreground">{roleLabel}</span>
                </div>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator className="mx-4 opacity-50" />

      <SidebarContent className="px-2 pt-2 gap-4">

        {/* Main Navigation Group */}
        <SidebarGroup>
          {!isCollapsed && <SidebarGroupLabel className="uppercase text-[10px] font-bold tracking-wider text-muted-foreground/70 px-4 mb-2 animate-in fade-in duration-300">Platform</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === "/"}
                  tooltip="Home"
                  className="group-data-[collapsible=icon]:!p-2 transition-all duration-200 hover:translate-x-1"
                >
                  <a href="/" onClick={(e) => { e.preventDefault(); navigate("/"); }}>
                    <Home className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    {!isCollapsed && <span className="font-medium animate-in fade-in duration-200">Home Page</span>}
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                    className="group-data-[collapsible=icon]:!p-2 transition-all duration-200 hover:translate-x-1 data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-semibold"
                  >
                    <a href={item.url} onClick={(e) => { e.preventDefault(); navigate(item.url); }}>
                      <item.icon className="size-4 group-hover:text-primary transition-colors" />
                      {!isCollapsed && <span className="animate-in fade-in duration-200">{item.title}</span>}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Secondary Group (Settings/Support placeholder) */}
        <SidebarGroup className="mt-auto">
          {!isCollapsed && <SidebarGroupLabel className="uppercase text-[10px] font-bold tracking-wider text-muted-foreground/70 px-4 mb-2 animate-in fade-in duration-300">Settings</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Settings"
                  className="transition-all duration-200 hover:translate-x-1 cursor-pointer"
                  onClick={() => toast.info("Settings panel coming soon!")}
                >
                  <Settings className="size-4 text-muted-foreground group-hover:text-primary" />
                  {!isCollapsed && <span className="animate-in fade-in duration-200">General Settings</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>

      <SidebarSeparator className="mx-4 opacity-50" />

      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground transition-all duration-200 hover:bg-muted/50"
                >
                  <Avatar className={`h-9 w-9 rounded-lg border border-border/50 ${isCollapsed ? 'translate-x-[2px]' : ''} transition-transform duration-200`}>
                    <AvatarImage src={`https://api.dicebear.com/9.x/initials/svg?seed=${userName}`} alt={userName || "User"} />
                    <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-bold">CN</AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <>
                      <div className="grid flex-1 text-left text-sm leading-tight ml-1 animate-in fade-in zoom-in-95 duration-300">
                        <span className="truncate font-semibold text-foreground/90">{userName}</span>
                        <span className="truncate text-xs text-muted-foreground">{email}</span>
                      </div>
                      <ChevronUp className="ml-auto size-4 text-muted-foreground/70" />
                    </>
                  )}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl border-border/60 shadow-xl bg-popover/95 backdrop-blur-sm"
                side="top"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={`https://api.dicebear.com/9.x/initials/svg?seed=${userName}`} alt={userName || "User"} />
                      <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{userName}</span>
                      <span className="truncate text-xs text-muted-foreground">{email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-600 focus:bg-red-50 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
