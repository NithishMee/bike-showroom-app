import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import BikeCard from '../components/BikeCard';
import { getWishlist, removeFromWishlist } from '../utils/storage';

const WishlistScreen = ({ navigation }) => {
  const [wishlistIds, setWishlistIds] = useState([]);
  const [wishlistBikes, setWishlistBikes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWishlist();
  }, []);

  // Reload when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadWishlist();
    });
    return unsubscribe;
  }, [navigation]);

  const loadWishlist = async () => {
    try {
      const ids = await getWishlist();
      setWishlistIds(ids);

      if (ids.length === 0) {
        setWishlistBikes([]);
        setLoading(false);
        return;
      }

      // Fetch bike details for wishlist items
      const bikesCollection = collection(db, 'bikes');
      const bikesSnapshot = await getDocs(bikesCollection);
      const allBikes = bikesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const filteredBikes = allBikes.filter(bike => ids.includes(bike.id));
      setWishlistBikes(filteredBikes);
      setLoading(false);
    } catch (error) {
      console.error('Error loading wishlist:', error);
      setLoading(false);
    }
  };

  const handleWishlistToggle = async (bikeId) => {
    await removeFromWishlist(bikeId);
    setWishlistIds(wishlistIds.filter(id => id !== bikeId));
    setWishlistBikes(wishlistBikes.filter(bike => bike.id !== bikeId));
  };

  const handleBikePress = (bike) => {
    navigation.navigate('BikeDetails', { bike });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading wishlist...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {wishlistBikes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>❤️</Text>
          <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
          <Text style={styles.emptyText}>
            Start adding bikes to your wishlist to see them here
          </Text>
        </View>
      ) : (
        <FlatList
          data={wishlistBikes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <BikeCard
              bike={item}
              onPress={() => handleBikePress(item)}
              onWishlistPress={() => handleWishlistToggle(item.id)}
              isInWishlist={true}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default WishlistScreen;
