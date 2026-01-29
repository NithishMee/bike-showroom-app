import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/theme';

// Screens
import HomeScreen from '../screens/HomeScreen';
import BikeDetailsScreen from '../screens/BikeDetailsScreen';
import CompareScreen from '../screens/CompareScreen';
import WishlistScreen from '../screens/WishlistScreen';
import OffersScreen from '../screens/OffersScreen';
import ContactScreen from '../screens/ContactScreen';
import TestRideBookingScreen from '../screens/TestRideBookingScreen';
import EnquiryFormScreen from '../screens/EnquiryFormScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Main tab navigator
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
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
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
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
        options={{ title: 'Home' }}
      />
      <Tab.Screen name="Compare" component={CompareScreen} />
      <Tab.Screen name="Wishlist" component={WishlistScreen} />
      <Tab.Screen name="Offers" component={OffersScreen} />
      <Tab.Screen name="Contact" component={ContactScreen} />
    </Tab.Navigator>
  );
}

// Main app navigator with stack
function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BikeDetails"
        component={BikeDetailsScreen}
        options={{ title: 'Bike Details' }}
      />
      <Stack.Screen
        name="TestRideBooking"
        component={TestRideBookingScreen}
        options={{ title: 'Book Test Ride' }}
      />
      <Stack.Screen
        name="EnquiryForm"
        component={EnquiryFormScreen}
        options={{ title: 'Enquiry Form' }}
      />
    </Stack.Navigator>
  );
}

export default AppNavigator;
