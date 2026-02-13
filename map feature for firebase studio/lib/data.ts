import type { Donor, NGO } from '@/lib/types';

export const VOLUNTEER_START_LOCATION = {
  latitude: 37.7749, // San Francisco City Hall
  longitude: -122.4194,
};

export const DONORS: Donor[] = [
  { id: 'donor-1', name: 'The Ritz-Carlton', latitude: 37.7919, longitude: -122.4063, type: 'donor' },
  { id: 'donor-2', name: 'Marriott Marquis', latitude: 37.7846, longitude: -122.4039, type: 'donor' },
  { id: 'donor-3', name: 'Hilton Union Square', latitude: 37.786, longitude: -122.410, type: 'donor' },
];

export const NGOS: NGO[] = [
  { id: 'ngo-1', name: 'SF-Marin Food Bank', latitude: 37.747, longitude: -122.422, type: 'ngo' },
  { id: 'ngo-2', name: 'Glide Memorial', latitude: 37.785, longitude: -122.413, type: 'ngo' },
];
