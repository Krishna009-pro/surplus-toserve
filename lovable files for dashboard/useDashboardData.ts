import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = "donor" | "ngo" | null;

export function useUserRole() {
  return useQuery({
    queryKey: ["user-role"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      return data?.role as UserRole ?? null;
    },
  });
}

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      return data;
    },
  });
}

export function useDonorStats() {
  return useQuery({
    queryKey: ["donor-stats"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: donations } = await supabase
        .from("donations")
        .select("*")
        .eq("donor_id", user.id);

      const allDonations = donations ?? [];
      const totalDonations = allDonations.length;
      const mealsSaved = allDonations.reduce((s, d) => s + (d.meals_equivalent ?? 0), 0);
      const co2Reduced = allDonations.reduce((s, d) => s + Number(d.co2_saved_kg ?? 0), 0);
      const activeListings = allDonations.filter((d) => d.status === "available").length;

      return { totalDonations, mealsSaved, co2Reduced, activeListings };
    },
  });
}

export function useNgoStats() {
  return useQuery({
    queryKey: ["ngo-stats"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: claims } = await supabase
        .from("donation_claims")
        .select("*, donations(*)")
        .eq("ngo_id", user.id);

      const allClaims = claims ?? [];
      const foodClaimed = allClaims.length;
      const mealsDistributed = allClaims.reduce(
        (s, c) => s + ((c.donations as any)?.meals_equivalent ?? 0),
        0
      );

      // Available nearby — all available donations
      const { count: availableCount } = await supabase
        .from("donations")
        .select("*", { count: "exact", head: true })
        .eq("status", "available");

      // Expiring soon — available donations expiring within 24h
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const { count: expiringCount } = await supabase
        .from("donations")
        .select("*", { count: "exact", head: true })
        .eq("status", "available")
        .lte("expiry_date", tomorrow.toISOString());

      return {
        foodClaimed,
        mealsDistributed,
        availableNearby: availableCount ?? 0,
        expiringSoon: expiringCount ?? 0,
      };
    },
  });
}

export function useDonationHistory() {
  return useQuery({
    queryKey: ["donation-history"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data } = await supabase
        .from("donations")
        .select("created_at, meals_equivalent, co2_saved_kg")
        .eq("donor_id", user.id)
        .order("created_at", { ascending: true })
        .limit(30);

      return (data ?? []).map((d) => ({
        date: new Date(d.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        meals: d.meals_equivalent,
        co2: Number(d.co2_saved_kg),
      }));
    },
  });
}

export function useClaimHistory() {
  return useQuery({
    queryKey: ["claim-history"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data } = await supabase
        .from("donation_claims")
        .select("created_at, donations(meals_equivalent)")
        .eq("ngo_id", user.id)
        .order("created_at", { ascending: true })
        .limit(30);

      return (data ?? []).map((c) => ({
        date: new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        claims: 1,
        meals: (c.donations as any)?.meals_equivalent ?? 0,
      }));
    },
  });
}

export function useActivityFeed() {
  return useQuery({
    queryKey: ["activity-feed"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data } = await supabase
        .from("activity_log")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      return data ?? [];
    },
  });
}
