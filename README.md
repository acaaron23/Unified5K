# AdaptX - Unified5K Mobile Appplication

Throughout 2025, our team has been developing **Unified5K**, a mobile app supporting AdaptX’s inclusive 5K race series and adaptive sports expo. The app is designed to make community fitness more accessible by helping participants discover events, track race details, and engage with sponsors and vendors. It also streamlines donations and sponsorship management, creating a stronger connection between AdaptX, its community, and corporate partners.

---

### Description
Unified5K is a **React Native + Expo** application for event discovery, race information, donations, and sponsor engagement. It centralizes event schedules, provides race cards with start times and locations, highlights community and corporate sponsorship opportunities, and integrates sponsor/vendor inquiries through an in-app modal. The app ensures participants, spectators, and partners have a smooth, mobile-first experience that prioritizes accessibility and community engagement.

---

## Key Features

- **Tabbed navigation**: Home, Media, Resources, Donation, Profile  
- **Race Results & Tracking (Race Cards)**: Supports searching and filtering  
- **Race Details**: Descriptor, image carousel, and donation progress  
- **Donation Page – Sponsor Tiers**: Collapsible sections with summaries + “Learn more” links  
- **Sponsor/Vendor Inquiry**: In-app modal (mailto) to contact AdaptX  
- **User Profiles**: Includes race history and stats  
- **Social Feed**: Blog posts  
- **Account Authentication**: Login and account creation with email + password  

---

## Technical Architecture

### Tech Stack
- **Frontend**: React Native + Expo, NativeWind (Tailwind v3)  
- **Backend**: Firebase 
- **Database**: Firebase Firestore + PostgreSQL with Prisma ORM
- **Deployment**: App Store Deployment
- **Other Tools**: [Figma](https://www.figma.com/design/sMEvDVTnccQDVJz52j8yCF/Unified5k-Wireframes?node-id=104-833&p=f&t=VqN2u39CbGvyDc3l-0) (design), [GitHub](https://github.com/alexiak0127/Unified5K) (version control)  

---

## Getting Started

### Prerequisites
Before starting, ensure the following are installed:
- Expo

### Phone Setup (Dev Build)
- **Android (physical):** https://docs.expo.dev/get-started/set-up-your-environment/?platform=android&device=physical&mode=development-build  
- **iOS (physical):** https://docs.expo.dev/get-started/set-up-your-environment/?platform=ios&device=physical&mode=development-build  

### app.json (Expo account linking tip)
After logging into your Expo account on your local computer, check your `app.json`.  
If it contains a previous Expo project link, comment or remove the `eas.projectId` block before re-initializing:

```json
{
  "expo": {
    "extra": {
      // remove this block if it points to someone else’s account
      // "eas": {
      //   "projectId": "07392021-0dbd-462b-8b25-518d398b9f51"
      // }
    }
  }
}
```

### Initialize New Project Link
After cleaning up `app.json`, run these commands:

#### Log in to your Expo account if you haven't already
```
eas login
```

#### Initialize a new EAS project for your account
```
eas init
```

#### Configure build targets (Android/iOS or both)
```
eas build:configure
```

### Running the Application Locally

Frontend

Navigate to the frontend directory:
```
cd unified5k
```

Install dependencies:
```
npm install
```

Start the development server:
```
npx expo start
```

After starting developent server: 
```
press i
```

Or alternatives:
```
npx expo start --dev-client --clear
```

---

## Directory Structure

```bash
unified5k/
├── app/                          # Main application screens (file-based routing)
│   ├── (auth)/                   # Authentication routes
│   │   ├── sign-in.tsx          # Sign in screen
│   │   ├── sign-up.tsx          # Sign up screen
│   │   └── _layout.tsx          # Auth layout wrapper
│   ├── _layout.tsx              # Root layout
│   ├── index.tsx                # Home screen
│   ├── donation.tsx             # Donation page
│   ├── media.tsx                # Media gallery page
│   ├── profile.tsx              # User profile page
│   ├── race_details.tsx         # Race details page
│   ├── resources.tsx            # Resources page
│   └── sponsor-tiers.tsx        # Sponsor tiers page
│
├── components/                   # Reusable UI components
│   ├── profile/
│   │   └── CollapsibleSection.tsx
│   ├── ArticleCard.tsx
│   ├── BlogPostCard.tsx
│   ├── descriptor.tsx
│   ├── donationBar.tsx
│   ├── FilterTabs.tsx
│   ├── Header.tsx
│   ├── HeroSection.tsx
│   ├── imageCarousel.tsx
│   ├── RaceCard.tsx
│   ├── SearchBar.tsx
│   ├── SignOutButton.tsx
│   └── SponsorModal.tsx
│
├── services/                     # API and service layer
│   └── runsignup/               # RunSignUp API integration
│       ├── api.service.ts       # Base API service
│       ├── auth.service.ts      # Authentication service
│       ├── photo.service.ts     # Photo management service
│       ├── race.service.ts      # Race data service
│       ├── registration.service.ts  # Registration service
│       ├── user.service.ts      # User management service
│       └── index.ts             # Service exports
│
├── hooks/                        # Custom React hooks
│   └── useRunSignUp.ts          # RunSignUp integration hook
│
├── utils/                        # Utility functions
│   └── testApi.ts               # API testing utilities
│
├── assets/                       # Static assets (images, fonts)
│
├── ios/                          # iOS native project files
│
├── .env                          # Environment variables
├── app.json                      # Expo app configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Project dependencies
```

## Future Work 
- **Authentication Improvements**: Refine sign-in and sign-up flows, including proper redirect after login/registration. Enhance registration to sync with RunSignUp for races and any other details from the API. 
- **Database Integration**: Connect Firebase + PostgreSQL logic to make sure that data is stored properly.  
- **Frontend Refinements**: Polish UI/UX for smoother navigation, responsive styling, and accessibility improvements.  
- **Deployment**: Prepare and configure production builds for both iOS and Android via Expo EAS.
- **RunSignUp API Integration**: Complete the connection between the frontend and RunSignUp API. Continue to implement the API key with race signup/volunteering. Also, adding information to the Media and Resource tab. 
- **App UI/UX**: Continue to add any changes necessary to make sure that the application is simple and easy to use for all users. 

