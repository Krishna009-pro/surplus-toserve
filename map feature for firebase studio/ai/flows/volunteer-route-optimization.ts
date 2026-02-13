'use server';
/**
 * @fileOverview A Genkit flow for suggesting an optimized route for volunteer drivers.
 *
 * - volunteerRouteOptimization - A function that handles the route optimization process.
 * - VolunteerRouteOptimizationInput - The input type for the volunteerRouteOptimization function.
 * - VolunteerRouteOptimizationOutput - The return type for the volunteerRouteOptimization function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Helper function for Haversine distance, as a placeholder for a real mapping API call
// This is used inside the mock tool for calculation
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}

// Define the schema for a single location
const LocationSchema = z.object({
  id: z.string().describe('Unique identifier for the location.'),
  name: z.string().describe('Name of the location (e.g., hotel name, NGO name).'),
  latitude: z.number().describe('Latitude of the location.'),
  longitude: z.number().describe('Longitude of the location.'),
});

// Define the input schema for the route optimization flow
const VolunteerRouteOptimizationInputSchema = z.object({
  volunteerCurrentLocation: LocationSchema.omit({id: true, name: true}).describe('The current starting location of the volunteer driver.'),
  donorLocations: z.array(LocationSchema).describe('A list of food donor locations with their coordinates.'),
  ngoLocations: z.array(LocationSchema).describe('A list of recipient NGO locations with their coordinates.'),
  availableTransport: z.enum(['car', 'van', 'bicycle', 'motorcycle']).optional().describe('The type of transport available to the volunteer, which might affect route efficiency suggestions.'),
});
export type VolunteerRouteOptimizationInput = z.infer<typeof VolunteerRouteOptimizationInputSchema>;

// Define the schema for a stop in the optimized route
const OptimizedStopSchema = z.object({
  id: z.string().describe('Unique identifier for the stop (donor or NGO).'),
  name: z.string().describe('Name of the stop.'),
  latitude: z.number().describe('Latitude of the stop.'),
  longitude: z.number().describe('Longitude of the stop.'),
  type: z.enum(['donor', 'ngo']).describe('The type of stop, indicating whether it is a donor for pickup or an NGO for delivery.'),
});

// Define the output schema for the route optimization flow
const VolunteerRouteOptimizationOutputSchema = z.object({
  optimizedStopOrder: z.array(OptimizedStopSchema).describe('An ordered list of stops, starting from the volunteer\u0027s current location, optimized for pickups and deliveries.'),
  routeSummary: z.string().describe('A textual summary of the suggested optimized route, including estimated total distance and duration.'),
  estimatedTotalDistanceKm: z.number().describe('The estimated total distance of the optimized route in kilometers.'),
  estimatedTotalDurationMinutes: z.number().describe('The estimated total duration of the optimized route in minutes.'),
});
export type VolunteerRouteOptimizationOutput = z.infer<typeof VolunteerRouteOptimizationOutputSchema>;

// Define a tool for calculating route metrics (distance and duration) for a given sequence of waypoints.
// This simulates a call to a mapping API.
const calculateRouteMetricsTool = ai.defineTool(
  {
    name: 'calculateRouteMetrics',
    description: 'Calculates the total distance and estimated total duration for a route given a starting point and an ordered list of waypoints. This tool does not optimize the route, it only measures a given sequence.',
    inputSchema: z.object({
      origin: LocationSchema.omit({id: true, name: true}).describe('The starting point of the route.'),
      waypoints: z.array(OptimizedStopSchema).describe('An ordered list of locations (donors for pickup, NGOs for delivery) to visit.'),
      averageSpeedKmPerHour: z.number().optional().default(30).describe('The average speed in km/h to use for duration calculation.'),
    }),
    outputSchema: z.object({
      totalDistanceKm: z.number().describe('The calculated total distance of the route in kilometers.'),
      totalDurationMinutes: z.number().describe('The calculated total duration of the route in minutes.'),
    }),
  },
  async ({ origin, waypoints, averageSpeedKmPerHour }) => {
    let totalDistanceKm = 0;
    let prevLat = origin.latitude;
    let prevLon = origin.longitude;

    for (const waypoint of waypoints) {
      totalDistanceKm += haversineDistance(
        prevLat,
        prevLon,
        waypoint.latitude,
        waypoint.longitude
      );
      prevLat = waypoint.latitude;
      prevLon = waypoint.longitude;
    }

    const estimatedTotalDurationMinutes = (totalDistanceKm / averageSpeedKmPerHour) * 60;

    return {
      totalDistanceKm,
      totalDurationMinutes: estimatedTotalDurationMinutes,
    };
  }
);

const volunteerRouteOptimizationPrompt = ai.definePrompt({
  name: 'volunteerRouteOptimizationPrompt',
  input: { schema: VolunteerRouteOptimizationInputSchema },
  output: { schema: VolunteerRouteOptimizationOutputSchema },
  tools: [calculateRouteMetricsTool],
  prompt: `You are an expert logistics and route optimization assistant for FoodFlow, a food donation app. Your goal is to help volunteer drivers efficiently pick up food from donors and deliver it to NGOs.\n\nThe volunteer's current location is: Lat {{{volunteerCurrentLocation.latitude}}}, Lon {{{volunteerCurrentLocation.longitude}}}.\nAvailable transport: {{{availableTransport}}}\n\nHere are the donor locations for food pickup:\n{{#each donorLocations}}\n- ID: {{{id}}}, Name: {{{name}}}, Lat: {{{latitude}}}, Lon: {{{longitude}}}\n{{/each}}\n\nHere are the NGO locations for food delivery:\n{{#each ngoLocations}}\n- ID: {{{id}}}, Name: {{{name}}}, Lat: {{{latitude}}}, Lon: {{{longitude}}}\n{{/each}}\n\nPlease suggest an optimized route, as an ordered list of stops.\nThe route should start from the volunteer's current location.\n**Prioritize picking up all food from donors before delivering to NGOs.**\nMinimize total travel distance and time.\nUse the 'calculateRouteMetrics' tool to estimate the total distance and duration of your proposed optimized route, and incorporate these metrics into your route summary.\nThe 'type' field in the 'optimizedStopOrder' should be 'donor' for pickups and 'ngo' for deliveries.\nIf there are no donors or NGOs, indicate that no route is needed.`,
});

const volunteerRouteOptimizationFlow = ai.defineFlow(
  {
    name: 'volunteerRouteOptimizationFlow',
    inputSchema: VolunteerRouteOptimizationInputSchema,
    outputSchema: VolunteerRouteOptimizationOutputSchema,
  },
  async (input) => {
    // The prompt is designed to use the tool internally and format the output directly.
    const { output } = await volunteerRouteOptimizationPrompt(input);
    if (!output) {
      throw new Error('Failed to get route optimization suggestions from the AI.');
    }
    return output;
  }
);

export async function volunteerRouteOptimization(input: VolunteerRouteOptimizationInput): Promise<VolunteerRouteOptimizationOutput> {
  return volunteerRouteOptimizationFlow(input);
}
