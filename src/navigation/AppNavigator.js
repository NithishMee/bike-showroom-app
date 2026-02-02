import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/theme';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase';

// Screens
import HomeScreen from '../screens/HomeScreen';
import BikeDetailsScreen from '../screens/BikeDetailsScreen';
import CompareScreen from '../screens/CompareScreen';
import WishlistScreen from '../screens/WishlistScreen';
import OffersScreen from '../screens/OffersScreen';
import ContactScreen from '../screens/ContactScreen';
import TestRideBookingScreen from '../screens/TestRideBookingScreen';
import EnquiryFormScreen from '../screens/EnquiryFormScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Main tab navigator
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Compare') {
            iconName = focused ? 'git-compare' : 'git-compare-outline';
          } else if (route.name === 'Wishlist') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Offers') {
            iconName = focused ? 'pricetag' : 'pricetag-outline';
          } else if (route.name === 'Contact') {
            iconName = focused ? 'call' : 'call-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          borderTopColor: '#eee',
          backgroundColor: COLORS.white,
          elevation: 5,
        }
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
      />
      <Tab.Screen name="Compare" component={CompareScreen} />
      <Tab.Screen name="Wishlist" component={WishlistScreen} />
      <Tab.Screen name="Offers" component={OffersScreen} />
      <Tab.Screen name="Contact" component={ContactScreen} />
    </Tab.Navigator>
  );
}

// Auth Stack
function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}

// Main app navigator with stack
function AppNavigator() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Only set user if email is verified
      if (user && user.emailVerified) {
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      {user ? (
        <>
          <Stack.Screen
            name="MainTabs"
            component={TabNavigator}
          />
          <Stack.Screen
            name="BikeDetails"
            component={BikeDetailsScreen}
          />
          <Stack.Screen
            name="TestRideBooking"
            component={TestRideBookingScreen}
          />
          <Stack.Screen
            name="EnquiryForm"
            component={EnquiryFormScreen}
          />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
          />
        </>
      ) : (
        <Stack.Screen
          name="Auth"
          component={AuthStack}
        />
      )}
    </Stack.Navigator>
  );
}

export default AppNavigator;
