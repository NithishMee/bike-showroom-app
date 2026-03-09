import React, { useRef, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getBikeImage } from '../utils/imageMapper';
import { COLORS, SIZES, SHADOWS } from '../utils/theme';
import { LinearGradient } from 'expo-linear-gradient';

import { db, auth } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const { width } = Dimensions.get('window');

const BikeDetailsScreen = ({ route, navigation }) => {
  const { bike } = route.params;
  const scrollY = useRef(new Animated.Value(0)).current;
  const [activeImage, setActiveImage] = useState(0);
  const [isBooked, setIsBooked] = useState(false);

  // Animation for header
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const imageScale = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1.2, 1],
    extrapolate: 'clamp',
  });

  // Check if user has already booked this bike
  React.useEffect(() => {
    const checkBookingStatus = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const q = query(
          collection(db, 'testRides'),
          where('userId', '==', user.uid),
          where('bikeName', '==', bike.name)
        );

        const querySnapshot = await getDocs(q);
        let hasActiveBooking = false;
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (!data.preferredDate) return;

          // Parse preferredDate "DD/MM/YYYY"
          const [day, month, year] = data.preferredDate.split('/');
          
          let endHour = 23;
          let endMinute = 59;
          
          if (data.preferredTime) {
             try {
                // e.g. "09:00 AM - 11:00 AM"
                const endTimeStr = data.preferredTime.split(" - ")[1];
                const [time, modifier] = endTimeStr.split(" ");
                let [hours, minutes] = time.split(":");
                hours = parseInt(hours, 10);
                if (hours === 12) {
                   hours = modifier === "AM" ? 0 : 12;
                } else if (modifier === "PM") {
                   hours += 12;
                }
                endHour = hours;
                endMinute = parseInt(minutes, 10);
             } catch(e) { }
          }
          
          const bookingEndTime = new Date(year, month - 1, day, endHour, endMinute, 0, 0);
          const now = new Date();
          
          // If the booking's end time is in the future, the user has an active booking
          if (bookingEndTime > now) {
             hasActiveBooking = true;
          }
        });

        setIsBooked(hasActiveBooking);
      } catch (error) {
        console.error("Error checking booking status:", error);
      }
    };

    // Check immediately and also add a listener/refresh logic if needed
    // For now, we check on mount. If we come back from booking screen, we might need value update.
    const unsubscribe = navigation.addListener('focus', () => {
      checkBookingStatus();
    });

    return unsubscribe;
  }, [navigation, bike.name]);

  // Ensure images is an array
  const bikeImages = bike.images || (bike.image ? [bike.image] : []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Animated Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <Text style={styles.headerTitle}>{bike.name}</Text>
      </Animated.View>

      {/* Back Button (Always Visible) */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
      </TouchableOpacity>

      <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Gallery Section */}
        <Animated.View style={[styles.imageContainer, { transform: [{ scale: imageScale }] }]}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const slide = Math.ceil(e.nativeEvent.contentOffset.x / e.nativeEvent.layoutMeasurement.width);
              setActiveImage(slide);
            }}
          >
            {bikeImages.length > 0 ? (
              bikeImages.map((img, index) => (
                <Image
                  key={index}
                  source={getBikeImage(img) || { uri: 'https://via.placeholder.com/400' }}
                  style={styles.image}
                  resizeMode="contain"
                />
              ))
            ) : (
              <Image
                source={{ uri: 'https://via.placeholder.com/400' }}
                style={styles.image}
                resizeMode="contain"
              />
            )}
          </ScrollView>

          {/* Pagination Dots */}
          {bikeImages.length > 1 && (
            <View style={styles.pagination}>
              {bikeImages.map((_, i) => (
                <View key={i} style={[styles.dot, i === activeImage && styles.activeDot]} />
              ))}
            </View>
          )}
        </Animated.View>

        {/* Content Section */}
        <View style={styles.contentContainer}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{bike.name}</Text>
              <Text style={styles.category}>{bike.category || 'Motorcycle'}</Text>
            </View>
            <View>
              <Text style={styles.priceLabel}>Ex-showroom</Text>
              <Text style={styles.price}>₹ {bike.price?.toLocaleString()}</Text>
            </View>
          </View>

          <Text style={styles.description}>{bike.description}</Text>

          {/* Quick Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Ionicons name="speedometer" size={24} color={COLORS.primary} />
              <Text style={styles.statValue}>{bike.engineCC} cc</Text>
              <Text style={styles.statLabel}>Engine</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="flask" size={24} color={COLORS.primary} />
              <Text style={styles.statValue}>{bike.mileage} kmpl</Text>
              <Text style={styles.statLabel}>Mileage</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="cog" size={24} color={COLORS.primary} />
              <Text style={styles.statValue}>{bike.specs?.find(s => s.key === 'Kerb Weight')?.value || bike.weight || 'N/A'}</Text>
              <Text style={styles.statLabel}>Weight</Text>
            </View>
          </View>

          {/* Technical Specs */}
          <Text style={styles.sectionTitle}>Technical Specifications</Text>
          <View style={styles.specsContainer}>
            {bike.specs?.map((spec, index) => (
              <View key={index} style={styles.specRow}>
                <Text style={styles.specKey}>{spec.key}</Text>
                <Text style={styles.specValue}>{spec.value}</Text>
              </View>
            ))}
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            style={[styles.bookButton, isBooked && styles.bookButtonDisabled]}
            disabled={isBooked}
            onPress={() => navigation.navigate('TestRideBooking', {
              bikeName: bike.name,
              bikeImage: bike.images && bike.images.length > 0 ? bike.images[0] : bike.image
            })}
          >
            {isBooked ? (
              <View style={styles.disabledButtonContent}>
                <Text style={styles.bookButtonTextDisabled}>Booked</Text>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.textSecondary} />
              </View>
            ) : (
              <LinearGradient
                colors={COLORS.primaryGradient}
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.bookButtonText}>Book Test Ride</Text>
                <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
              </LinearGradient>
            )}
          </TouchableOpacity>
        </View>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 90,
    backgroundColor: 'rgba(255,255,255,0.95)',
    zIndex: 10,
    paddingTop: 45,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: SIZES.h3,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 20,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 8,
    ...SHADOWS.light,
  },
  imageContainer: {
    height: 350,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: width,
    height: 300,
  },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center', // Center the pagination dots
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.textLight,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: COLORS.primary,
    width: 20,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    padding: SIZES.padding,
    ...SHADOWS.dark,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  name: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  category: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  priceLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'right',
  },
  price: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.primary,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: 25,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: SIZES.radius,
    marginBottom: 25,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  sectionTitle: {
    fontSize: SIZES.h3,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 15,
  },
  specsContainer: {
    marginBottom: 30,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceDark,
  },
  specKey: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  specValue: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  bookButton: {
    width: '100%',
    height: 55,
    borderRadius: SIZES.radius,
    overflow: 'hidden',
    marginTop: 10,
    ...SHADOWS.medium,
  },
  gradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
    marginRight: 10,
  },
  bookButtonDisabled: {
    backgroundColor: '#E0E0E0',
    shadowOpacity: 0,
    elevation: 0,
  },
  disabledButtonContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookButtonTextDisabled: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    marginRight: 10,
  },
});

export default BikeDetailsScreen;
