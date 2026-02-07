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
    return (
      <TouchableOpacity activeOpacity={0.95} style={styles.heroOfferCard}>
        <LinearGradient
          colors={index % 2 === 0 ? ['#E53935', '#B71C1C'] : ['#1E88E5', '#0D47A1']} // Alternating gradients
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroGradient}
        >
          {/* Background Pattern */}
          <View style={styles.patternDots}>
            {[...Array(20)].map((_, i) => (
              <View key={i} style={[styles.patternDot, { left: Math.random() * 300, top: Math.random() * 150, opacity: Math.random() * 0.3 }]} />
            ))}
          </View>

          <View style={styles.heroContent}>
            <View style={styles.heroHeader}>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>Limited Deal</Text>
              </View>
              <Text style={styles.heroValid}>{item.validUntil === 'Always On' ? 'Always Active' : `Ends ${item.validUntil}`}</Text>
            </View>

            <Text style={styles.heroTitle}>{item.title}</Text>
            <Text style={styles.heroDiscount}>{item.discount}</Text>
            <Text style={styles.heroDesc} numberOfLines={2}>{item.description}</Text>


          </View>

          {/* Hero Icon */}
          <Ionicons
            name={index % 2 === 0 ? "gift" : "trophy"}
            size={140}
            color="rgba(255,255,255,0.15)"
            style={styles.heroIconBg}
          />
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Premium Red Gradient Header */}
      <View style={{ height: 20 }} />

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
    backgroundColor: COLORS.primary, // Fallback
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 30,
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
    paddingBottom: 40,
  },
  // New Hero Card Styles
  heroOfferCard: {
    width: '100%',
    height: 240, // Fixed height for uniformity
    marginBottom: 20,
    borderRadius: 24,
    overflow: 'hidden',
    ...SHADOWS.medium,
    elevation: 5,
  },
  heroGradient: {
    flex: 1,
    padding: 24,
    position: 'relative',
    justifyContent: 'center',
  },
  heroContent: {
    zIndex: 2,
    flex: 1,
    justifyContent: 'flex-start', // Avoid pushing text to edge
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  heroBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  heroValid: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '600',
  },
  heroTitle: {
    fontSize: 22,
    color: '#fff',
    fontWeight: '700',
    marginBottom: 2,
    marginTop: 10,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroDiscount: {
    fontSize: 36,
    color: '#fff',
    fontWeight: '900',
    letterSpacing: -1,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
    marginBottom: 5,
  },
  heroDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.95)',
    maxWidth: '85%',
    lineHeight: 20,
    marginBottom: 15, // Space at bottom
  },
  heroButton: {
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 30,
    alignSelf: 'flex-start',
    marginTop: 10, // Ensure spacing from description
    ...SHADOWS.light,
  },
  heroButtonText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    marginRight: 8,
    fontSize: 13,
  },
  heroIconBg: {
    position: 'absolute',
    right: -20,
    bottom: -30,
    transform: [{ rotate: '-15deg' }],
    opacity: 0.9,
  },
  patternDots: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.4,
  },
  headerPatternDots: {
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
});

export default OffersScreen;
