import { auth, db, storage } from "@backend/firebase";
import { doc, getDoc, collection, addDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
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
      let userData: any = {};
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        userData = userDoc.exists() ? userDoc.data() : {};
      } catch (profileErr) {
        console.warn("Could not fetch user profile (permission or missing doc):", profileErr);
        // We continue with empty userData - it shouldn't block the donation
      }
      const donorName = userData.organizationName || `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Anonymous';

      let imageUrl = "";

      if (imageFile) {
        let compressedFile: any = null;
        try {
          // Compress before upload
          const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1200,
            useWebWorker: true
          };
          compressedFile = await imageCompression(imageFile, options);

          // Generate a unique filename
          const fileExtension = imageFile.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
          const storageRef = ref(storage, `food-images/${user.uid}/${fileName}`);

          // Upload to Firebase Storage with a 3-second "Fail-Fast" timeout
          console.log("Uploading image to storage (3s timeout)...");

          const uploadTask = uploadBytesResumable(storageRef, compressedFile);

          // Create a promise that rejects after 3 seconds and CANCELS the task
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => {
              uploadTask.cancel(); // Stop background retries immediately
              reject(new Error("Storage Timeout"));
            }, 3000)
          );

          // Race the upload against the timeout
          await Promise.race([
            uploadTask,
            timeoutPromise
          ]);

          imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
          console.log("Image uploaded successfully:", imageUrl);
        } catch (error: any) {
          console.error("STORAGE ERROR OR TIMEOUT:", error.message);
          console.warn("Switching to Safe Mode Fallback immediately...");
          try {
            // Fallback: Convert the compressed file to Base64 for direct Firestore storage
            imageUrl = await blobToBase64(compressedFile);
            console.log("Image converted to Base64 (Size: " + Math.round(imageUrl.length / 1024) + " KB)");
            toast.info("Using Safe Mode (Local Storage).");
          } catch (fallbackErr) {
            console.error("Base64 fallback also failed:", fallbackErr);
            toast.error("Failed to process image. Continuing without it.");
          }
        }
      }

      console.log("Saving donation to database...");
      const docRef = await addDoc(collection(db, "donations"), {
        donorId: user.uid,
        donorName,
        foodItems,
        quantity,
        pickupAddress,
        expiryTime: new Date(expiryTime).toISOString(),
        status: 'available',
        imageUrl,
        createdAt: new Date().toISOString()
      });

      console.log("Donation successfully saved with ID:", docRef.id);
      toast.success("Donation created successfully!");
      navigate("/donations");
    } catch (error: any) {
      console.error("CRITICAL ERROR DURING DONATION:", error);
      if (error.message?.includes("permission")) {
        console.error("HINT: If you just registered, your profile 'Write' might have been blocked by an ad-blocker. Try refreshing or disabling ad-blockers.");
      }
      toast.error(`Submission failed: ${error.message}`);
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
              <p className="text-xs text-muted-foreground">Image will be stored in Firebase Storage.</p>
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
