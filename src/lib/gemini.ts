import { GoogleGenerativeAI } from "@google/generative-ai";

// --- Types ---

export interface Location {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
}

export interface Donor extends Location {
    type: 'donor';
}

export interface NGO extends Location {
    type: 'ngo';
}

export type Stop = Donor | NGO;

export interface OptimizedStop extends Location {
    type: 'donor' | 'ngo';
}

export interface OptimizedRoute {
    optimizedStopOrder: OptimizedStop[];
    routeSummary: string;
    estimatedTotalDistanceKm: number;
    estimatedTotalDurationMinutes: number;
}

export interface VolunteerRouteOptimizationInput {
    volunteerCurrentLocation: Omit<Location, 'id' | 'name'>;
    donorLocations: Donor[];
    ngoLocations: NGO[];
    availableTransport?: 'car' | 'van' | 'bicycle' | 'motorcycle';
}

// --- Helper Functions ---

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

// --- Main Logic ---

export async function getOptimizedRoute(
    input: VolunteerRouteOptimizationInput
): Promise<{ data?: OptimizedRoute; error?: string }> {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    console.log("Debug - Loaded API Key:", apiKey ? apiKey.substring(0, 8) + "..." : "undefined");

    if (!apiKey) {
        return {
            error: 'Missing Google Gemini API Key. Please add VITE_GEMINI_API_KEY to your .env file.',
        };
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            You are an expert logistics assistant.
            The volunteer is at Lat: ${input.volunteerCurrentLocation.latitude}, Lon: ${input.volunteerCurrentLocation.longitude}.
            Transport: ${input.availableTransport || 'car'}.

            Donors (Pickups):
            ${JSON.stringify(input.donorLocations)}

            NGOs (Deliveries):
            ${JSON.stringify(input.ngoLocations)}

            Task: Create an optimized route starting from the volunteer's location.
            Objective: Minimize total travel distance. Prioritize clustering nearby stops.
            Constraint: All Donors must be visited before ANY NGO. This is a strict rule (Pickup Phase -> Delivery Phase).
            
            Return ONLY a JSON object with this exact structure:
            {
                "stop_order_ids": ["id1", "id2", ...],
                "ai_reasoning": "A short, one-sentence explanation of why this route is optimal."
            }
            Do not include markdown formatting like \`\`\`json. Just the raw JSON.
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Clean up markdown if present
        const jsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(jsonString);

        if (!parsed.stop_order_ids || !Array.isArray(parsed.stop_order_ids)) {
            throw new Error("Invalid response format from AI");
        }

        // Reconstruct the route objects
        const allLocations = [...input.donorLocations, ...input.ngoLocations];
        const optimizedStopOrder: OptimizedStop[] = [];

        for (const id of parsed.stop_order_ids) {
            const loc = allLocations.find(l => l.id === id);
            if (loc) {
                optimizedStopOrder.push(loc);
            }
        }

        // Calculate metrics locally
        let totalDistanceKm = 0;
        let prevLat = input.volunteerCurrentLocation.latitude;
        let prevLon = input.volunteerCurrentLocation.longitude;

        for (const stop of optimizedStopOrder) {
            totalDistanceKm += haversineDistance(prevLat, prevLon, stop.latitude, stop.longitude);
            prevLat = stop.latitude;
            prevLon = stop.longitude;
        }

        // Estimate duration (assume 30km/h average in city including stops)
        const averageSpeedKmH = 30;
        const totalDurationMinutes = (totalDistanceKm / averageSpeedKmH) * 60 + (optimizedStopOrder.length * 5); // +5 mins per stop

        return {
            data: {
                optimizedStopOrder,
                routeSummary: parsed.ai_reasoning || `Optimized route with ${optimizedStopOrder.length} stops. Total distance: ${totalDistanceKm.toFixed(1)} km.`,
                estimatedTotalDistanceKm: totalDistanceKm,
                estimatedTotalDurationMinutes: totalDurationMinutes
            }
        };

    } catch (error: any) {
        console.error("Gemini Route Optimization Error:", error);

        // Fallback to Mock Data if API fails (e.g. invalid key or quota)
        console.warn("Falling back to local mock data due to API error.");

        // Mock optimized order (just a simple sort for demo)
        const mockOrder = [
            ...input.donorLocations,
            ...input.ngoLocations
        ];

        // Calculate mock stats
        let totalDistance = 0;
        let pLat = input.volunteerCurrentLocation.latitude;
        let pLon = input.volunteerCurrentLocation.longitude;

        mockOrder.forEach(stop => {
            totalDistance += haversineDistance(pLat, pLon, stop.latitude, stop.longitude);
            pLat = stop.latitude;
            pLon = stop.longitude;
        });

        return {
            data: {
                optimizedStopOrder: mockOrder as OptimizedStop[],
                routeSummary: `(Mock) Optimized route with ${mockOrder.length} stops. Total distance: ${totalDistance.toFixed(1)} km.`,
                estimatedTotalDistanceKm: totalDistance,
                estimatedTotalDurationMinutes: (totalDistance / 30) * 60
            }
        };
    }
}
