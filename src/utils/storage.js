import AsyncStorage from '@react-native-async-storage/async-storage';

const WISHLIST_KEY = '@wishlist';

// Get wishlist from AsyncStorage
export const getWishlist = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(WISHLIST_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Error getting wishlist:', e);
    return [];
  }
};

// Save wishlist to AsyncStorage
export const saveWishlist = async (wishlist) => {
  try {
    const jsonValue = JSON.stringify(wishlist);
    await AsyncStorage.setItem(WISHLIST_KEY, jsonValue);
  } catch (e) {
    console.error('Error saving wishlist:', e);
  }
};

// Add bike to wishlist
export const addToWishlist = async (bikeId) => {
  try {
    const wishlist = await getWishlist();
    if (!wishlist.includes(bikeId)) {
      wishlist.push(bikeId);
      await saveWishlist(wishlist);
    }
  } catch (e) {
    console.error('Error adding to wishlist:', e);
  }
};

// Remove bike from wishlist
export const removeFromWishlist = async (bikeId) => {
  try {
    const wishlist = await getWishlist();
    const updatedWishlist = wishlist.filter(id => id !== bikeId);
    await saveWishlist(updatedWishlist);
  } catch (e) {
    console.error('Error removing from wishlist:', e);
  }
};

// Check if bike is in wishlist
export const isInWishlist = async (bikeId) => {
  try {
    const wishlist = await getWishlist();
    return wishlist.includes(bikeId);
  } catch (e) {
    console.error('Error checking wishlist:', e);
    return false;
  }
};
