import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar, 
  Platform,
  Animated,
  Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../utils/theme';

const OfferDetailsScreen = ({ route, navigation }) => {
  const { offer } = route.params;

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(30)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })
    ]).start();
  }, [fadeAnim, translateYAnim]);

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const isAltMode = parseInt(offer.id || '0', 36) % 2 === 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

      {/* Floating Back Button */}
      <TouchableOpacity 
        onPress={() => navigation.goBack()} 
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
      </TouchableOpacity>

      {/* Main Content Area */}
      <Animated.ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        bounces={true}
        style={{ opacity: fadeAnim, transform: [{ translateY: translateYAnim }] }}
      >
        <View style={styles.mainCard}>
          
          {/* Header info moved to card */}
          <View style={styles.titleSection}>
            <View style={styles.discountBadge}>
               <Text style={styles.discountText}>{offer.discount}</Text>
            </View>
            <Text style={styles.titleText}>{offer.title}</Text>
          </View>

          {/* Validity Row */}
          <View style={styles.validityContainer}>
            <LinearGradient
               colors={['rgba(238, 40, 36, 0.1)', 'rgba(238, 40, 36, 0.05)']}
               style={styles.validityIconBox}
            >
                <Ionicons name="timer-outline" size={24} color={COLORS.primary} />
            </LinearGradient>
            <View style={styles.validityTextContainer}>
              <Text style={styles.validityLabel}>Valid Until</Text>
              <Text style={styles.validityValue}>
                {offer.validUntil === 'Always On' ? 'Always Active' : offer.validUntil}
              </Text>
            </View>
            {offer.validUntil !== 'Always On' && (
              <View style={styles.urgencyBadge}>
                <View style={styles.pulsingDot} />
                <Text style={styles.urgencyText}>Ending Soon</Text>
              </View>
            )}
          </View>

          <View style={styles.divider} />

          {/* Description Segment */}
          <Text style={styles.sectionTitle}>About this offer</Text>
          <Text style={styles.description}>{offer.description}</Text>

          {/* Value Props Grid */}
          <View style={styles.perksGrid}>
            <View style={styles.perkBox}>
              <View style={[styles.perkIconWrapper, { backgroundColor: 'rgba(238, 40, 36, 0.1)' }]}>
                <Ionicons name="flash" size={22} color={COLORS.primary} />
              </View>
              <Text style={styles.perkText}>Instant</Text>
              <Text style={styles.perkSubtext}>Application</Text>
            </View>
            
            <View style={styles.perkBox}>
              <View style={[styles.perkIconWrapper, { backgroundColor: 'rgba(33, 150, 243, 0.1)' }]}>
                <Ionicons name="shield-checkmark" size={22} color="#2196F3" />
              </View>
              <Text style={styles.perkText}>100%</Text>
              <Text style={styles.perkSubtext}>Verified</Text>
            </View>

            <View style={styles.perkBox}>
              <View style={[styles.perkIconWrapper, { backgroundColor: 'rgba(76, 175, 80, 0.1)' }]}>
                <Ionicons name="leaf" size={22} color="#4CAF50" />
              </View>
              <Text style={styles.perkText}>Zero</Text>
              <Text style={styles.perkSubtext}>Hidden Fees</Text>
            </View>
          </View>

          {/* Premium Terms Box */}
          <View style={styles.termsContainer}>
             <View style={styles.termsHeaderRow}>
               <Ionicons name="information-circle-outline" size={20} color={COLORS.textSecondary} />
               <Text style={styles.termsTitle}>Important Terms</Text>
             </View>
             <View style={styles.termItem}>
                <View style={styles.termDot} />
                <Text style={styles.termText}>Offer valid exclusively at participating Hero Motocorp dealerships.</Text>
             </View>
             <View style={styles.termItem}>
                <View style={styles.termDot} />
                <Text style={styles.termText}>Cannot be combined with other ongoing corporate or regional schemes.</Text>
             </View>
             <View style={styles.termItem}>
                <View style={styles.termDot} />
                <Text style={styles.termText}>Management reserves the right to withdraw the offer without prior notice.</Text>
             </View>
          </View>

        </View>

        {/* Bottom padding */}
        <View style={{ height: 40 }} />
      </Animated.ScrollView>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB', 
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'android' ? StatusBar.currentHeight + 15 : 55,
    left: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  scrollContent: {
    padding: 16,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 80 : 120,
  },
  mainCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    ...SHADOWS.medium,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 20,
  },
  titleSection: {
    marginBottom: 24,
  },
  discountBadge: {
    backgroundColor: 'rgba(238, 40, 36, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  discountText: {
    fontSize: 28,
    color: COLORS.primary,
    fontWeight: '900',
    letterSpacing: -1,
  },
  titleText: {
    fontSize: 24,
    color: COLORS.textPrimary,
    fontWeight: '800',
    lineHeight: 32,
  },
  validityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  validityIconBox: {
    width: 50,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  validityTextContainer: {
    flex: 1,
  },
  validityLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  validityValue: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: '800',
  },
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  pulsingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginRight: 6,
  },
  urgencyText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F2F5',
    marginVertical: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  description: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 24,
    marginBottom: 30,
    fontWeight: '500',
  },
  perksGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  perkBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FAFAFC',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 16,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#F0F2F5',
  },
  perkIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  perkText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  perkSubtext: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: '600',
    textAlign: 'center',
  },
  termsContainer: {
    backgroundColor: '#FAFAFC',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F0F2F5',
  },
  termsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  termsTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  termItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  termDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.textLight,
    marginTop: 8,
    marginRight: 12,
  },
  termText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
    fontWeight: '500',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    ...SHADOWS.dark,
    shadowOffset: { width: 0, height: -8 },
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 20,
  },
  actionButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  actionGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '800',
    marginRight: 10,
    letterSpacing: 0.5,
  },
});

export default OfferDetailsScreen;
