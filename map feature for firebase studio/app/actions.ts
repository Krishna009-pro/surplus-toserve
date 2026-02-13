'use server';

import {
  volunteerRouteOptimization,
  type VolunteerRouteOptimizationInput,
} from '@/ai/flows/volunteer-route-optimization';
import type { OptimizedRoute } from '@/lib/types';

export async function getOptimizedRoute(
  input: VolunteerRouteOptimizationInput
): Promise<{ data?: OptimizedRoute; error?: string }> {
  if (!process.env.GEMINI_API_KEY) {
    return {
      error:
        'The route optimization feature requires a Gemini API key. Please create one in Google AI Studio and add it to a `.env.local` file as `GEMINI_API_KEY=<YOUR_API_KEY>`.',
    };
  }

  if (!input.volunteerCurrentLocation || !input.donorLocations || !input.ngoLocations) {
    return { error: 'Invalid input provided. Missing location data.' };
  }

  try {
    const result = await volunteerRouteOptimization(input);
    return { data: result };
  } catch (e) {
    console.error('Error getting optimized route:', e);
    return { error: 'Failed to generate an optimized route. The AI model may be unavailable or experienced an issue. Please try again later.' };
  }
}
