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
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";

interface Transaction {
    id: string;
    foodItems?: string;
    quantity?: string;
    donorName?: string;
    status?: string;
    date: string;
    [key: string]: any;
}

interface RecentTransactionsProps {
    role: "donor" | "ngo" | "admin" | null;
    data: Transaction[];
}

export function RecentTransactions({ role, data }: RecentTransactionsProps) {
    if (!data) data = [];

    return (
        <Card className="col-span-1 lg:col-span-2 h-full">
            <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
                {data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                        <ArrowUpRight className="w-8 h-8 mb-2 opacity-40" />
                        <p className="text-sm">No recent transactions</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Type</TableHead>
                                <TableHead>Details</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {role === "donor" ? (
                                                <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                                            ) : (
                                                <ArrowDownLeft className="h-4 w-4 text-blue-500" />
                                            )}
                                            <span className="font-medium">
                                                {role === "donor" ? "Donation" : role === "ngo" ? "Claim" : "Activity"}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{item.foodItems || "N/A"}</span>
                                            <span className="text-xs text-muted-foreground">
                                                Qty: {item.quantity || "N/A"}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{item.date}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                item.status === "available"
                                                    ? "default"
                                                    : item.status === "claimed"
                                                        ? "secondary"
                                                        : "outline"
                                            }
                                            className={
                                                item.status === "available"
                                                    ? "bg-green-500 hover:bg-green-600"
                                                    : item.status === "claimed"
                                                        ? "bg-blue-500 hover:bg-blue-600 text-white"
                                                        : ""
                                            }
                                        >
                                            {item.status || "Unknown"}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
