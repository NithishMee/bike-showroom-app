import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Image,
  Dimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { Ionicons } from '@expo/vector-icons';
import { getBikeImage } from '../utils/imageMapper';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../utils/theme';

const { width } = Dimensions.get('window');

const CompareScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [bikes, setBikes] = useState([]);
  const [selectedBikes, setSelectedBikes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBikes();
  }, []);

  const fetchBikes = async () => {
    try {
      const bikesCollection = collection(db, 'bikes');
      const bikesSnapshot = await getDocs(bikesCollection);
      const bikesList = bikesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBikes(bikesList);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bikes:', error);
      setLoading(false);
    }
  };

  const handleBikeSelect = (bike) => {
    if (selectedBikes.find(b => b.id === bike.id)) {
      setSelectedBikes(selectedBikes.filter(b => b.id !== bike.id));
    } else if (selectedBikes.length < 3) {
      setSelectedBikes([...selectedBikes, bike]);
    } else {
      // Replace the first one (FIFO) or maybe prompt? Let's just shift
      setSelectedBikes([...selectedBikes.slice(1), bike]);
    }
  };

  const clearSelection = () => {
    setSelectedBikes([]);
  };

  // Helper to parse numeric value from string (e.g., "124.7 cc" -> 124.7)
  const parseValue = (val) => {
    if (!val) return 0;
    if (typeof val === 'number') return val;
    return parseFloat(val.toString().replace(/[^0-9.]/g, '')) || 0;
  };

  const renderComparisonRow = (label, bikeKey, unit = '') => {
    // Extract values
    const values = [0, 1, 2].map(i => {
      const bike = selectedBikes[i];
      if (!bike) return null;
      return bike[bikeKey];
    });

    const parsedValues = values.map(v => parseValue(v));
    const max = Math.min(Math.max(...parsedValues.filter(v => v !== 0)) || 1, 9999999);

    // Determine winner (highest value is better, unless price)
    const isPrice = label === 'Price';

    let bestIndex = -1;
    let bestVal = isPrice ? Infinity : -Infinity;

    parsedValues.forEach((val, idx) => {
      if (values[idx] === null || values[idx] === undefined || val === 0) return;
      if (isPrice) {
        if (val < bestVal) { bestVal = val; bestIndex = idx; }
      } else {
        if (val > bestVal) { bestVal = val; bestIndex = idx; }
      }
    });

    return (
      <View style={styles.specCard}>
        <Text style={styles.specCardTitle}>{label}</Text>
        <View style={styles.specGrid}>
          {[0, 1, 2].map((i) => {
            const bike = selectedBikes[i];
            const val = values[i];
            const parsed = parsedValues[i];
            const pct = parsed ? (parsed / max) * 100 : 0;
            const isWinner = i === bestIndex && bike && val;

            return (
              <View key={i} style={[styles.specCol, i < 2 && styles.specDivider]}>
                <View style={{ alignItems: 'center', width: '100%' }}>
                  {isWinner && (
                    <Ionicons name="trophy" size={14} color="#FFD700" style={{ marginBottom: 4 }} />
                  )}
                  <Text style={[styles.specValue, isWinner && { color: COLORS.primary, fontWeight: '800' }]}>
                    {val ? (isPrice ? `₹${Number(val).toLocaleString()}` : `${val}${unit}`) : '-'}
                  </Text>

                  {/* Mini Bar Chart */}
                  {val ? (
                    <View style={{ width: '80%', height: 4, backgroundColor: '#F0F0F0', borderRadius: 2, marginTop: 6 }}>
                      <View style={{ width: `${Math.min(pct, 100)}%`, height: '100%', backgroundColor: isWinner ? COLORS.primary : '#ccc', borderRadius: 2 }} />
                    </View>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const getSpec = (bike, key) => bike?.specs?.find(s => s.key === key)?.value;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Background Gradient Header */}
      <LinearGradient
        colors={[COLORS.primaryDark, COLORS.primary]}
        style={[
          styles.headerBackground, 
          { paddingTop: Math.max(insets.top + 10, 40), height: 210 + insets.top }
        ]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Comparison</Text>
          <TouchableOpacity onPress={clearSelection}>
            <Text style={styles.clearText}>Reset</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.mainContent}>
        {/* Floating Comparison Header */}
        <View style={styles.vsFloatingCard}>
          <View style={styles.fighterContainer}>
            {[0, 1, 2].map((index) => {
              const bike = selectedBikes[index];
              return (
                <View key={index} style={styles.fighter}>
                  {bike ? (
                    <TouchableOpacity onPress={() => handleBikeSelect(bike)} activeOpacity={0.8} style={styles.fighterTouch}>
                      <View style={styles.removeBadge}>
                        <Ionicons name="close" size={12} color="#FFF" />
                      </View>
                      <Image
                        source={bike.images?.length > 0 ? getBikeImage(bike.images[0]) : null}
                        style={styles.fighterImage}
                        resizeMode="contain"
                      />
                      <Text style={styles.fighterName} numberOfLines={2}>{bike.name}</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.addSlot}>
                      <Ionicons name="add" size={24} color={COLORS.textLight} />
                      <Text style={styles.addText}>Add</Text>
                    </View>
                  )}
                  {index < 2 && <View style={styles.verticalDivider} />}
                </View>
              );
            })}
          </View>
        </View>

        {/* Comparison Stats */}
        <ScrollView style={styles.scrollContent} contentContainerStyle={{ paddingBottom: 200, paddingTop: 20 }} showsVerticalScrollIndicator={false}>
          {selectedBikes.length > 0 ? (
            <View>
              {/* Core Stats */}
              <Text style={styles.sectionHeader}>Performance</Text>
              {renderComparisonRow('Price', 'price')}
              {renderComparisonRow('Engine', 'engineCC', ' cc')}
              {renderComparisonRow('Mileage', 'mileage', ' kmpl')}

              {/* Dynamic Specs from JSON */}
              <View style={{ marginTop: 20 }}>
                <Text style={styles.sectionHeader}>Detailed Specs</Text>

                {/* Combine all unique indices/keys from both bikes */}
                {Array.from(new Set([
                  ...(selectedBikes[0]?.specs?.map(s => s.key) || []),
                  ...(selectedBikes[1]?.specs?.map(s => s.key) || [])
                ])).map((specKey, index) => {
                  // Simple row for non-numeric or mixed text specs
                  return (
                    <View key={index} style={styles.specCard}>
                      <Text style={styles.specCardTitle}>{specKey}</Text>
                      <View style={styles.specGrid}>
                        {[0, 1, 2].map((i) => {
                          const bike = selectedBikes[i];
                          const val = bike?.specs?.find(s => s.key === specKey)?.value || '-';

                          // Skip rendering empty slot if no bike selected? No, keep it aligned.
                          // But visually we might want to hide columns if only 2 bikes.
                          // For now, render all 3 slots to keep alignment if 3rd is empty.

                          return (
                            <View key={i} style={[styles.specCol, i < 2 && styles.specDivider]}>
                              <Text style={[styles.specValue, !bike && { opacity: 0.3 }]} numberOfLines={2}>
                                {val}
                              </Text>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Choose Performance</Text>
              <Text style={styles.emptyDesc}>Select two bikes from below to see how they stack up against each other.</Text>
            </View>
          )}
        </ScrollView>

        {/* Bottom Selection Rail */}
        <View style={styles.bottomRail}>
          <Text style={styles.railTitle}>Select Models</Text>
          <FlatList
            data={bikes}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            keyExtractor={item => item.id}
            renderItem={({ item }) => {
              const isSelected = selectedBikes.find(b => b.id === item.id);
              return (
                <TouchableOpacity
                  style={[styles.railCard, isSelected && styles.railCardActive]}
                  onPress={() => handleBikeSelect(item)}
                  activeOpacity={0.7}
                >
                  <Image
                    source={item.images?.length > 0 ? getBikeImage(item.images[0]) : null}
                    style={styles.railImage}
                    resizeMode="contain"
                  />
                  <Text style={[styles.railName, isSelected && styles.railNameActive]} numberOfLines={1}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )
            }}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBackground: {
    height: 250,
    width: '100%',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
  },
  clearText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '600',
  },
  mainContent: {
    flex: 1,
    marginTop: -160, // Pull up to overlap header
  },
  vsFloatingCard: {
    marginHorizontal: 20,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 15,
    ...SHADOWS.medium,
    height: 200,
    marginBottom: 20,
  },
  fighterContainer: {
    flexDirection: 'row',
    height: '100%',
    alignItems: 'center',
  },
  fighter: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  fighterImage: {
    width: '100%',
    height: 80,
    marginBottom: 8,
  },
  fighterName: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    color: COLORS.textPrimary,
    paddingHorizontal: 2,
  },
  addSlot: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#F5F5F7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderStyle: 'dashed',
  },
  addText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 4,
    fontWeight: '600',
  },
  vsBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.textPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  vsText: {
    color: COLORS.primary,
    fontWeight: '900',
    fontSize: 16,
    fontStyle: 'italic',
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  statRow: {
    backgroundColor: COLORS.white,
    marginBottom: 15,
    padding: 15,
    borderRadius: 16,
    ...SHADOWS.light,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 10,
  },
  statGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
    textAlign: 'center',
  },
  winningText: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  barContainer: {
    width: '100%',
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    flexDirection: 'column-reverse', // Grow upwards? No, horizontal bar.
    justifyContent: 'flex-start',
    alignItems: 'flex-start', // Left align for all? 
    // Actually, for 3 cols, maybe vertical bars? 
    // The previous implementation used horizontal bars.
    // Let's stick to horizontal for now, but maybe centered?
    // If it's 3 columns side-by-side, max width is small (~100px).
    // Let's make it simple: Horizontal fill.
    flexDirection: 'row',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 15,
  },
  simpleRow: {
    flexDirection: 'column', // Stack label on top or keep row? row is tight.
    // Let's keep row but give label full width? No.
    // Let's stack: Label Top, Values Bottom Row.
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  simpleLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  simpleValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  simpleValContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 0.5,
    borderRightColor: '#EEE',
  },
  simpleVal: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 40,
    opacity: 0.6,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 10,
  },
  emptyDesc: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginHorizontal: 40,
    marginTop: 5,
    lineHeight: 20,
  },
  bottomRail: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    paddingVertical: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    ...SHADOWS.dark,
  },
  railTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginLeft: 20,
    marginBottom: 15,
  },
  railCard: {
    width: 90,
    marginRight: 15,
    alignItems: 'center',
    opacity: 0.5,
    transform: [{ scale: 0.9 }]
  },
  railCardActive: {
    opacity: 1,
    transform: [{ scale: 1 }]
  },
  railImage: {
    width: 80,
    height: 60,
    marginBottom: 5,
  },
  railName: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  railNameActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  fighterTouch: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  removeBadge: {
    position: 'absolute',
    top: -5,
    right: 15,
    backgroundColor: COLORS.textLight,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  verticalDivider: {
    width: 1,
    height: '60%',
    backgroundColor: '#EEE',
    position: 'absolute',
    right: 0,
  },
  specCard: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 16,
    marginBottom: 10,
    ...SHADOWS.light,
  },
  specCardTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#888',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
  },
  specGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  specCol: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 2,
    justifyContent: 'center',
  },
  specDivider: {
    borderRightWidth: 1,
    borderRightColor: '#F0F0F0',
  },
  specValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default CompareScreen;
