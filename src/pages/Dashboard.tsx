import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Leaf,
  Utensils,
  Wind,
  ListChecks,
  HandHeart,
  Users,
  MapPin,
  Clock,
  LogOut,
  TrendingUp,
  Package,
  Activity
} from "lucide-react";
import { auth } from "@backend/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Badge } from "@/components/ui/badge";

// Components
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { ImpactChart } from "@/components/dashboard/ImpactChart";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { DistributionChart } from "@/components/dashboard/DistributionChart";
import { Skeleton } from "@/components/ui/skeleton";

// Hooks
import {
  useUserRole,
  useProfile,
  useDonorStats,
  useNgoStats,
  useAdminStats,
  useDonationHistory,
  useClaimHistory,
  useSystemHistory,
  useActivityFeed,
  useRecentTransactions,
} from "@/hooks/useDashboardData";

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: role, isLoading: roleLoading } = useUserRole();
  const { data: profile } = useProfile();
  const { data: donorStats } = useDonorStats(role === 'donor');
  const { data: ngoStats } = useNgoStats(role === 'ngo');
  const { data: adminStats } = useAdminStats(role === 'admin');
  const { data: donationHistory } = useDonationHistory(role === 'donor');
  const { data: claimHistory } = useClaimHistory(role === 'ngo');
  const { data: systemHistory } = useSystemHistory(role === 'admin');
  const { data: activityFeed } = useActivityFeed(!!role);
  const { data: recentTransactions } = useRecentTransactions(!!role);

  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthed(!!user);
      if (!user) navigate("/");
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (role) {
      console.log(`%c[Auth] User logged in as: ${role.toUpperCase()}`, "color: #3b82f6; font-weight: bold; font-size: 12px;");
    }
  }, [role]);


  if (authed === null || roleLoading) {
    return (
      <div className="min-h-screen bg-background p-6 md:p-10">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const displayName = profile?.display_name || "there";
  const isDonor = role === "donor";
  const isNgo = role === "ngo";
  const isAdmin = role === "admin";

  let greeting = "Welcome to Surplus2Serve";
  if (isDonor) greeting = "Your generosity is making a difference 🌱";
  if (isNgo) greeting = "Find food for those who need it most 💙";
  if (isAdmin) greeting = "Overview of platform performance 📊";

  // Chart data
  let chartData: any[] = [];
  let chartTitle = "Activity";
  let chartValueLabel = "Value";
  let pieChartData: any[] = [];
  let pieChartTitle = "Distribution";

  if (isDonor) {
    chartData = (donationHistory ?? []).map((d) => ({ date: d.date, value: d.meals }));
    chartTitle = "Meals Saved Over Time";
    chartValueLabel = "Meals";
    pieChartData = donorStats?.statusDistribution || [];
    pieChartTitle = "Donation Status";
  } else if (isNgo) {
    chartData = (claimHistory ?? []).map((c) => ({ date: c.date, value: c.meals }));
    chartTitle = "Donation Claims Over Time";
    chartValueLabel = "Claims";
    // Construct simple pie data for NGO
    pieChartData = [
      { name: "Available", value: ngoStats?.availableNearby || 0, color: "#10b981" },
      { name: "Expiring", value: ngoStats?.expiringSoon || 0, color: "#ef4444" }
    ].filter(i => i.value > 0);
    pieChartTitle = "Nearby Availability";
  } else if (isAdmin) {
    chartData = (systemHistory ?? []).map((d) => ({ date: d.date, value: d.meals }));
    chartTitle = "System-wide Activity";
    chartValueLabel = "Donations";
    pieChartData = adminStats?.roleDistribution || [];
    pieChartTitle = "User Role Distribution";
  }

  return (
    <div className="min-h-screen bg-background animate-fade-in">

      <main className="max-w-7xl mx-auto px-6 md:px-10 py-8 space-y-6">
        {/* Welcome */}
        <div className="animate-fade-up flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold text-card-foreground tracking-tight">
              Welcome back, {displayName}
            </h1>
            <Badge variant="secondary" className="uppercase text-xs font-bold tracking-wider">
              {role}
            </Badge>
          </div>
          <p className="text-muted-foreground">{greeting}</p>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isDonor && (
            <>
              <KpiCard
                title="Total Donations"
                value={donorStats?.totalDonations ?? 0}
                trend={12}
                icon={<Leaf className="w-4 h-4" />}
                color="emerald"
                delay={0}
              />
              <KpiCard
                title="Meals Saved"
                value={donorStats?.mealsSaved ?? 0}
                trend={8}
                icon={<Utensils className="w-4 h-4" />}
                color="emerald"
                delay={1}
              />
              <KpiCard
                title="CO₂ Reduced (kg)"
                value={donorStats?.co2Reduced?.toFixed(1) ?? 0}
                trend={15}
                icon={<Wind className="w-4 h-4" />}
                color="blue"
                delay={2}
              />
              <KpiCard
                title="Active Listings"
                value={donorStats?.activeListings ?? 0}
                icon={<ListChecks className="w-4 h-4" />}
                color="blue"
                delay={3}
              />
            </>
          )}

          {isNgo && (
            <>
              <KpiCard
                title="Food Claimed"
                value={ngoStats?.foodClaimed ?? 0}
                trend={18}
                icon={<HandHeart className="w-4 h-4" />}
                color="blue"
                delay={0}
              />
              <KpiCard
                title="Meals Distributed"
                value={ngoStats?.mealsDistributed ?? 0}
                trend={22}
                icon={<Users className="w-4 h-4" />}
                color="blue"
                delay={1}
              />
              <KpiCard
                title="Available Nearby"
                value={ngoStats?.availableNearby ?? 0}
                icon={<MapPin className="w-4 h-4" />}
                color="emerald"
                delay={2}
              />
              <KpiCard
                title="Expiring Soon"
                value={ngoStats?.expiringSoon ?? 0}
                icon={<Clock className="w-4 h-4" />}
                color="warning"
                delay={3}
              />
            </>
          )}

          {isAdmin && (
            <>
              <KpiCard
                title="Total Users"
                value={adminStats?.totalUsers ?? 0}
                trend={15}
                icon={<Users className="w-4 h-4" />}
                color="blue"
                delay={0}
              />
              <KpiCard
                title="Total Donations"
                value={adminStats?.totalDonations ?? 0}
                trend={25}
                icon={<Package className="w-4 h-4" />}
                color="emerald"
                delay={1}
              />
              <KpiCard
                title="Active Listings"
                value={adminStats?.activeListings ?? 0}
                icon={<Activity className="w-4 h-4" />}
                color="warning"
                delay={2}
              />
              <KpiCard
                title="Total Impact (Meals)"
                value={adminStats?.totalMeals ?? 0}
                trend={30}
                icon={<TrendingUp className="w-4 h-4" />}
                color="emerald"
                delay={3}
              />
            </>
          )}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <ImpactChart
              title={chartTitle}
              data={chartData}
              color={isDonor ? "emerald" : "blue"}
              valueLabel={chartValueLabel}
            />
          </div>
          <div>
            <DistributionChart title={pieChartTitle} data={pieChartData} />
          </div>
        </div>

        {/* Recent Transactions & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <RecentTransactions role={role} data={recentTransactions || []} />
          <ActivityFeed items={activityFeed || []} />
        </div>

        {/* Quick Actions */}
        <QuickActions role={role} />
      </main>
    </div>
  );
}
