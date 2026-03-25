import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar, 
  Dimensions,
  Platform,
  ImageBackground
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../utils/theme';

const { width, height } = Dimensions.get('window');

const OfferDetailsScreen = ({ route, navigation }) => {
  const { offer } = route.params;

  // Premium dark red/black gradient aesthetic
  const isAltMode = parseInt(offer.id || '0', 36) % 2 === 0;
  
  // Use a very premium dark theme approach for the header
  const gradientColors = isAltMode ? ['#000000', '#1A1A1A'] : ['#EE2824', '#8A1512'];
  const accentColor = isAltMode ? COLORS.primary : '#FFFFFF';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Premium Header/Hero Area */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          {/* subtle pattern overlay */}
          <View style={styles.patternDots}>
            {[...Array(30)].map((_, i) => (
              <View 
                key={i} 
                style={[
                  styles.patternDot, 
                  { 
                    left: Math.random() * width, 
                    top: Math.random() * (height * 0.4), 
                    opacity: Math.random() * 0.2,
                    backgroundColor: isAltMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.3)'
                  }
                ]} 
              />
            ))}
          </View>

          {/* Large decorative icon fading into background */}
          <Ionicons 
            name="pricetags" 
            size={width * 0.8} 
            color={isAltMode ? "rgba(238, 40, 36, 0.05)" : "rgba(255, 255, 255, 0.08)"} 
            style={styles.bgIconLarge} 
          />
          
          <SafeAreaView>
            <View style={styles.headerTop}>
              <TouchableOpacity 
                onPress={() => navigation.goBack()} 
                style={styles.backButton}
              >
                <Ionicons name="chevron-back" size={28} color={COLORS.white} />
              </TouchableOpacity>
              <View style={styles.headerPill}>
                <Ionicons name="star" size={14} color="#FFD700" style={{ marginRight: 6 }} />
                <Text style={styles.headerPillText}>Premium Offer</Text>
              </View>
              {/* Balance for back button */}
              <View style={{ width: 44 }} />
            </View>

            <View style={styles.heroContent}>
              <Text style={styles.discountText}>{offer.discount}</Text>
              <Text style={styles.titleText}>{offer.title}</Text>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>

      {/* Main Content Area (Overlapping the hero) */}
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        bounces={true}
      >
        <View style={styles.mainCard}>
          
          {/* Validity Row */}
          <View style={styles.validityContainer}>
            <View style={styles.validityIconBox}>
                <Ionicons name="timer-outline" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.validityTextContainer}>
              <Text style={styles.validityLabel}>Valid Until</Text>
              <Text style={styles.validityValue}>
                {offer.validUntil === 'Always On' ? 'Always Active' : offer.validUntil}
              </Text>
            </View>
            {offer.validUntil !== 'Always On' && (
              <View style={styles.urgencyBadge}>
                <Text style={styles.urgencyText}>Ending Soon</Text>
              </View>
            )}
          </View>

          <View style={styles.divider} />

          {/* Description Segment */}
          <Text style={styles.sectionTitle}>Offer Details</Text>
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

        {/* Spacing for bottom CTA */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Floating Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={COLORS.primaryGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.actionGradient}
          >
            <Text style={styles.actionButtonText}>View Eligible Bikes</Text>
            <Ionicons name="arrow-forward" size={22} color={COLORS.white} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Top spacing wrapper
const SafeAreaView = ({ children }) => (
  <View style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 15 }}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7', 
  },
  headerContainer: {
    height: Platform.OS === 'ios' ? height * 0.40 : height * 0.44, 
    width: '100%',
  },
  headerGradient: {
    flex: 1,
  },
  patternDots: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  patternDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  bgIconLarge: {
    position: 'absolute',
    right: -width * 0.2,
    top: height * 0.05,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerPillText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  heroContent: {
    paddingHorizontal: 24,
    paddingTop: height * 0.02,
  },
  discountText: {
    fontSize: 54,
    color: COLORS.white,
    fontWeight: '900',
    letterSpacing: -2,
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  titleText: {
    fontSize: 24,
    color: 'rgba(255,255,255,0.95)',
    fontWeight: '600',
    lineHeight: 32,
    maxWidth: '90%',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  mainCard: {
    backgroundColor: COLORS.white,
    borderRadius: 28,
    padding: 24,
    marginTop: -50, // This is what pulls the card up over the header
    ...SHADOWS.dark,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
    marginBottom: 20,
  },
  validityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  validityIconBox: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: 'rgba(238, 40, 36, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  validityTextContainer: {
    flex: 1,
  },
  validityLabel: {
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: '600',
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
    backgroundColor: '#FFF0F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE0E0',
  },
  urgencyText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 16,
    letterSpacing: 0.2,
  },
  description: {
    fontSize: 15,
    color: '#444',
    lineHeight: 24,
    marginBottom: 30,
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
    borderColor: '#F0F0F0',
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
    marginBottom: 2,
  },
  perkSubtext: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: '600',
    textAlign: 'center',
  },
  termsContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  termsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  termsTitle: {
    fontSize: 15,
    fontWeight: '700',
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
    marginRight: 10,
  },
  termText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    ...SHADOWS.medium,
    shadowOffset: { width: 0, height: -4 },
  },
  actionButton: {
    width: '100%',
    height: 60,
    borderRadius: 16,
    overflow: 'hidden',
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
    marginRight: 12,
    letterSpacing: 0.5,
  },
});

export default OfferDetailsScreen;
