import { useEffect, useState } from "react";
import { auth, db } from "@backend/firebase";
import { collection, query, where, orderBy, getDocs, doc, updateDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, MapPin, Package, CheckCircle, ArrowRight, Smartphone } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function Claims() {
  const navigate = useNavigate();
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClaims = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, "donations"),
        where("claimedBy", "==", user.uid),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setClaims(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const handleMarkCompleted = async (id: string) => {
    try {
      const donationRef = doc(db, "donations", id);
      await updateDoc(donationRef, { status: "completed" });

      toast.success("Marked as collected & completed!");
      fetchClaims();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleCancelClaim = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this claim? It will be made available to others.")) return;
    try {
      const donationRef = doc(db, "donations", id);
      await updateDoc(donationRef, {
        status: "available",
        claimedBy: null
      });

      toast.success("Claim cancelled. Item is available again.");
      fetchClaims();
    } catch (error: any) {
      toast.error("Failed to cancel claim: " + error.message);
    }
  };

  const getGoogleMapsUrl = (address: string) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Logistics & Claims</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {claims.map((claim) => (
          <Card key={claim.id} className={`overflow-hidden transition-all shadow-md group ${claim.status === 'completed' ? 'opacity-70 bg-muted/20' : 'border-primary shadow-primary/10'}`}>
            <CardHeader className="pb-3 border-b border-border/50">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">{claim.foodItems}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1 font-medium">Donor: {claim.donorName || "Unknown"}</p>
                </div>
                <Badge variant={claim.status === 'completed' ? 'secondary' : 'default'} className="uppercase text-[10px] font-bold tracking-wider">
                  {claim.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 rounded-lg bg-muted/30">
                  <span className="font-semibold block mb-1 text-xs text-muted-foreground uppercase">Quantity</span>
                  <div className="flex items-center font-medium">
                    <Package className="h-4 w-4 mr-2 text-primary" />
                    {claim.quantity}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <span className="font-semibold block mb-1 text-xs text-muted-foreground uppercase">Expires</span>
                  <div className="flex items-center font-medium">
                    <Calendar className="h-4 w-4 mr-2 text-primary" />
                    {format(new Date(claim.expiryTime), 'MMM d, h:mm a')}
                  </div>
                </div>
              </div>

              <div className="text-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold block text-xs text-muted-foreground uppercase">Pickup Location</span>
                  <a
                    href={getGoogleMapsUrl(claim.pickupAddress)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-primary hover:underline font-bold flex items-center"
                  >
                    OPEN IN GOOGLE MAPS <ArrowRight className="h-3 w-3 ml-1" />
                  </a>
                </div>
                <div className="flex items-start text-muted-foreground bg-muted p-3 rounded-md border border-border/50">
                  <MapPin className="h-4 w-4 mr-2 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{claim.pickupAddress}</span>
                </div>
              </div>

              {/* Phone display removed for now as it requires profile fetch */}

              {claim.status === 'claimed' && (
                <div className="flex gap-3 mt-4">
                  <Button className="flex-1 shadow-lg shadow-primary/20" onClick={() => handleMarkCompleted(claim.id)}>
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Complete
                  </Button>
                  <Button variant="outline" className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => handleCancelClaim(claim.id)}>
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {claims.length === 0 && (
          <div className="col-span-full text-center p-20 bg-muted/20 rounded-2xl border border-dashed">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-20" />
            <h3 className="text-xl font-semibold">No claims yet</h3>
            <p className="text-muted-foreground mt-2">Start browsing the marketplace to help reduce waste.</p>
            <Button className="mt-6" variant="outline" onClick={() => navigate("/available-food")}>
              Browse Marketplace
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
