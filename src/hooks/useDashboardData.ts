import { useQuery } from "@tanstack/react-query";
import { auth, db } from "@backend/firebase";
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit, getCountFromServer } from "firebase/firestore";

export type UserRole = "donor" | "ngo" | "admin" | null;

export function useUserRole() {
    return useQuery({
        queryKey: ["user-role"],
        queryFn: async () => {
            const user = auth.currentUser;
            if (!user) return null;

            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (!userDoc.exists()) return null;

            return userDoc.data().role as UserRole ?? null;
        },
    });
}

export function useProfile() {
    return useQuery({
        queryKey: ["profile"],
        queryFn: async () => {
            const user = auth.currentUser;
            if (!user) return null;

            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (!userDoc.exists()) return null;

            const data = userDoc.data();
            return {
                ...data,
                display_name: data.organizationName || `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'User'
            };
        },
    });
}

export function useDonorStats(enabled: boolean = true) {
    return useQuery({
        queryKey: ["donor-stats"],
        enabled,
        queryFn: async () => {
            const user = auth.currentUser;
            if (!user) return null;

            const q = query(collection(db, "donations"), where("donorId", "==", user.uid));
            const snapshot = await getDocs(q);
            const donations = snapshot.docs.map(d => d.data());

            const totalDonations = donations.length;
            const mealsSaved = donations.reduce((s, d) => s + (parseInt(d.quantity) || 1), 0);
            const co2Reduced = mealsSaved * 2.5;
            const activeListings = donations.filter((d) => d.status === "available").length;

            // Status distribution for Pie Chart
            const statusDistribution = [
                { name: "Available", value: activeListings, color: "#10b981" }, // emerald-500
                { name: "Claimed", value: donations.filter(d => d.status === "claimed").length, color: "#3b82f6" }, // blue-500
                { name: "Completed", value: donations.filter(d => d.status === "completed").length, color: "#6b7280" } // gray-500
            ].filter(i => i.value > 0);

            return { totalDonations, mealsSaved, co2Reduced, activeListings, statusDistribution };
        },
    });
}

export function useNgoStats(enabled: boolean = true) {
    return useQuery({
        queryKey: ["ngo-stats"],
        enabled,
        queryFn: async () => {
            const user = auth.currentUser;
            if (!user) return null;

            const claimsQ = query(collection(db, "donations"), where("claimedBy", "==", user.uid));
            const claimsSnapshot = await getDocs(claimsQ);
            const claims = claimsSnapshot.docs.map(d => d.data());

            const foodClaimed = claims.length;
            const mealsDistributed = claims.reduce((s, c) => s + (parseInt(c.quantity) || 1), 0);

            const availableQ = query(collection(db, "donations"), where("status", "==", "available"));
            const availableSnapshot = await getDocs(availableQ);
            const availableCount = availableSnapshot.size;

            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const expiringSoon = availableSnapshot.docs.filter(d => {
                return d.data().expiryTime <= tomorrow.toISOString();
            }).length;

            return {
                foodClaimed,
                mealsDistributed,
                availableNearby: availableCount,
                expiringSoon,
            };
        },
    });
}

export function useAdminStats(enabled: boolean = true) {
    return useQuery({
        queryKey: ["admin-stats"],
        enabled,
        queryFn: async () => {
            try {
                const user = auth.currentUser;
                if (!user) return null;

                // Client-side role check (Defense in Depth)
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.data()?.role !== 'admin') {
                    console.error("Unauthorized attempt to access Admin Stats");
                    throw new Error("Unauthorized: Admin access required.");
                }

                // Aggregation queries - much faster than fetching all docs
                const usersColl = collection(db, "users");
                const donationsColl = collection(db, "donations");

                const [
                    totalUsersSnap,
                    totalDonationsSnap,
                    activeListingsSnap,
                    completedDonationsSnap,
                    donorCountSnap,
                    ngoCountSnap
                ] = await Promise.all([
                    getCountFromServer(usersColl),
                    getCountFromServer(donationsColl),
                    getCountFromServer(query(donationsColl, where("status", "==", "available"))),
                    getCountFromServer(query(donationsColl, where("status", "==", "completed"))),
                    getCountFromServer(query(usersColl, where("role", "==", "donor"))),
                    getCountFromServer(query(usersColl, where("role", "==", "ngo")))
                ]);

                const totalUsers = totalUsersSnap.data().count;
                const totalDonations = totalDonationsSnap.data().count;
                const activeListings = activeListingsSnap.data().count;
                const completedDonations = completedDonationsSnap.data().count;
                const donorCount = donorCountSnap.data().count;
                const ngoCount = ngoCountSnap.data().count;

                const roleDistribution = [
                    { name: "Donors", value: donorCount, color: "#10b981" },
                    { name: "NGOs", value: ngoCount, color: "#3b82f6" },
                    { name: "Admins", value: Math.max(0, totalUsers - donorCount - ngoCount), color: "#6366f1" }
                ].filter(i => i.value > 0);

                return {
                    totalUsers,
                    totalDonations,
                    activeListings,
                    completedDonations,
                    totalMeals: completedDonations * 10,
                    roleDistribution
                };
            } catch (error: any) {
                console.error("ADMIN STATS ERROR:", error);
                if (error.message?.includes("permissions")) {
                    console.error("HINT: Ensure the admin user has permission to read the users and donations collections.");
                }
                throw error;
            }
        },
    });
}

export function useRecentTransactions(enabled: boolean = true) {
    return useQuery({
        queryKey: ["recent-transactions"],
        enabled,
        queryFn: async () => {
            const user = auth.currentUser;
            if (!user) return [];

            // Get user role to determine what to show
            const userDoc = await getDoc(doc(db, "users", user.uid));
            const role = userDoc.data()?.role;

            let q;
            if (role === 'donor') {
                q = query(collection(db, "donations"), where("donorId", "==", user.uid), orderBy("createdAt", "desc"), limit(5));
            } else if (role === 'ngo') {
                q = query(collection(db, "donations"), where("claimedBy", "==", user.uid), orderBy("createdAt", "desc"), limit(5));
            } else {
                q = query(collection(db, "donations"), orderBy("createdAt", "desc"), limit(5));
            }

            const snapshot = await getDocs(q);
            return snapshot.docs.map(d => {
                const data = d.data() as any;
                let dateStr = 'N/A';

                if (data.createdAt) {
                    if (typeof data.createdAt === 'string') {
                        dateStr = new Date(data.createdAt).toLocaleDateString();
                    } else if (data.createdAt.seconds) {
                        dateStr = new Date(data.createdAt.seconds * 1000).toLocaleDateString();
                    }
                }

                return {
                    id: d.id,
                    ...data,
                    date: dateStr
                };
            });
        }
    });
}

export function useSystemHistory(enabled: boolean = true) {
    return useQuery({
        queryKey: ["system-history"],
        enabled,
        queryFn: async () => {
            const q = query(
                collection(db, "donations"),
                orderBy("createdAt", "asc"),
                limit(30)
            );
            const snapshot = await getDocs(q);

            return snapshot.docs.map((d) => ({
                date: new Date(d.data().createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                meals: parseInt(d.data().quantity) || 1,
            }));
        },
    });
}

export function useDonationHistory(enabled: boolean = true) {
    return useQuery({
        queryKey: ["donation-history"],
        enabled,
        queryFn: async () => {
            const user = auth.currentUser;
            if (!user) return [];

            // OPTIMIZATION: Query 'desc' (reusing Recent Activity index) and reverse in memory
            // This avoids needing a separate ASC index just for the chart.
            const q = query(
                collection(db, "donations"),
                where("donorId", "==", user.uid),
                orderBy("createdAt", "desc"),
                limit(30)
            );

            const snapshot = await getDocs(q);

            const data = snapshot.docs.map((d) => ({
                date: new Date(d.data().createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                meals: parseInt(d.data().quantity) || 1,
            }));

            return data.reverse(); // Reverse to show chronological order for chart
        },
    });
}

export function useClaimHistory(enabled: boolean = true) {
    return useQuery({
        queryKey: ["claim-history"],
        enabled,
        queryFn: async () => {
            const user = auth.currentUser;
            if (!user) return [];

            // OPTIMIZATION: Query 'desc' and reverse in memory
            const q = query(
                collection(db, "donations"),
                where("claimedBy", "==", user.uid),
                orderBy("createdAt", "desc"),
                limit(30)
            );

            const snapshot = await getDocs(q);

            const data = snapshot.docs.map((c) => ({
                date: new Date(c.data().createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                claims: 1,
                meals: parseInt(c.data().quantity) || 1,
            }));

            return data.reverse();
        },
    });
}

export function useActivityFeed(enabled: boolean = true) {
    return useQuery({
        queryKey: ["activity-feed"],
        enabled,
        queryFn: async () => {
            const user = auth.currentUser;
            if (!user) return [];

            // Get user role to determine what to show
            const userDoc = await getDoc(doc(db, "users", user.uid));
            const role = userDoc.data()?.role;

            let donorQ, claimQ;

            if (role === 'admin') {
                // Admin sees ALL recent activity
                donorQ = query(
                    collection(db, "donations"),
                    orderBy("createdAt", "desc"),
                    limit(10)
                );
                claimQ = query(
                    collection(db, "donations"),
                    where("status", "==", "claimed"),
                    orderBy("createdAt", "desc"),
                    limit(10)
                );
            } else {
                // Normal users see their own activity
                donorQ = query(
                    collection(db, "donations"),
                    where("donorId", "==", user.uid),
                    orderBy("createdAt", "desc"),
                    limit(10)
                );

                claimQ = query(
                    collection(db, "donations"),
                    where("claimedBy", "==", user.uid),
                    orderBy("createdAt", "desc"),
                    limit(10)
                );
            }

            // OPTIMIZATION: Use allSettled to allow partial data if one index is missing
            const results = await Promise.allSettled([getDocs(donorQ), getDocs(claimQ)]);

            const donorDocs = results[0].status === 'fulfilled' ? results[0].value.docs : [];
            const claimDocs = results[1].status === 'fulfilled' ? results[1].value.docs : [];

            if (results[0].status === 'rejected') console.warn("Donor feed query failed (check index):", results[0].reason);
            if (results[1].status === 'rejected') console.warn("Claim feed query failed (check index):", results[1].reason);

            const allDocs = [
                ...donorDocs.map(d => ({ ...(d.data() as any), id: d.id })),
                ...claimDocs.map(d => ({ ...(d.data() as any), id: d.id }))
            ];

            // Sort merged results
            allDocs.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            return allDocs.slice(0, 10).map((d: any) => ({
                id: d.id,
                event_type: d.donorId === user.uid ? 'donation_posted' : 'donation_claimed',
                description: d.donorId === user.uid
                    ? `You posted a donation of ${d.quantity} ${d.foodItems}`
                    : `You claimed a donation of ${d.quantity} ${d.foodItems}`,
                created_at: d.createdAt
            }));
        },
    });
}
