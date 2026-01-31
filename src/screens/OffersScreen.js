import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, ActivityIndicator, Animated, Dimensions, StatusBar, TouchableOpacity } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../utils/theme';

const { width } = Dimensions.get('window');

const OffersScreen = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const offersCollection = collection(db, 'offers');
      const offersSnapshot = await getDocs(offersCollection);
      const offersList = offersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Sort by createdAt usually, but here just use list
      setOffers(offersList);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching offers:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const renderOfferCard = ({ item, index }) => {
    const isEven = index % 2 === 0;
    return (
      <TouchableOpacity activeOpacity={0.9} style={styles.offerCard}>
        <View style={styles.imageContainer}>
          <Image
            source={item.image ? { uri: item.image } : { uri: 'https://via.placeholder.com/600x300' }}
            style={styles.offerImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.imageOverlay}
          />
          <View style={styles.badgeContainer}>
            <View style={styles.tagBadge}>
              <Text style={styles.tagText}>LIMITED TIME</Text>
            </View>
          </View>
        </View>

        <View style={styles.contentContainer}>
          <View style={[styles.couponRow, { borderLeftColor: isEven ? COLORS.primary : '#2196F3' }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.offerTitle}>{item.title}</Text>
              <Text style={styles.offerDesc} numberOfLines={2}>{item.description}</Text>
            </View>
            <View style={styles.discountBox}>
              <Text style={[styles.discountText, { color: isEven ? COLORS.primary : '#2196F3' }]}>
                {item.discount?.split(' ')[0]}
              </Text>
              <Text style={styles.offText}>OFF</Text>
            </View>
          </View>

          <View style={styles.footerRow}>
            <View style={styles.validityContainer}>
              <Ionicons name="time-outline" size={14} color={COLORS.textLight} />
              <Text style={styles.validityText}>Valid until: {item.validUntil || 'Fri, 31 Mar'}</Text>
            </View>
            <TouchableOpacity style={[styles.claimBtn, { backgroundColor: isEven ? COLORS.primary : '#2196F3' }]}>
              <Text style={styles.claimText}>CLAIM</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Decorative Side Circles for 'Coupon' look */}
        <View style={[styles.punchHole, styles.punchLeft]} />
        <View style={[styles.punchHole, styles.punchRight]} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Exclusive Deals</Text>
        <Text style={styles.headerSubtitle}>Best offers curated just for you</Text>
      </View>

      {offers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="gift-outline" size={80} color="#E0E0E0" />
          <Text style={styles.emptyTitle}>No Offers Yet</Text>
          <Text style={styles.emptyText}>Stay tuned! Exciting deals are coming your way soon.</Text>
        </View>
      ) : (
        <FlatList
          data={offers}
          keyExtractor={(item) => item.id}
          renderItem={renderOfferCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
    paddingTop: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  offerCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    ...SHADOWS.medium,
    position: 'relative',
  },
  imageContainer: {
    height: 160,
    width: '100%',
    position: 'relative',
  },
  offerImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  badgeContainer: {
    position: 'absolute',
    top: 15,
    left: 15,
  },
  tagBadge: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  contentContainer: {
    padding: 16,
    paddingTop: 20,
  },
  couponRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    paddingLeft: 12,
    marginBottom: 15,
  },
  offerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  offerDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  discountBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 10,
  },
  discountText: {
    fontSize: 24,
    fontWeight: '900',
  },
  offText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.textLight,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    paddingTop: 12,
  },
  validityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  validityText: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  claimBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  claimText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  // Decoration
  punchHole: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F5F5F7', // Match background
    top: 150, // Position at intersection
    zIndex: 10,
  },
  punchLeft: {
    left: -10,
  },
  punchRight: {
    right: -10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginTop: 10,
    width: '70%',
    lineHeight: 20,
  },
});

export default OffersScreen;
