import { useEffect, useState } from "react";
import { auth, db } from "@backend/firebase";
import { collection, query, where, orderBy, getDocs, doc, updateDoc, limit, startAfter } from "firebase/firestore";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, MapPin, Package, Check, Search, Filter } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input as SearchInput } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AvailableFood() {
  const [donations, setDonations] = useState<any[]>([]);
  const [filteredDonations, setFilteredDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);

  /* Pagination State */
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  const fetchDonations = async (isLoadMore = false) => {
    try {
      if (!isLoadMore) setLoading(true);
      else setLoadingMore(true);

      let q = query(
        collection(db, "donations"),
        where("status", "==", "available"),
        limit(10)
      );

      if (isLoadMore && lastVisible) {
        q = query(q, startAfter(lastVisible));
      }

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Client-side filtering for expiry to be safe/simple
      const now = new Date().toISOString();
      const validDonations = data.filter((d: any) => d.expiryTime > now);

      if (snapshot.docs.length < 10) setHasMore(false);
      else setHasMore(true);

      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);

      if (isLoadMore) {
        setDonations(prev => [...prev, ...validDonations]);
        setFilteredDonations(prev => [...prev, ...validDonations]);
      } else {
        setDonations(validDonations);
        setFilteredDonations(validDonations);
      }

      setLoading(false);
      setLoadingMore(false);
    } catch (error: any) {
      console.error("Error fetching available food:", error);
      if (error.message?.includes("permissions")) {
        console.error("HINT: This usually means an ad-blocker is blocking firestore.googleapis.com or your firestore.rules need deployment.");
      }
      toast.error("Failed to fetch available food. Check console for details.");
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  useEffect(() => {
    const filtered = donations.filter(donation => {
      const matchesSearch = donation.foodItems.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (donation.donorName || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLocation = donation.pickupAddress.toLowerCase().includes(locationFilter.toLowerCase());
      return matchesSearch && matchesLocation;
    });
    setFilteredDonations(filtered);
  }, [searchQuery, locationFilter, donations]);

  const handleClaim = async (id: string) => {
    setClaiming(id);
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Strict Expiry Check
      const donation = donations.find(d => d.id === id);
      if (donation && new Date(donation.expiryTime) < new Date()) {
        toast.error("This item has expired and cannot be claimed.");
        return;
      }

      const donationRef = doc(db, "donations", id);
      await updateDoc(donationRef, {
        status: 'claimed',
        claimedBy: user.uid
      });

      toast.success("Donation claimed successfully!");
      fetchDonations(); // Refresh list
    } catch (error: any) {
      toast.error("Failed to claim donation: " + error.message);
    } finally {
      setClaiming(null);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Available Food Marketplace</h1>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-card p-4 rounded-xl border border-border/50 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <SearchInput
            placeholder="Search by food or donor name..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <SearchInput
            placeholder="Filter by location/area..."
            className="pl-10"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredDonations.map((donation) => (
          <Card key={donation.id} className="overflow-hidden hover:shadow-xl transition-all border border-border/50 h-full flex flex-col group">
            {donation.imageUrl ? (
              <div className="h-48 w-full overflow-hidden">
                <img
                  src={donation.imageUrl}
                  alt={donation.foodItems}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
            ) : (
              <div className="h-48 w-full bg-primary/5 flex items-center justify-center">
                <Package className="h-12 w-12 text-primary/20" />
              </div>
            )}
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start mb-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Available</Badge>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(donation.createdAt), 'MMM d')}
                </span>
              </div>
              <CardTitle className="text-xl line-clamp-1">{donation.foodItems}</CardTitle>
              <div className="text-sm text-primary font-medium mt-1">
                From: {donation.donorName || "Anonymous Donor"}
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-sm flex-1">
              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block text-foreground">Quantity</span>
                  <span className="text-muted-foreground">{donation.quantity}</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block text-foreground">Pickup Location</span>
                  <span className="text-muted-foreground truncate max-w-[200px] block">{donation.pickupAddress}</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block text-foreground">Expires At</span>
                  <span className="text-muted-foreground">{format(new Date(donation.expiryTime), 'PPp')}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 pt-4 border-t border-border/50">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="w-full" size="lg" disabled={!!claiming}>
                    {claiming === donation.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                    Claim Donation
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Claim</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to claim this donation? By claiming, you commit to picking it up before the expiry time.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleClaim(donation.id)}>Confirm Claim</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        ))}
        {filteredDonations.length === 0 && !loading && (
          <div className="col-span-full text-center p-20 bg-muted/20 rounded-2xl border border-dashed border-border/50">
            <Filter className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-20" />
            <h3 className="text-xl font-semibold">No donations found</h3>
            <p className="text-muted-foreground mt-2">Try adjusting your filters or check back later.</p>
            <Button variant="link" onClick={() => { setSearchQuery(""); setLocationFilter(""); }} className="mt-4">
              Clear all filters
            </Button>
          </div>
        )}
      </div>

      {hasMore && !searchQuery && !locationFilter && (
        <div className="flex justify-center pt-8">
          <Button variant="outline" size="lg" onClick={() => fetchDonations(true)} disabled={loadingMore}>
            {loadingMore ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
