import React, { useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { getBikeImage } from '../utils/imageMapper';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../utils/theme';

const BikeCard = ({ bike, onPress, onWishlistPress, isInWishlist, index }) => {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const imageSource = getBikeImage(bike.images?.[0]);

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[
      styles.cardContainer,
      { transform: [{ scale: scaleValue }] },
    ]}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.touchable}
      >
        {/* Wishlist Button */}
        <TouchableOpacity style={styles.wishlistButton} onPress={onWishlistPress}>
          <Ionicons
            name={isInWishlist ? "heart" : "heart-outline"}
            size={22}
            color={isInWishlist ? COLORS.primary : COLORS.textSecondary}
          />
        </TouchableOpacity>

        {/* Image Section */}
        <View style={styles.imageContainer}>
          <Image
            source={imageSource || { uri: 'https://via.placeholder.com/300' }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        {/* Info Section */}
        <View style={styles.infoContainer}>
          <Text style={styles.name} numberOfLines={1}>{bike.name}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Ex-showroom</Text>
            <Text style={styles.price}>₹ {bike.price?.toLocaleString()}</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Ionicons name="speedometer-outline" size={14} color={COLORS.textSecondary} />
              <Text style={styles.statText}>{bike.engineCC} cc</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="flask-outline" size={14} color={COLORS.textSecondary} />
              <Text style={styles.statText}>{bike.mileage} kmpl</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.viewButton} onPress={onPress}>
            <Text style={styles.viewButtonText}>View Details</Text>
            <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius * 1.5,
    marginVertical: 10,
    marginHorizontal: 5,
    ...SHADOWS.medium,
    elevation: 5, // Android shadow
  },
  touchable: {
    padding: 15,
  },
  wishlistButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 10,
    backgroundColor: COLORS.surface,
    padding: 8,
    borderRadius: 20,
    ...SHADOWS.light,
  },
  imageContainer: {
    height: 180,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    paddingHorizontal: 5,
  },
  name: {
    fontSize: SIZES.h3,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginRight: 6,
  },
  price: {
    fontSize: SIZES.h3,
    fontWeight: '700',
    color: COLORS.primary,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statText: {
    marginLeft: 4,
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceDark,
    marginTop: 5,
  },
  viewButtonText: {
    color: COLORS.primary,
    fontWeight: '700',
    marginRight: 5,
    fontSize: 14,
  }
});

export default BikeCard;
