// Groq API implementation for route optimization
// Using llama-3.3-70b-versatile for fast, high-quality JSON generation

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

// --- Main AI Logic ---

export async function getOptimizedRoute(
    input: VolunteerRouteOptimizationInput
): Promise<{ data?: OptimizedRoute; error?: string }> {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    console.log("[Groq] Initializing request with key:", apiKey ? apiKey.substring(0, 8) + "..." : "undefined");

    if (!apiKey) {
        return {
            error: 'Missing Groq API Key. Please add VITE_GROQ_API_KEY to your .env file.',
        };
    }

    try {
        const prompt = `
            You are a logistics expert. Optimize a pickup and delivery route.
            Volunteer Start: Lat: ${input.volunteerCurrentLocation.latitude}, Lon: ${input.volunteerCurrentLocation.longitude}.
            
            Donors (Pickups): ${JSON.stringify(input.donorLocations)}
            NGOs (Deliveries): ${JSON.stringify(input.ngoLocations)}

            STRICT RULE: All Donors must be visited BEFORE any NGOs.
            
            Return ONLY a raw JSON object:
            {
                "stop_order_ids": ["id1", "id2", ...]
            }
        `;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: 'You are a logistics JSON assistant.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.1,
                response_format: { type: 'json_object' }
            })
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(`Groq API Error: ${errData.error?.message || response.statusText}`);
        }

        const result = await response.json();
        const content = result.choices[0].message.content;
        const parsed = JSON.parse(content);

        if (!parsed.stop_order_ids || !Array.isArray(parsed.stop_order_ids)) {
            throw new Error("Invalid response format from AI");
        }

        // Reconstruct the route objects
        const allLocations = [...input.donorLocations, ...input.ngoLocations];
        const optimizedStopOrder: OptimizedStop[] = [];

        for (const id of parsed.stop_order_ids) {
            const loc = allLocations.find(l => l.id === id);
            if (loc) optimizedStopOrder.push(loc as OptimizedStop);
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

        const totalDurationMinutes = (totalDistanceKm / 30) * 60;

        return {
            data: {
                optimizedStopOrder,
                routeSummary: `Route optimized by Groq (Llama 3.3). Total distance: ${totalDistanceKm.toFixed(1)} km.`,
                estimatedTotalDistanceKm: totalDistanceKm,
                estimatedTotalDurationMinutes: totalDurationMinutes
            }
        };

    } catch (error: any) {
        console.error("Groq Route Error:", error);
        
        // Final fallback logic
        const mockOrder = [...input.donorLocations, ...input.ngoLocations];
        return {
            data: {
                optimizedStopOrder: mockOrder as OptimizedStop[],
                routeSummary: `(Fallback) Simple sequence route. API Error: ${error.message}`,
                estimatedTotalDistanceKm: 0,
                estimatedTotalDurationMinutes: 0
            }
        };
    }
}
