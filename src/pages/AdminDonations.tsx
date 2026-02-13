import { useEffect, useState } from "react";
import { db } from "@backend/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

interface Donation {
    id: string;
    donorName: string;
    foodItems: string;
    quantity: string;
    status: "available" | "claimed" | "completed";
    createdAt: any;
    pickupAddress: string;
}

export default function AdminDonations() {
    const [donations, setDonations] = useState<Donation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDonations = async () => {
            try {
                const q = query(collection(db, "donations"), orderBy("createdAt", "desc"));
                const querySnapshot = await getDocs(q);
                const donationsData = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Donation[];
                setDonations(donationsData);
            } catch (error) {
                console.error("Error fetching donations:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDonations();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">All Donations</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Donation Management</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Dates</TableHead>
                                <TableHead>Donor</TableHead>
                                <TableHead>Items</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Address</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {donations.map((donation) => (
                                <TableRow key={donation.id}>
                                    <TableCell>
                                        {donation.createdAt?.seconds
                                            ? format(new Date(donation.createdAt.seconds * 1000), "PP")
                                            : "N/A"}
                                    </TableCell>
                                    <TableCell className="font-medium">{donation.donorName}</TableCell>
                                    <TableCell>{donation.foodItems}</TableCell>
                                    <TableCell>{donation.quantity}</TableCell>
                                    <TableCell className="max-w-[200px] truncate" title={donation.pickupAddress}>
                                        {donation.pickupAddress}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                donation.status === "available"
                                                    ? "default"
                                                    : donation.status === "completed"
                                                        ? "secondary"
                                                        : "outline"
                                            }
                                            className={
                                                donation.status === "available"
                                                    ? "bg-green-500 hover:bg-green-600"
                                                    : donation.status === "claimed"
                                                        ? "bg-blue-500 hover:bg-blue-600 text-white"
                                                        : "bg-gray-500 text-white"
                                            }
                                        >
                                            {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {donations.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No donations found in the system.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
