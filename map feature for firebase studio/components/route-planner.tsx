'use client';
import { useTransition } from 'react';
import { getOptimizedRoute } from '@/app/actions';
import { DONORS, NGOS, VOLUNTEER_START_LOCATION } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, Check, Circle, HeartHandshake, Loader, Route, RouteIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { OptimizedRoute } from '@/lib/types';
import { Skeleton } from './ui/skeleton';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';

type RoutePlannerProps = {
  setOptimizedRoute: (route: OptimizedRoute | null) => void;
  completedStops: string[];
  setCompletedStops: (stops: string[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  optimizedRoute: OptimizedRoute | null;
};

export default function RoutePlanner({
  setOptimizedRoute,
  completedStops,
  setCompletedStops,
  isLoading,
  setIsLoading,
  optimizedRoute
}: RoutePlannerProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleOptimizeRoute = () => {
    setIsLoading(true);
    startTransition(async () => {
      const input = {
        volunteerCurrentLocation: VOLUNTEER_START_LOCATION,
        donorLocations: DONORS,
        ngoLocations: NGOS,
        availableTransport: 'car' as const,
      };
      const result = await getOptimizedRoute(input);
      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        });
        setOptimizedRoute(null);
      } else if (result.data) {
        setOptimizedRoute(result.data);
        setCompletedStops([]);
      }
      setIsLoading(false);
    });
  };

  const toggleStopCompletion = (stopId: string) => {
    setCompletedStops(
      completedStops.includes(stopId)
        ? completedStops.filter(id => id !== stopId)
        : [...completedStops, stopId]
    );
  };
  
  return (
    <ScrollArea className="h-full">
        <div className="p-4 flex flex-col gap-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline">
                        <RouteIcon className="w-5 h-5 text-primary" />
                        Route Planner
                    </CardTitle>
                    <CardDescription>
                        Generate an optimized route for pickups and deliveries.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleOptimizeRoute} disabled={isLoading || isPending} className="w-full">
                        {(isLoading || isPending) && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                        {optimizedRoute ? 'Recalculate Optimal Route' : 'Find Optimal Route'}
                    </Button>
                </CardContent>
            </Card>

            {isLoading && (
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline text-lg">Optimized Route</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-4 w-[150px]" />
                    </div>
                  </div>
                   <div className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[220px]" />
                      <Skeleton className="h-4 w-[120px]" />
                    </div>
                  </div>
                   <div className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[180px]" />
                      <Skeleton className="h-4 w-[170px]" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {optimizedRoute && !isLoading && (
              <Card>
                  <CardHeader>
                      <CardTitle className="font-headline text-lg">Your Optimized Route</CardTitle>
                      <CardDescription>{optimizedRoute.routeSummary}</CardDescription>
                      <div className="flex gap-2 pt-2">
                        <Badge variant="secondary">{Math.round(optimizedRoute.estimatedTotalDistanceKm)} km</Badge>
                        <Badge variant="secondary">{Math.round(optimizedRoute.estimatedTotalDurationMinutes)} min</Badge>
                      </div>
                  </CardHeader>
                  <CardContent>
                      <ol className="space-y-2">
                          {optimizedRoute.optimizedStopOrder.map((stop, index) => {
                            const isCompleted = completedStops.includes(stop.id);
                            return (
                                <li key={stop.id}>
                                    <button 
                                      onClick={() => toggleStopCompletion(stop.id)}
                                      className={cn("w-full p-3 rounded-lg flex items-center gap-4 text-left transition-colors",
                                        isCompleted ? "bg-muted text-muted-foreground" : "bg-card hover:bg-muted/50"
                                      )}
                                    >
                                        <div className="flex-shrink-0">
                                            {isCompleted ? <Check className="h-5 w-5 text-primary" /> : <Circle className="h-5 w-5 text-border" />}
                                        </div>
                                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                            {stop.type === 'donor' ? <Building className="w-5 h-5 text-accent-foreground" /> : <HeartHandshake className="w-5 h-5 text-destructive" />}
                                        </div>
                                        <div className="flex-grow">
                                            <p className="font-semibold text-sm">{stop.name}</p>
                                            <p className={cn("text-xs capitalize", isCompleted ? "line-through" : "")}>
                                              {stop.type === 'donor' ? 'Pickup' : 'Delivery'}
                                            </p>
                                        </div>
                                        <div className="text-sm font-bold text-muted-foreground">{index + 1}</div>
                                    </button>
                                </li>
                            )
                          })}
                      </ol>
                  </CardContent>
              </Card>
            )}

            <div className="space-y-4">
                <div>
                    <h3 className="text-sm font-medium text-muted-foreground px-4 mb-2">Available Donors</h3>
                    <div className="space-y-2">
                        {DONORS.map(donor => (
                            <div key={donor.id} className="flex items-center gap-3 p-2 rounded-md">
                                <Building className="w-5 h-5 text-accent-foreground flex-shrink-0" />
                                <span className="text-sm font-medium">{donor.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <Separator />
                <div>
                    <h3 className="text-sm font-medium text-muted-foreground px-4 mb-2">Recipient NGOs</h3>
                    <div className="space-y-2">
                        {NGOS.map(ngo => (
                            <div key={ngo.id} className="flex items-center gap-3 p-2 rounded-md">
                                <HeartHandshake className="w-5 h-5 text-destructive flex-shrink-0" />
                                <span className="text-sm font-medium">{ngo.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </ScrollArea>
  );
}
