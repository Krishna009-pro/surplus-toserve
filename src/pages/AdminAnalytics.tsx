
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Users,
    Gift,
    CheckCircle,
    Package,
    TrendingUp,
    Loader2,
    ArrowUpRight,
    Leaf,
    Info
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie
} from "recharts";

import { useAdminStats } from "@/hooks/useDashboardData";

const AdminAnalytics = () => {
    const { data: stats, isLoading: loading } = useAdminStats();

    // Default stats to avoid undefined errors if data is not yet loaded
    const safeStats = stats || {
        totalUsers: 0,
        totalDonations: 0,
        activeListings: 0,
        completedDonations: 0,
        totalMeals: 0
    };

    const chartData = [
        { name: 'Available', value: safeStats.activeListings },
        { name: 'Claimed', value: safeStats.totalDonations - safeStats.activeListings - safeStats.completedDonations },
        { name: 'Completed', value: safeStats.completedDonations },
    ];

    const COLORS = ['#10b981', '#fbbf24', '#3b82f6'];

    if (loading) {
        return <div className="flex justify-center p-12"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
    }

    return (
        <div className="space-y-8 pb-12">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">System Analytics</h1>
                <p className="text-muted-foreground">Platform-wide overview of activity and impact.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Platform Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{safeStats.totalUsers}</div>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                            <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                            Growth +12% this month
                        </p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
                        <Gift className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{safeStats.totalDonations}</div>
                        <p className="text-xs text-muted-foreground mt-1">Created since launch</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Impact Made</CardTitle>
                        <Leaf className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{safeStats.totalMeals}</div>
                        <p className="text-xs text-muted-foreground mt-1">Meals served to community</p>
                    </CardContent>
                </Card>

                <Card className="bg-primary/5 shadow-sm border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                        <CheckCircle className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">
                            {safeStats.totalDonations > 0 ? ((safeStats.completedDonations / safeStats.totalDonations) * 100).toFixed(0) : 0}%
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Successfully delivered</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4 shadow-sm">
                    <CardHeader>
                        <CardTitle>Donation Status Distribution</CardTitle>
                        <CardDescription>Breakdown of food items across different states.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                <Tooltip
                                    cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                                    contentStyle={{
                                        borderRadius: '8px',
                                        border: '1px solid hsl(var(--border))',
                                        backgroundColor: 'hsl(var(--card))'
                                    }}
                                />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3 shadow-sm">
                    <CardHeader>
                        <CardTitle>Platform Health</CardTitle>
                        <CardDescription>Key sustainability metrics.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2">
                                    <Package className="h-4 w-4 text-muted-foreground" />
                                    Active Inventory
                                </span>
                                <span className="font-bold">{safeStats.activeListings} items</span>
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-green-500" style={{ width: `${(safeStats.activeListings / (safeStats.totalDonations || 1)) * 100}%` }} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2">
                                    <Info className="h-4 w-4 text-muted-foreground" />
                                    Response Time
                                </span>
                                <span className="font-bold">~45 mins</span>
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500" style={{ width: '85%' }} />
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-muted/40 border border-border/50">
                            <div className="flex items-start gap-3">
                                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                    <ArrowUpRight className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">Weekly Insight</p>
                                    <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                                        NGO activity has increased by 15% this week, mainly in the downtown region.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminAnalytics;
