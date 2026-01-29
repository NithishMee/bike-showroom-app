# Bike Showroom Mobile App

A complete React Native (Expo) mobile application for a Bike Showroom built with JavaScript, Firebase Firestore, and React Navigation.

## Features

- **Home Screen**: Browse bikes with search functionality
- **Bike Details**: View detailed information, multiple images, and specifications
- **Compare Bikes**: Side-by-side comparison of 2 bikes (price, mileage, engine CC)
- **Wishlist**: Save favorite bikes locally using AsyncStorage
- **Test Ride Booking**: Book test rides with form submission to Firestore
- **Enquiry Form**: Submit enquiries for specific bikes
- **Offers Screen**: View current offers and discounts
- **Contact Screen**: Showroom information with tap-to-call and maps integration

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Firebase account (free tier)

## Installation

1. **Clone or download the project**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project (or use existing)
   - Enable Firestore Database
   - Go to Project Settings > General
   - Copy your Firebase configuration
   - Update `firebase.js` with your Firebase credentials:
     ```javascript
     const firebaseConfig = {
       apiKey: "YOUR_API_KEY",
       authDomain: "YOUR_AUTH_DOMAIN",
       projectId: "YOUR_PROJECT_ID",
       storageBucket: "YOUR_STORAGE_BUCKET",
       messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
       appId: "YOUR_APP_ID"
     };
     ```

4. **Set up Firestore Security Rules** (for development)
   - Go to Firestore Database > Rules
   - Use test mode rules:
     ```
     rules_version = '2';
     service cloud.firestore {
       match /databases/{database}/documents {
         match /{document=**} {
           allow read, write: if true;
         }
       }
     }
     ```
   - **Note**: These are test rules. Update for production use.

5. **Add sample data to Firestore** (see Firestore Data Structure below)

6. **Run the app**
   ```bash
   npm start
   ```
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your phone

## Firestore Data Structure

### Collection: `bikes`

Each document should have the following structure:

```javascript
{
  name: "Yamaha MT-15",
  price: 165000,
  mileage: 56.8,
  engineCC: 155,
  images: [
    "https://example.com/bike1.jpg",
    "https://example.com/bike2.jpg"
  ],
  description: "Sporty and powerful bike with excellent fuel efficiency.",
  specs: [
    { key: "Fuel Type", value: "Petrol" },
    { key: "Transmission", value: "6 Speed Manual" },
    { key: "Brakes", value: "Disc (Front & Rear)" },
    { key: "Weight", value: "141 kg" },
    { key: "Top Speed", value: "136 kmph" }
  ]
}
```

**Sample Documents:**

```javascript
// Document 1
{
  name: "Yamaha MT-15",
  price: 165000,
  mileage: 56.8,
  engineCC: 155,
  images: ["https://via.placeholder.com/400"],
  description: "Sporty and powerful bike with excellent fuel efficiency.",
  specs: [
    { key: "Fuel Type", value: "Petrol" },
    { key: "Transmission", value: "6 Speed Manual" },
    { key: "Brakes", value: "Disc (Front & Rear)" }
  ]
}

// Document 2
{
  name: "Honda CB350",
  price: 195000,
  mileage: 45.0,
  engineCC: 348,
  images: ["https://via.placeholder.com/400"],
  description: "Classic design with modern features.",
  specs: [
    { key: "Fuel Type", value: "Petrol" },
    { key: "Transmission", value: "5 Speed Manual" },
    { key: "Brakes", value: "Disc (Front & Rear)" }
  ]
}

// Document 3
{
  name: "Royal Enfield Classic 350",
  price: 193000,
  mileage: 37.0,
  engineCC: 349,
  images: ["https://via.placeholder.com/400"],
  description: "Iconic design with thumping engine sound.",
  specs: [
    { key: "Fuel Type", value: "Petrol" },
    { key: "Transmission", value: "5 Speed Manual" },
    { key: "Brakes", value: "Disc (Front), Drum (Rear)" }
  ]
}
```

