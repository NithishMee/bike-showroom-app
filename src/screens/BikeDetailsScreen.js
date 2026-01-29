import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { addToWishlist, removeFromWishlist, isInWishlist } from '../utils/storage';
import { COLORS, SHADOWS } from '../utils/theme';

const BikeDetailsScreen = ({ route, navigation }) => {
  const bike = route?.params?.bike;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [inWishlist, setInWishlist] = useState(false);

  useEffect(() => {
    if (bike) {
      checkWishlistStatus();
    }
  }, [bike]);

  const checkWishlistStatus = async () => {
    const status = await isInWishlist(bike.id);
    setInWishlist(status);
  };

  const handleWishlistToggle = async () => {
    if (inWishlist) {
      await removeFromWishlist(bike.id);
      setInWishlist(false);
      Alert.alert('Removed', 'Bike removed from wishlist');
    } else {
      await addToWishlist(bike.id);
      setInWishlist(true);
      Alert.alert('Added', 'Bike added to wishlist');
    }
  };

  const handleEnquireNow = () => {
    navigation.navigate('EnquiryForm', { bikeName: bike.name });
  };

  const handleBookTestRide = () => {
    navigation.navigate('TestRideBooking', { bikeName: bike.name });
  };

  if (!bike) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Bike information not available</Text>
      </View>
    );
  }

  const images = bike.images && bike.images.length > 0 ? bike.images : ['https://via.placeholder.com/400'];

  return (
    <ScrollView style={styles.container}>
      {/* Image Gallery */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: images[currentImageIndex] }}
          style={styles.mainImage}
          resizeMode="cover"
        />
        {images.length > 1 && (
          <View style={styles.imageIndicators}>
            {images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  currentImageIndex === index && styles.indicatorActive
                ]}
              />
            ))}
          </View>
        )}
        {images.length > 1 && (
          <>
            <TouchableOpacity
              style={[styles.imageNavButton, styles.imageNavButtonLeft]}
              onPress={() => setCurrentImageIndex(
                currentImageIndex > 0 ? currentImageIndex - 1 : images.length - 1
              )}
            >
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.imageNavButton, styles.imageNavButtonRight]}
              onPress={() => setCurrentImageIndex(
                currentImageIndex < images.length - 1 ? currentImageIndex + 1 : 0
              )}
            >
              <Ionicons name="chevron-forward" size={24} color="#fff" />
            </TouchableOpacity>
          </>
        )}
        <TouchableOpacity style={styles.wishlistButton} onPress={handleWishlistToggle}>
          <Ionicons
            name={inWishlist ? 'heart' : 'heart-outline'}
            size={28}
            color={inWishlist ? '#FF3B30' : '#fff'}
          />
        </TouchableOpacity>
      </View>

      {/* Bike Info */}
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.name}>{bike.name}</Text>
          <Text style={styles.price}>₹{bike.price?.toLocaleString() || 'N/A'}</Text>
        </View>

        {/* Description First */}
        {bike.description && (
          <View style={styles.descriptionSection}>
            <Text style={styles.description}>{bike.description}</Text>
          </View>
        )}

        <Text style={styles.sectionHeader}>Performance Graph</Text>
        {/* Key Specs Grid */}
        <View style={styles.specsGrid}>
          <View style={styles.specCard}>
            <Ionicons name="speedometer" size={24} color={COLORS.primary} />
            <Text style={styles.specValue}>{bike.mileage || '--'} kmpl</Text>
            <Text style={styles.specLabel}>Mileage</Text>
          </View>
          <View style={styles.specCard}>
            <Ionicons name="flash" size={24} color={COLORS.primary} />
            <Text style={styles.specValue}>{bike.engineCC || '--'} CC</Text>
            <Text style={styles.specLabel}>Engine</Text>
          </View>
          <View style={styles.specCard}>
            <Ionicons name="hardware-chip" size={24} color={COLORS.primary} />
            <Text style={styles.specValue}>{bike.specs?.find(s => s.key === 'Weight')?.value || '--'}</Text>
            <Text style={styles.specLabel}>Weight</Text>
          </View>
          <View style={styles.specCard}>
            <Ionicons name="cog" size={24} color={COLORS.primary} />
            <Text style={styles.specValue}>{bike.specs?.find(s => s.key === 'Transmission')?.value || '--'}</Text>
            <Text style={styles.specLabel}>Gearbox</Text>
          </View>
        </View>

        {/* Detailed Specs List */}
        {bike.specs && bike.specs.length > 0 && (
          <View style={styles.specsSection}>
            <Text style={styles.sectionHeader}>Full Specifications</Text>
            {bike.specs.map((spec, index) => (
              <View key={index} style={styles.specRow}>
                <Text style={styles.specKey}>{spec.key}</Text>
                <Text style={styles.specValueRow}>{spec.value}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.button, styles.enquireButton]}
            onPress={handleEnquireNow}
          >
            <Text style={styles.buttonText}>Enquire Now</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.testRideButton]}
            onPress={handleBookTestRide}
          >
            <Text style={[styles.buttonText, styles.testRideButtonText]}>Book Test Ride</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    position: 'relative',
    backgroundColor: COLORS.secondary,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  indicatorActive: {
    backgroundColor: COLORS.white,
    width: 24,
  },
  imageNavButton: {
    position: 'absolute',
    top: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  imageNavButtonLeft: {
    left: 16,
  },
  imageNavButtonRight: {
    right: 16,
  },
  wishlistButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 10,
  },
  content: {
    padding: 20,
  },
  headerRow: {
    marginBottom: 16,
  },
  name: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 16,
    marginBottom: 12,
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  specCard: {
    width: '48%', // Approx 2 columns
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  specLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  specValue: { // For the card
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 8,
    textAlign: 'center',
  },
  specsSection: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  specKey: {
    fontSize: 15,
    color: COLORS.textSecondary,
    flex: 1,
  },
  specValueRow: { // For the list
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
    textAlign: 'right',
  },
  descriptionSection: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  description: {
    fontSize: 16,
    color: COLORS.textPrimary,
    lineHeight: 24,
  },
  actionButtons: {
    gap: 12,
    marginTop: 8,
    marginBottom: 40,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  enquireButton: {
    backgroundColor: COLORS.primary,
  },
  testRideButton: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  testRideButtonText: {
    color: COLORS.primary,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 50,
  },
});

export default BikeDetailsScreen;
