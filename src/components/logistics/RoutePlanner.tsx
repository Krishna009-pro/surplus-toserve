import { useState, useEffect } from 'react';
import { getOptimizedRoute, VolunteerRouteOptimizationInput, OptimizedRoute } from '@/lib/gemini';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Route as RouteIcon, Check, Circle, Building, HandHeart } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

// --- Mock Data (Replace with Firestore data later) ---
const VOLUNTEER_START_LOCATION = {
    latitude: 37.7749, // San Francisco City Hall
    longitude: -122.4194,
};

const DONORS = [
    { id: 'donor-1', name: 'The Ritz-Carlton', latitude: 37.7919, longitude: -122.4063, type: 'donor' as const },
    { id: 'donor-2', name: 'Marriott Marquis', latitude: 37.7846, longitude: -122.4039, type: 'donor' as const },
    { id: 'donor-3', name: 'Hilton Union Square', latitude: 37.786, longitude: -122.410, type: 'donor' as const },
];

const NGOS = [
    { id: 'ngo-1', name: 'SF-Marin Food Bank', latitude: 37.747, longitude: -122.422, type: 'ngo' as const },
    { id: 'ngo-2', name: 'Glide Memorial', latitude: 37.785, longitude: -122.413, type: 'ngo' as const },
];

export function RoutePlanner() {
    const [optimizedRoute, setOptimizedRoute] = useState<OptimizedRoute | null>(null);
    const [completedStops, setCompletedStops] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleOptimizeRoute = async () => {
        setIsLoading(true);
        try {
            const input: VolunteerRouteOptimizationInput = {
                volunteerCurrentLocation: VOLUNTEER_START_LOCATION,
                donorLocations: DONORS,
                ngoLocations: NGOS,
                availableTransport: 'car',
            };

            const result = await getOptimizedRoute(input);

            if (result.error) {
                toast.error(result.error);
                setOptimizedRoute(null);
            } else if (result.data) {
                setOptimizedRoute(result.data);
                setCompletedStops([]);
                toast.success("Route optimized successfully!");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate route");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleStopCompletion = (stopId: string) => {
        setCompletedStops(prev =>
            prev.includes(stopId)
                ? prev.filter(id => id !== stopId)
                : [...prev, stopId]
        );
    };

    const mapApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    return (
        <div className="h-full flex flex-col gap-6">
            <APIProvider apiKey={mapApiKey}>
                <div className="grid lg:grid-cols-2 gap-6 h-[600px]">
                    {/* Left Column: Controls & List */}
                    <div className="flex flex-col gap-6 h-full overflow-hidden">
                        <Card className="border-border/50 shadow-sm relative overflow-hidden flex-shrink-0">
                            <div className="absolute top-0 left-0 w-1 h-full bg-primary/20" />
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 font-headline">
                                    <RouteIcon className="w-5 h-5 text-primary" />
                                    AI Route Optimizer
                                </CardTitle>
                                <CardDescription>
                                    Generate the most efficient path for pickup and delivery.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button
                                    onClick={handleOptimizeRoute}
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 shadow-md hover:shadow-lg"
                                    size="lg"
                                >
                                    {(isLoading) ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Optimizing Route...
                                        </>
                                    ) : (
                                        <>
                                            {optimizedRoute ? 'Recalculate Optimal Route' : 'Find Best Route with AI'}
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>

                        <ScrollArea className="h-full pr-4">
                            {isLoading && (
                                <Card className="animate-pulse border-border/50">
                                    <CardHeader>
                                        <CardTitle className="font-headline text-lg">Calculating Best Route...</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="flex items-center space-x-4">
                                                <Skeleton className="h-10 w-10 rounded-full" />
                                                <div className="space-y-2 flex-1">
                                                    <Skeleton className="h-4 w-3/4" />
                                                    <Skeleton className="h-3 w-1/2" />
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            )}

                            {optimizedRoute && !isLoading && (
                                <Card className="border-border/50 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <CardHeader className="pb-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="font-headline text-lg">Your Optimized Route</CardTitle>
                                                <CardDescription className="mt-1">{optimizedRoute.routeSummary}</CardDescription>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                            <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
                                                {optimizedRoute.estimatedTotalDistanceKm.toFixed(1)} km
                                            </Badge>
                                            <Badge variant="secondary" className="bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200">
                                                ~{Math.round(optimizedRoute.estimatedTotalDurationMinutes)} min
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2 relative">
                                            <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-border/50 -z-10" />

                                            {optimizedRoute.optimizedStopOrder.map((stop, index) => {
                                                const isCompleted = completedStops.includes(stop.id);
                                                return (
                                                    <li key={stop.id} className="group">
                                                        <button
                                                            onClick={() => toggleStopCompletion(stop.id)}
                                                            className={cn(
                                                                "w-full p-3 rounded-lg flex items-center gap-4 text-left transition-all duration-200 border border-transparent",
                                                                isCompleted
                                                                    ? "bg-muted/50 text-muted-foreground scale-[0.99]"
                                                                    : "bg-card hover:bg-accent hover:border-border hover:shadow-sm"
                                                            )}
                                                        >
                                                            <div className="flex-shrink-0 z-10 bg-background rounded-full p-0.5">
                                                                {isCompleted ? (
                                                                    <div className="bg-primary/20 text-primary rounded-full p-1">
                                                                        <Check className="h-4 w-4" />
                                                                    </div>
                                                                ) : (
                                                                    <div className="bg-muted text-muted-foreground rounded-full p-1 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                                        <Circle className="h-4 w-4" />
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className={cn(
                                                                "flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center transition-colors",
                                                                stop.type === 'donor'
                                                                    ? "bg-green-50 text-green-600"
                                                                    : "bg-orange-50 text-orange-600"
                                                            )}>
                                                                {stop.type === 'donor' ? <Building className="w-5 h-5" /> : <HandHeart className="w-5 h-5" />}
                                                            </div>

                                                            <div className="flex-grow min-w-0">
                                                                <p className={cn("font-semibold text-sm truncate", isCompleted && "line-through")}>
                                                                    {stop.name}
                                                                </p>
                                                                <div className="flex items-center gap-2">
                                                                    <Badge variant="outline" className={cn(
                                                                        "text-[10px] h-5 px-1.5 capitalize font-normal",
                                                                        stop.type === 'donor' ? "border-green-200 text-green-700 bg-green-50/50" : "border-orange-200 text-orange-700 bg-orange-50/50"
                                                                    )}>
                                                                        {stop.type === 'donor' ? 'Pickup' : 'Delivery'}
                                                                    </Badge>
                                                                    {index === 0 && <span className="text-xs text-muted-foreground">Start here</span>}
                                                                </div>
                                                            </div>
                                                        </button>
                                                    </li>
                                                )
                                            })}
                                        </ul>
                                    </CardContent>
                                </Card>
                            )}
                        </ScrollArea>
                    </div>

                    {/* Right Column: Google Map */}
                    <div className="h-full rounded-xl overflow-hidden border border-border shadow-sm min-h-[400px]">
                        <Map
                            defaultCenter={{ lat: 37.7749, lng: -122.4194 }}
                            defaultZoom={13}
                            mapId="DEMO_MAP_ID"
                            gestureHandling={'greedy'}
                            className="w-full h-full"
                        >
                            {/* Volunteer Start Marker */}
                            <AdvancedMarker position={{ lat: VOLUNTEER_START_LOCATION.latitude, lng: VOLUNTEER_START_LOCATION.longitude }}>
                                <Pin background={'#0f172a'} glyphColor={'white'} borderColor={'#000'} />
                            </AdvancedMarker>

                            {/* Donor Markers */}
                            {DONORS.map(d => (
                                <AdvancedMarker key={d.id} position={{ lat: d.latitude, lng: d.longitude }}>
                                    <Pin background={'#22c55e'} glyphColor={'white'} borderColor={'#15803d'} />
                                </AdvancedMarker>
                            ))}

                            {/* NGO Markers */}
                            {NGOS.map(n => (
                                <AdvancedMarker key={n.id} position={{ lat: n.latitude, lng: n.longitude }}>
                                    <Pin background={'#f97316'} glyphColor={'white'} borderColor={'#c2410c'} />
                                </AdvancedMarker>
                            ))}
                        </Map>
                    </div>
                </div>
            </APIProvider>

            <div className="grid md:grid-cols-2 gap-6 pt-4">
                <Card className="border-border/50 bg-green-50/30">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
                            <Building className="h-4 w-4" /> Available Donors
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {DONORS.map(donor => (
                            <div key={donor.id} className="flex items-center gap-3 p-2 rounded-md bg-background/50 border border-green-100">
                                <span className="text-sm font-medium">{donor.name}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
                <Card className="border-border/50 bg-orange-50/30">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-orange-800 flex items-center gap-2">
                            <HandHeart className="h-4 w-4" /> Recipient NGOs
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {NGOS.map(ngo => (
                            <div key={ngo.id} className="flex items-center gap-3 p-2 rounded-md bg-background/50 border border-orange-100">
                                <span className="text-sm font-medium">{ngo.name}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
