import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, ScrollView, Animated, Dimensions, Image, StatusBar, Modal, TouchableWithoutFeedback } from 'react-native';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { LinearGradient } from 'expo-linear-gradient';
import { db, auth } from '../../firebase';
import data from '../../sample-firestore-data.json';
import BikeCard from '../components/BikeCard';
import CustomLoader from '../components/CustomLoader';
import { getWishlist, addToWishlist, removeFromWishlist } from '../utils/storage';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../utils/theme';

const { width } = Dimensions.get('window');

const CATEGORIES = ['All', 'Motorcycles', 'Scooters', 'Premium'];

const HomeScreen = ({ navigation }) => {
  const [bikes, setBikes] = useState([]);
  const [filteredBikes, setFilteredBikes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  // Animation Values
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [120, 80],
    extrapolate: 'clamp',
  });

  // Fetch bikes from Firestore
  useEffect(() => {
    fetchBikes();
    loadWishlist();
  }, []);

  // Filter Logic
  useEffect(() => {
    let result = bikes;

    // 1. Search Filter
    if (searchQuery.trim() !== '') {
      result = result.filter(bike =>
        bike.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 2. Category Filter
    if (selectedCategory !== 'All') {
      if (selectedCategory === 'Scooters') {
        result = result.filter(bike => bike.specs?.some(s => s.value === 'Scooter' || s.key === 'Type' && s.value === 'Scooter') || bike.name.includes('Pleasure') || bike.name.includes('Destini'));
      } else if (selectedCategory === 'Motorcycles') {
        result = result.filter(bike => !bike.specs?.some(s => s.value === 'Scooter') && !bike.name.includes('Pleasure') && !bike.name.includes('Destini'));
      } else if (selectedCategory === 'Premium') {
        result = result.filter(bike => bike.price > 100000);
      }
    }

    setFilteredBikes(result);
  }, [searchQuery, selectedCategory, bikes]);

  // Load wishlist on mount
  const loadWishlist = async () => {
    const wishlistData = await getWishlist();
    setWishlist(wishlistData);
  };

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

      await fetchBikes(); // Re-fetch
      alert('Database reset successful!');
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
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

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
    return <CustomLoader />;
  }

  // Failsafe: Block access if not verified
  if (auth.currentUser && !auth.currentUser.emailVerified) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: COLORS.background }}>
        <Ionicons name="warning" size={60} color={COLORS.error || '#f44336'} />
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 20, textAlign: 'center' }}>Email Not Verified</Text>
        <Text style={{ textAlign: 'center', marginTop: 10, color: COLORS.textSecondary }}>
          Please verify your email to access this content.
        </Text>
        <TouchableOpacity
          style={{ marginTop: 30, backgroundColor: COLORS.primary, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 }}
          onPress={() => signOut(auth)}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Logout</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Render Offer Item
  const renderOfferItem = ({ item }) => (
    <TouchableOpacity activeOpacity={0.9} style={styles.offerCard}>
      <LinearGradient
        colors={['#FF4D4D', '#B9120E']} // Richer red gradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.offerGradient}
      >
        <View style={styles.offerBadge}>
          <Text style={styles.offerBadgeText}>Limited Time</Text>
        </View>

        <View style={styles.offerContent}>
          <Text style={styles.offerTitle}>{item.title}</Text>
          <Text style={styles.offerDiscount}>{item.discount}</Text>
          <Text style={styles.offerDesc}>{item.description}</Text>

          <View style={styles.claimButton}>
            <Text style={styles.claimButtonText}>Claim Now</Text>
            <Ionicons name="arrow-forward" size={14} color={COLORS.primary} />
          </View>
        </View>

        {/* Decorative elements */}
        <Ionicons name="pricetag" size={100} color="rgba(255,255,255,0.1)" style={styles.offerIconBg} />
        <View style={styles.decorativeCircle} />
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Custom Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>Welcome,</Text>
          <Text style={styles.brandName} numberOfLines={1}>
            {auth.currentUser?.displayName || 'Hero User'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => setShowProfileMenu(true)}
        >
          <Image
            source={{ uri: `https://ui-avatars.com/api/?name=${auth.currentUser?.displayName || 'User'}&background=EE2824&color=fff&size=128&length=1` }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={24} color={COLORS.primary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Find your perfect ride..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={COLORS.textLight}
        />
        {searchQuery.length > 0 ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={24} color={COLORS.textLight} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="options-outline" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Main Content */}
      <FlatList
        data={filteredBikes}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* Categories */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Categories</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryList}>
                {CATEGORIES.map((cat, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setSelectedCategory(cat)}
                    style={[
                      styles.categoryChip,
                      selectedCategory === cat && styles.categoryChipSelected
                    ]}
                  >
                    <Text style={[
                      styles.categoryText,
                      selectedCategory === cat && styles.categoryTextSelected
                    ]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Bike List Header */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>
                {selectedCategory === 'All' ? 'All Bikes' : `${selectedCategory}`} ({filteredBikes.length})
              </Text>
            </View>
          </>
        }
        renderItem={({ item, index }) => (
          <BikeCard
            bike={item}
            onPress={() => handleBikePress(item)}
            onWishlistPress={() => handleWishlistToggle(item.id)}
            isInWishlist={wishlist.includes(item.id)}
            index={index}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={
          <View style={{ padding: 40, alignItems: 'center' }}>
            <TouchableOpacity
              onPress={handleResetDatabase}
              style={{ padding: 10, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border }}
            >
              <Text style={{ color: COLORS.textSecondary, fontSize: 10 }}>RESET DATA</Text>
            </TouchableOpacity>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search" size={50} color={COLORS.textLight} />
            <Text style={styles.emptyText}>No bikes found</Text>
            <TouchableOpacity
              style={[styles.seedButton, { marginTop: 20, backgroundColor: COLORS.primary, padding: 12, borderRadius: 8 }]}
              onPress={handleResetDatabase}
            >
              <Text style={{ color: COLORS.white, fontWeight: 'bold' }}>Load Hero MotoCorp Data</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Profile Menu Modal */}
      <Modal
        visible={showProfileMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowProfileMenu(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowProfileMenu(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.menuContainer}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setShowProfileMenu(false);
                    navigation.navigate('Profile');
                  }}
                >
                  <Ionicons name="person-circle-outline" size={24} color={COLORS.textPrimary} />
                  <Text style={styles.menuText}>My Profile</Text>
                </TouchableOpacity>

                <View style={styles.menuDivider} />

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setShowProfileMenu(false);
                    signOut(auth);
                  }}
                >
                  <Ionicons name="log-out-outline" size={24} color={COLORS.error || '#D32F2F'} />
                  <Text style={[styles.menuText, { color: COLORS.error || '#D32F2F' }]}>Logout</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingTop: 10,
    paddingBottom: 10,
  },
  greeting: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  brandName: {
    fontSize: 26,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    ...SHADOWS.light,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.padding,
    marginVertical: 15, // More vertical spacing
    paddingHorizontal: 16,
    borderRadius: 16,
    height: 55, // Taller
    ...SHADOWS.medium, // Add shadow for floating effect
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  filterButton: {
    padding: 4,
  },
  sectionContainer: {
    marginBottom: 25, // More spacing between sections
    paddingHorizontal: SIZES.padding,
  },
  sectionTitle: {
    fontSize: SIZES.h3,
    fontWeight: '800', // Bolder title
    color: COLORS.textPrimary,
    marginBottom: 15,
    letterSpacing: 0.5,
  },
  carouselContainer: {
    height: 210, // Reduced height
    marginTop: 5,
  },
  carouselContent: {
    paddingHorizontal: 15,
  },
  heroOfferCard: {
    width: width * 0.7, // Reduced width to 70%
    height: 190, // Reduced height
    marginHorizontal: 8,
    borderRadius: 20,
    overflow: 'hidden',
    ...SHADOWS.medium,
    elevation: 8,
  },
  heroGradient: {
    flex: 1,
    padding: 20, // Reduced padding
    position: 'relative',
    // Removed justifyContent: 'space-between' to let content flow
  },
  heroContent: {
    zIndex: 2,
    flex: 1,
    justifyContent: 'center', // Center content vertically
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10, // Reduced margin
  },
  heroBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4, // Reduced padding
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  heroBadgeText: {
    color: COLORS.white,
    fontSize: 10, // Reduced font
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroValid: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11, // Reduced font
    fontWeight: '600',
  },
  heroTitle: {
    fontSize: 18, // Reduced from 20
    color: '#fff',
    fontWeight: '600',
    opacity: 0.95,
    marginBottom: 2,
  },
  heroDiscount: {
    fontSize: 28, // Reduced from 34
    color: '#fff',
    fontWeight: '900',
    letterSpacing: -1,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
    marginBottom: 6,
    lineHeight: 32, // Adjusted line height
  },
  heroDesc: {
    fontSize: 13, // Reduced from 15
    color: 'rgba(255,255,255,0.95)',
    maxWidth: '100%',
    lineHeight: 18,
    marginBottom: 12,
  },
  heroButton: {
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8, // Reduced padding
    paddingHorizontal: 16, // Reduced padding
    borderRadius: 30,
    alignSelf: 'flex-start',
    ...SHADOWS.light,
  },
  heroButtonText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    marginRight: 6,
    fontSize: 12, // Reduced from 14
  },
  heroIconBg: {
    position: 'absolute',
    right: -20,
    bottom: -30,
    transform: [{ rotate: '-10deg' }],
  },
  patternDots: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.3,
  },
  patternDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  categoryList: {
    flexDirection: 'row',
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
    borderRadius: 25,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryChipSelected: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.primary,
    ...SHADOWS.light,
  },
  categoryText: {
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  categoryTextSelected: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: 40,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  menuContainer: {
    backgroundColor: COLORS.white,
    width: 200,
    marginTop: 80, // Offset from top
    marginRight: 20, // Offset from right
    borderRadius: 12,
    ...SHADOWS.medium,
    paddingVertical: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#EEEEEE',
  },
});

export default HomeScreen;
