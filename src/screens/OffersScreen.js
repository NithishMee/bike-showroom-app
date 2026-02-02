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
        {/* Top Section: Image & Badge */}
        <View style={styles.imageContainer}>
          <Image
            source={item.image ? { uri: item.image } : { uri: 'https://via.placeholder.com/600x300' }}
            style={styles.offerImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.imageOverlay}
          />
          <View style={styles.badgeContainer}>
            <View style={styles.tagBadge}>
              <Text style={styles.tagText}>LIMITED TIME</Text>
            </View>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.contentContainer}>
          <View style={styles.detailsRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.offerTitle}>{item.title}</Text>
              <Text style={styles.offerDesc} numberOfLines={2}>{item.description}</Text>
            </View>
            <View style={styles.discountBadge}>
              <Text style={styles.discountValue}>{item.discount?.split(' ')[0]}</Text>
              <Text style={styles.discountLabel}>OFF</Text>
            </View>
          </View>

          {/* Dashed Divider */}
          <View style={styles.dashedDivider}>
            {[...Array(20)].map((_, i) => (
              <View key={i} style={styles.dash} />
            ))}
          </View>

          <View style={styles.footerRow}>
            <View style={styles.validityContainer}>
              <Ionicons name="calendar-outline" size={14} color="#666" />
              <Text style={styles.validityText}>Valid until: {item.validUntil || '31 Mar 2026'}</Text>
            </View>
            <TouchableOpacity style={styles.claimButton}>
              <LinearGradient
                colors={[COLORS.primary, '#D32F2F']}
                style={styles.claimButtonGradient}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              >
                <Text style={styles.claimText}>CLAIM OFFER</Text>
                <Ionicons name="arrow-forward" size={14} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Punch Holes for Coupon Effect */}
        <View style={[styles.punchHole, styles.punchLeft]} />
        <View style={[styles.punchHole, styles.punchRight]} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Premium Red Gradient Header */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={['#B71C1C', '#D32F2F', '#E53935']}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.patternDots}>
            {[...Array(15)].map((_, i) => (
              <View key={i} style={[styles.patternDot, { left: Math.random() * width, top: Math.random() * 100, opacity: Math.random() * 0.4 }]} />
            ))}
          </View>

          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Exclusive Offers</Text>
            <Text style={styles.headerSubtitle}>Best deals curated for you</Text>
          </View>
        </LinearGradient>
        <View style={styles.curveMask} />
      </View>

      {offers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="gift-outline" size={50} color={COLORS.primary} />
          </View>
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    marginBottom: 20,
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 40, // Compact height
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    alignItems: 'center',
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    marginTop: -20, // Overlap header slightly
  },
  offerCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 20,
    ...SHADOWS.medium,
    overflow: 'hidden', // Important for image
    position: 'relative',
  },
  imageContainer: {
    height: 150,
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
    ...SHADOWS.small,
  },
  tagText: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    color: COLORS.primary,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 15,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  offerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  offerDesc: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  discountBadge: {
    backgroundColor: '#FFF8E1',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFECB3',
    marginLeft: 10,
  },
  discountValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FF8F00',
  },
  discountLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FF8F00',
  },
  dashedDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    marginBottom: 15,
    opacity: 0.3,
  },
  dash: {
    width: 8,
    height: 1,
    backgroundColor: '#000',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  validityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F5F5F5',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  validityText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
  },
  claimButton: {
    borderRadius: 20,
    overflow: 'hidden',
    ...SHADOWS.light,
  },
  claimButtonGradient: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
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
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F5F5F7', // Match screen background invisible look
    top: 140, // Position at intersection of image and content approx
    zIndex: 10,
  },
  punchLeft: {
    left: -12,
  },
  punchRight: {
    right: -12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptyText: {
    textAlign: 'center',
    color: '#777',
    width: '70%',
    lineHeight: 20,
  },
  patternDots: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  patternDot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#fff',
  }
});

export default OffersScreen;
