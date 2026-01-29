import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../utils/theme';

const BikeCard = ({ bike, onPress, onWishlistPress, isInWishlist }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: bike.images && bike.images[0] ? bike.images[0] : 'https://via.placeholder.com/300' }}
          style={styles.image}
          resizeMode="cover"
        />
        <TouchableOpacity
          style={styles.wishlistButton}
          onPress={onWishlistPress}
        >
          <Ionicons
            name={isInWishlist ? 'heart' : 'heart-outline'}
            size={22}
            color={isInWishlist ? COLORS.primary : COLORS.textPrimary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.name}>{bike.name}</Text>
        <Text style={styles.price}>₹{bike.price?.toLocaleString() || 'N/A'}</Text>

        <View style={styles.specs}>
          <View style={styles.specItem}>
            <Ionicons name="speedometer-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.specText}>{bike.mileage || 'N/A'} kmpl</Text>
          </View>
          <View style={styles.seperator} />
          <View style={styles.specItem}>
            <Ionicons name="flash-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.specText}>{bike.engineCC || 'N/A'} CC</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    marginBottom: 20,
    ...SHADOWS.medium,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 220,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  wishlistButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 8,
    ...SHADOWS.small,
  },
  content: {
    padding: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  price: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 12,
  },
  specs: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 10,
    borderRadius: 8,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginRight: 16,
  },
  seperator: {
    width: 1,
    height: 16,
    backgroundColor: COLORS.border,
    marginRight: 16,
  },
  specText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});

export default BikeCard;