### Collection: `offers`

Each document should have the following structure:

```javascript
{
  title: "Summer Sale - 10% Off",
  description: "Get 10% discount on all bikes this summer! Limited time offer.",
  discount: "10% OFF",
  image: "https://example.com/offer.jpg", // Optional
  validUntil: "31/12/2024",
  createdAt: Timestamp // Auto-generated
}
```

**Sample Documents:**

```javascript
// Document 1
{
  title: "Summer Sale - 10% Off",
  description: "Get 10% discount on all bikes this summer! Limited time offer.",
  discount: "10% OFF",
  image: "https://via.placeholder.com/600x200",
  validUntil: "31/12/2024"
}

// Document 2
{
  title: "Exchange Bonus",
  description: "Get up to ₹15,000 exchange bonus on your old bike.",
  discount: "₹15,000 Bonus",
  validUntil: "30/11/2024"
}
```

### Collection: `enquiries`

Documents are auto-created when users submit enquiry forms:

```javascript
{
  name: "John Doe",
  phone: "9876543210",
  bikeName: "Yamaha MT-15",
  createdAt: Timestamp // Auto-generated
}
```

### Collection: `testRides`

Documents are auto-created when users book test rides:

```javascript
{
  name: "John Doe",
  phone: "9876543210",
  preferredDate: "25/12/2024",
  bikeName: "Yamaha MT-15",
  createdAt: Timestamp // Auto-generated
}
```

## Project Structure

```
bike-showroom-app/
├── App.js                 # Main app entry point
├── firebase.js            # Firebase configuration
├── package.json           # Dependencies
├── app.json              # Expo configuration
├── babel.config.js       # Babel configuration
├── src/
│   ├── navigation/
│   │   └── AppNavigator.js    # Navigation setup
│   ├── screens/
│   │   ├── HomeScreen.js
│   │   ├── BikeDetailsScreen.js
│   │   ├── CompareScreen.js
│   │   ├── WishlistScreen.js
│   │   ├── TestRideBookingScreen.js
│   │   ├── EnquiryFormScreen.js
│   │   ├── OffersScreen.js
│   │   └── ContactScreen.js
│   ├── components/
│   │   └── BikeCard.js        # Reusable bike card component
│   └── utils/
│       └── storage.js         # AsyncStorage utilities for wishlist
└── README.md
```

## Key Technologies

- **React Native**: Mobile app framework
- **Expo**: Development platform and tooling
- **React Navigation**: Navigation library (Stack & Bottom Tabs)
- **Firebase Firestore**: Cloud database
- **AsyncStorage**: Local storage for wishlist
- **Expo Linking**: For phone calls and maps

## Features Implementation Details

### Search
- Client-side filtering by bike name
- Real-time search as you type
- Case-insensitive matching

### Wishlist
- Stored locally using AsyncStorage
- Persists across app restarts
- Syncs with bike list from Firestore

### Compare Bikes
- Select up to 2 bikes
- Side-by-side comparison of:
  - Price
  - Mileage
  - Engine CC
- Quick navigation to bike details

### Forms
- Validation for required fields
- Phone number format validation (10 digits)
- Success/error alerts
- Auto-redirect after submission

## Troubleshooting

### Firebase Connection Issues
- Verify Firebase configuration in `firebase.js`
- Check Firestore security rules
- Ensure Firestore is enabled in Firebase Console

### Navigation Issues
- Ensure all screen components are imported correctly
- Check screen names match navigation calls

### Image Loading Issues
- Verify image URLs are accessible
- Use placeholder images for testing
- Check network connectivity

## Development Notes

- All components use functional components with hooks
- No TypeScript - pure JavaScript
- Clean, simple UI without advanced animations
- Reusable components for maintainability
- Meaningful variable names and comments

## License

This project is created for educational/demonstration purposes.

## Support

For issues or questions, please check:
- Expo Documentation: https://docs.expo.dev/
- React Navigation: https://reactnavigation.org/
- Firebase Documentation: https://firebase.google.com/docs
