import { useEffect, useState } from "react";
import { auth, db } from "@backend/firebase";
import { collection, query, where, orderBy, getDocs, doc, updateDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, MapPin, Package, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Donations() {
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDonations = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.warn("fetchDonations: No authenticated user found.");
        return;
      }

      console.log("Fetching donations for user:", user.uid);
      const q = query(
        collection(db, "donations"),
        where("donorId", "==", user.uid),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setDonations(data);
    } catch (error: any) {
      console.error("FIREBASE FETCH ERROR:", error);
      if (error.message?.includes("permissions")) {
        console.error("HINT: This usually means an ad-blocker is blocking firestore.googleapis.com or your firestore.rules need deployment.");
      }
      toast.error("Failed to fetch donations. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const handleCancelDonation = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this donation?")) return;
    try {
      const donationRef = doc(db, "donations", id);
      await updateDoc(donationRef, { status: "cancelled" });
      toast.success("Donation cancelled successfully.");
      fetchDonations();
    } catch (error: any) {
      toast.error("Failed to cancel donation: " + error.message);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">My Donations</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {donations.map((donation) => (
          <Card key={donation.id} className="overflow-hidden hover:shadow-lg transition-all border-l-4 border-l-primary group">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg line-clamp-1">{donation.foodItems}</CardTitle>
                <Badge variant={
                  donation.status === 'available' ? 'default' :
                    donation.status === 'claimed' ? 'secondary' : 'outline'
                }>
                  {donation.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center text-muted-foreground">
                <Package className="h-4 w-4 mr-2" />
                <span>{donation.quantity}</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <MapPin className="h-4 w-4 mr-2" />
                <span className="truncate">{donation.pickupAddress}</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Expires: {format(new Date(donation.expiryTime), 'PPp')}</span>
              </div>

              {donation.status === 'available' && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleCancelDonation(donation.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Cancel Donation
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
        {donations.length === 0 && (
          <div className="col-span-full text-center p-12 bg-muted/20 rounded-lg">
            <p className="text-muted-foreground">No donations found. Start donating today!</p>
          </div>
        )}
      </div>
    </div>
  );
}
