export type Location = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
};

export type Donor = Location & {
  type: 'donor';
};

export type NGO = Location & {
  type: 'ngo';
};

export type Stop = Donor | NGO;

export type OptimizedStop = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type: 'donor' | 'ngo';
};

export type OptimizedRoute = {
  optimizedStopOrder: OptimizedStop[];
  routeSummary: string;
  estimatedTotalDistanceKm: number;
  estimatedTotalDurationMinutes: number;
};
