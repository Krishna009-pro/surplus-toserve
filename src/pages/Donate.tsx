import { auth, db } from "@backend/firebase";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import imageCompression from 'browser-image-compression';
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// Helper to convert Blob/File to Base64 string
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export default function Donate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [foodItems, setFoodItems] = useState("");
  const [quantity, setQuantity] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [expiryTime, setExpiryTime] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      // Fetch user profile to get organization name
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.exists() ? userDoc.data() : {};
      const donorName = userData.organizationName || `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Anonymous';

      let imageUrl = "";

      if (imageFile) {
        try {
          // Strict compression for Firestore limit (1MB max doc size)
          const options = {
            maxSizeMB: 0.6,
            maxWidthOrHeight: 800,
            useWebWorker: true
          };
          const compressedFile = await imageCompression(imageFile, options);
          imageUrl = await blobToBase64(compressedFile);
        } catch (error) {
          console.error("Image processing error:", error);
          toast.error("Failed to process image. Try a smaller one.");
          setLoading(false);
          return;
        }
      }

      await addDoc(collection(db, "donations"), {
        donorId: user.uid,
        donorName, // Save denormalized data
        foodItems,
        quantity,
        pickupAddress,
        expiryTime: new Date(expiryTime).toISOString(),
        status: 'available',
        imageUrl, // Saving Base64 string directly
        createdAt: new Date().toISOString()
      });

      toast.success("Donation created successfully!");
      navigate("/donations");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Donate Food</CardTitle>
          <CardDescription>
            List your surplus food details below. NGOs in the area will be notified.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="foodItems">Food Items</Label>
              <Textarea
                id="foodItems"
                placeholder="E.g. 5kg Rice, 20 servings of Pasta, 10 loaves of bread..."
                required
                value={foodItems}
                onChange={(e) => setFoodItems(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity (approx)</Label>
                <Input
                  id="quantity"
                  placeholder="e.g. 20 meals, 5kg"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiryTime">Expiry Time</Label>
                <Input
                  id="expiryTime"
                  type="datetime-local"
                  required
                  value={expiryTime}
                  onChange={(e) => setExpiryTime(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pickupAddress">Pickup Address</Label>
              <Input
                id="pickupAddress"
                placeholder="Full address for pickup"
                required
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Food Image</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0] || null;
                  if (file) {
                    setImageFile(file);
                  } else {
                    setImageFile(null);
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">Image will be stored directly in the database.</p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Publish Donation
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
