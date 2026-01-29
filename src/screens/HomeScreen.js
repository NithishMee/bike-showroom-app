import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, ActivityIndicator, TouchableOpacity } from 'react-native';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import data from '../../sample-firestore-data.json';
import BikeCard from '../components/BikeCard';
import { getWishlist, addToWishlist, removeFromWishlist } from '../utils/storage';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/theme';

const HomeScreen = ({ navigation }) => {
  const [bikes, setBikes] = useState([]);
  const [filteredBikes, setFilteredBikes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);

  // Fetch bikes from Firestore
  useEffect(() => {
    fetchBikes();
    loadWishlist();
  }, []);

  // Load wishlist on mount
  const loadWishlist = async () => {
    const wishlistData = await getWishlist();
    setWishlist(wishlistData);
  };

  // Auto-Migration Check
  useEffect(() => {
    const checkAndMigrate = async () => {
      // Small delay to let initial fetch happen, or just check directly from Firestore
      const bikesCollection = collection(db, 'bikes');
      const snapshot = await getDocs(bikesCollection);

      const hasOldData = snapshot.docs.some(doc => {
        const data = doc.data();
        return data.name && (data.name.includes('Yamaha') || data.name.includes('Honda') || data.name.includes('Bajaj'));
      });

      const isEmpty = snapshot.empty;

      if (hasOldData || isEmpty) {
        console.log("Detected outdated or empty database. Starting auto-migration...");
        await handleResetDatabase();
      }
    };

    checkAndMigrate();
  }, []);

  // Seed data to Firestore (Clear first then Add)
  const handleResetDatabase = async () => {
    try {
      setLoading(true);

      // 1. Clear existing 'bikes'
      const bikesCollection = collection(db, 'bikes');
      const bikeDocs = await getDocs(bikesCollection);
      bikeDocs.forEach(async (document) => {
        await deleteDoc(doc(db, 'bikes', document.id));
      });

      // 2. Clear existing 'offers'
      const offersCollection = collection(db, 'offers');
      const offerDocs = await getDocs(offersCollection);
      offerDocs.forEach(async (document) => {
        await deleteDoc(doc(db, 'offers', document.id));
      });

      // Wait a moment for deletion to propagate (optional but good for UX)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 3. Add new Hero bikes
      for (const bike of data.collections.bikes) {
        await addDoc(bikesCollection, bike);
      }

      // 4. Add new Hero offers
      for (const offer of data.collections.offers) {
        await addDoc(offersCollection, offer);
      }

      alert('Database updated with Hero MotoCorp data!');
      fetchBikes();
    } catch (error) {
      console.error('Error seeding data:', error);
      alert('Error updating data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch bikes from Firestore
  const fetchBikes = async () => {
    try {
      const bikesCollection = collection(db, 'bikes');
      const bikesSnapshot = await getDocs(bikesCollection);
      const bikesList = bikesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBikes(bikesList);
      setFilteredBikes(bikesList);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bikes:', error);
      setLoading(false);
    }
  };

  // Search functionality - filter bikes by name
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredBikes(bikes);
    } else {
      const filtered = bikes.filter(bike =>
        bike.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredBikes(filtered);
    }
  }, [searchQuery, bikes]);

  // Handle wishlist toggle
  const handleWishlistToggle = async (bikeId) => {
    const isInList = wishlist.includes(bikeId);
    if (isInList) {
      await removeFromWishlist(bikeId);
      setWishlist(wishlist.filter(id => id !== bikeId));
    } else {
      await addToWishlist(bikeId);
      setWishlist([...wishlist, bikeId]);
    }
  };

  // Navigate to bike details
  const handleBikePress = (bike) => {
    navigation.navigate('BikeDetails', { bike });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading bikes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={COLORS.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search bikes..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={COLORS.textSecondary}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Bike List */}
      <FlatList
        data={filteredBikes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BikeCard
            bike={item}
            onPress={() => handleBikePress(item)}
            onWishlistPress={() => handleWishlistToggle(item.id)}
            isInWishlist={wishlist.includes(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={
          <View style={{ padding: 20, alignItems: 'center' }}>
            <TouchableOpacity
              onPress={handleResetDatabase}
              style={{ padding: 10, backgroundColor: COLORS.surface, borderRadius: 8 }}
            >
              <Text style={{ color: COLORS.textSecondary, fontSize: 12 }}>RELOAD HERO DATA (Dev Only)</Text>
            </TouchableOpacity>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No bikes found</Text>
            <TouchableOpacity
              style={[styles.seedButton, { marginTop: 20, backgroundColor: COLORS.primary, padding: 12, borderRadius: 8 }]}
              onPress={handleResetDatabase}
            >
              <Text style={{ color: COLORS.white, fontWeight: 'bold' }}>Load Hero MotoCorp Data</Text>
            </TouchableOpacity>
            <Text style={{ marginTop: 10, fontSize: 12, color: COLORS.textSecondary, textAlign: 'center' }}>
              (Clears existing data & adds Hero bikes)
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    margin: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});

export default HomeScreen;
