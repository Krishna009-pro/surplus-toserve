import { RoutePlanner } from "@/components/logistics/RoutePlanner";

export default function Logistics() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Logistics Planning</h1>
                    <p className="text-muted-foreground mt-1">Optimize your collection routes with AI.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
                <div className="lg:col-span-2 h-full">
                    {/* Placeholder for map (future) or just the main route list view */}
                    <RoutePlanner />
                </div>
                <div className="space-y-6">
                    <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                        <h3 className="font-semibold mb-2">How it works</h3>
                        <p className="text-sm text-muted-foreground">
                            Our AI analyzes all available pickups and deliveries to create the most efficient route for you, saving time and fuel.
                        </p>
                        <ul className="text-sm text-muted-foreground mt-4 space-y-2 list-disc pl-4">
                            <li>Select "Find Best Route"</li>
                            <li>Follow the ordered stops</li>
                            <li>Mark stops as complete</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
