# Surplus2Serve

Surplus2Serve is a modern food rescue platform connecting food donors (restaurants, events, individuals) with local NGOs (shelters, food banks) to efficiently redistribute surplus food and reduce waste.

## 🚀 Key Features

### 1. Core Platform
*   **Role-Based Access Control (RBAC)**: Secure authentication flows for two distinct user types:
    *   **Donors**: Streamlined signup for quick food listing.
    *   **NGOs**: Verification-required signup (Org Name, Reg Number) to ensure safety and trust.
*   **Real-Time Data**: Built on Firebase Firestore for instant updates on donation availability and claims.
*   **Modern UI/UX**: A responsive, accessible interface with dark mode support, animated interactions, and a split-screen authentication experience.

### 2. Donor Features
*   **Impact Dashboard**: Donors can track their contribution to society with real-time metrics:
    *   Total Meals Saved
    *   Estimated CO2 Emissions Prevented (Gamified eco-impact)
*   **Quick Donation Listing**:
    *   **Image Upload**: Donors can upload images of surplus food (auto-validated and compressed).
    *   **Smart Categorization**: Categorize food (Veg/Non-Veg, Cooked/Raw) for better filtering.
    *   **Expiry Management**: Strict enforcement of expiry dates to ensure food safety.

### 3. NGO Features
*   **Smart Marketplace**:
    *   **Location Filtering**: NGOs can filter available donations by proximity to save travel time.
    *   **Live Feed**: Instant visibility of new donations in the area.
*   **Claim System**:
    *   **Instant Reservation**: One-click claiming to reserve food and prevent double-booking.
    *   **Status Tracking**: Track donations from "Available" -> "Claimed" -> "Completed".

### 4. Logistics & AI Route Optimization (Powered by Gemini)
*   **AI Route Planner**: Integrated Google Gemini AI to solve the logistics challenge.
*   **Intelligent Routing**:
    *   Analyzes multiple claimed pickup locations.
    *   Generates the most efficient collection route to save fuel and time for NGO volunteers.
    *   Provides step-by-step route instructions.

### 5. Admin & Security
*   **Donation Oversight**: detailed view of all platform transactions for transparency.
*   **User Management**: Tools to approve/reject NGO registrations based on credentials.
*   **System Analytics**: High-level metrics on platform growth and impact.

## 🛠️ Tech Stack
*   **Frontend**: React, TypeScript, Vite, Tailwind CSS, Shadcn/UI
*   **Backend / Database**: Firebase Auth, Firebase Firestore
*   **AI**: Google Gemini Pro (Generative AI SDK)
*   **State Management**: React Hooks & Context

## 🔮 Future Roadmap

### Phase 2: AI-Powered Food Quality Assurance
To ensure food safety and prevent contamination, we plan to integrate **Computer Vision Models**.

*   **Primary Model**: **Google Gemini 1.5 Pro (Vision)**
    *   **Why?**: Since we already use Gemini for logistics, upgrading to the multimodal (Vision) capabilities is seamless. It can analyze images uploaded by donors to detect signs of spoilage (mold, discoloration, bruising) before the listing goes live.
*   **Edge Alternative**: **MobileNetV3 (TensorFlow.js)**
    *   **Why?**: For offline-first scenarios, a lightweight model running directly in the browser can provide instant feedback to the donor without server costs.

### Phase 3: Blockchain for Transparency
*   Immutable ledger for tracking food journey from "Kitchen to Fork" to ensure accountability.

## 📦 Installation
1.  Clone the repository.
2.  Install dependencies: `npm install`
3.  Set up environment variables for Firebase and Gemini API.
4.  Run locally: `npm run dev`
