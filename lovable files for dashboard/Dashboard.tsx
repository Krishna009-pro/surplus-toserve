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
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { ImpactChart } from "@/components/dashboard/ImpactChart";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { QuickActions } from "@/components/dashboard/QuickActions";
import {
  useUserRole,
  useProfile,
  useDonorStats,
  useNgoStats,
  useDonationHistory,
  useClaimHistory,
  useActivityFeed,
} from "@/hooks/useDashboardData";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: role, isLoading: roleLoading } = useUserRole();
  const { data: profile } = useProfile();
  const { data: donorStats } = useDonorStats();
  const { data: ngoStats } = useNgoStats();
  const { data: donationHistory } = useDonationHistory();
  const { data: claimHistory } = useClaimHistory();
  const { data: activityFeed } = useActivityFeed();

  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(!!session);
      if (!session) navigate("/");
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthed(!!session);
      if (!session) navigate("/");
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

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
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    );
  }

  const displayName = profile?.display_name ?? "there";
  const isDonor = role === "donor";
  const greeting = isDonor
    ? "Your generosity is making a difference 🌱"
    : "Find food for those who need it most 💙";

  // Chart data
  const chartData = isDonor
    ? (donationHistory ?? []).map((d) => ({ date: d.date, value: d.meals }))
    : (claimHistory ?? []).map((c) => ({ date: c.date, value: c.meals }));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/60 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Leaf className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-card-foreground tracking-tight">
              Surplus2Serve
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {profile?.display_name}
            </span>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-muted text-muted-foreground capitalize">
              {role ?? "user"}
            </span>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-10 py-8 space-y-6">
        {/* Welcome */}
        <div className="animate-fade-up">
          <h1 className="text-2xl md:text-3xl font-bold text-card-foreground tracking-tight">
            Welcome back, {displayName}
          </h1>
          <p className="text-muted-foreground mt-1">{greeting}</p>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isDonor ? (
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
                value={donorStats?.co2Reduced ?? 0}
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
          ) : (
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
        </div>

        {/* Bento grid: chart + activity + actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <ImpactChart
              title={isDonor ? "Meals Saved Over Time" : "Donation Claims Over Time"}
              data={chartData}
              color={isDonor ? "emerald" : "blue"}
              valueLabel={isDonor ? "Meals" : "Claims"}
            />
          </div>
          <div>
            <ActivityFeed items={activityFeed ?? []} />
          </div>
        </div>

        {/* Quick Actions */}
        <QuickActions role={role} />
      </main>
    </div>
  );
}
