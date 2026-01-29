# Quick Setup Guide

## Step-by-Step Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Firebase

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Firestore Database
3. Copy your Firebase config from Project Settings > General
4. Update `firebase.js` with your credentials

### 3. Set Firestore Rules (Development)

Go to Firestore Database > Rules and paste:
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

### 4. Add Sample Data

In Firestore Console, create these collections:

**Collection: `bikes`**
Add at least 3 documents with this structure:
```json
{
  "name": "Yamaha MT-15",
  "price": 165000,
  "mileage": 56.8,
  "engineCC": 155,
  "images": ["https://via.placeholder.com/400"],
  "description": "Sporty and powerful bike.",
  "specs": [
    {"key": "Fuel Type", "value": "Petrol"},
    {"key": "Transmission", "value": "6 Speed Manual"}
  ]
}
```

**Collection: `offers`** (Optional)
Add 1-2 offer documents:
```json
{
  "title": "Summer Sale",
  "description": "10% off on all bikes",
  "discount": "10% OFF",
  "validUntil": "31/12/2024"
}
```

### 5. Create Assets Folder (Optional)

Create an `assets` folder with placeholder images:
- `assets/icon.png` (1024x1024)
- `assets/splash.png` (1242x2436)
- `assets/adaptive-icon.png` (1024x1024)
- `assets/favicon.png` (48x48)

Or use Expo's default assets by running:
```bash
npx expo install expo-asset
```

### 6. Run the App

```bash
npm start
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator  
- Scan QR code with Expo Go app

## Testing Checklist

- [ ] Home screen loads bikes from Firestore
- [ ] Search filters bikes correctly
- [ ] Bike details screen shows all information
- [ ] Wishlist adds/removes bikes
- [ ] Compare screen allows selecting 2 bikes
- [ ] Test ride booking form submits to Firestore
- [ ] Enquiry form submits to Firestore
- [ ] Offers screen displays offers
- [ ] Contact screen opens phone and maps

## Common Issues

**Firebase Error**: Check your `firebase.js` configuration
**Navigation Error**: Ensure all screens are imported in `AppNavigator.js`
**Images Not Loading**: Use placeholder URLs or check image URLs are accessible
