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
  Dimensions,
  SafeAreaView
} from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { Ionicons } from '@expo/vector-icons';
import { getBikeImage } from '../utils/imageMapper';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../utils/theme';

const { width } = Dimensions.get('window');

const CompareScreen = ({ navigation }) => {
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
    } else if (selectedBikes.length < 2) {
      setSelectedBikes([...selectedBikes, bike]);
    } else {
      setSelectedBikes([selectedBikes[1], bike]);
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

  const renderComparisonRow = (label, val1, val2, unit = '') => {
    const num1 = parseValue(val1);
    const num2 = parseValue(val2);
    const max = Math.max(num1, num2) || 1;
    const pct1 = (num1 / max) * 100;
    const pct2 = (num2 / max) * 100;

    // Determine 'winner' for color highlight (lower price is better? usually higher stats is better, let's assume higher is better for specs, lower for price)
    const isPrice = label === 'Price';
    const better1 = isPrice ? num1 < num2 : num1 > num2;
    const better2 = isPrice ? num2 < num1 : num2 > num1;

    return (
      <View style={styles.statRow}>
        <Text style={styles.statLabel}>{label}</Text>

        <View style={styles.statComparison}>
          {/* Left Side (Bike 1) */}
          <View style={styles.statSideLeft}>
            <Text style={[styles.statValue, better1 && styles.winningText]}>
              {val1 ? (isPrice ? `₹${Number(val1).toLocaleString()}` : `${val1}${unit ? '' : ''}`) : '-'}
            </Text>
            <View style={styles.barContainerLeft}>
              <View style={[styles.barFill, { width: `${pct1}%`, backgroundColor: better1 ? COLORS.primary : COLORS.border }]} />
            </View>
          </View>

          <View style={styles.divider} />

          {/* Right Side (Bike 2) */}
          <View style={styles.statSideRight}>
            <Text style={[styles.statValue, better2 && styles.winningText]}>
              {val2 ? (isPrice ? `₹${Number(val2).toLocaleString()}` : `${val2}${unit ? '' : ''}`) : '-'}
            </Text>
            <View style={styles.barContainerRight}>
              <View style={[styles.barFill, { width: `${pct2}%`, backgroundColor: better2 ? COLORS.primary : COLORS.border }]} />
            </View>
          </View>
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
        style={styles.headerBackground}
      >
        <SafeAreaView>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Comparison</Text>
            <TouchableOpacity onPress={clearSelection}>
              <Text style={styles.clearText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.mainContent}>
        {/* Floating VS Display */}
        <View style={styles.vsFloatingCard}>
          <View style={styles.fighterContainer}>
            {/* Fighter 1 */}
            <View style={styles.fighter}>
              {selectedBikes[0] ? (
                <TouchableOpacity onPress={() => handleBikeSelect(selectedBikes[0])} activeOpacity={0.8}>
                  <Image
                    source={selectedBikes[0].images?.length > 0 ? getBikeImage(selectedBikes[0].images[0]) : null}
                    style={styles.fighterImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.fighterName} numberOfLines={1}>{selectedBikes[0].name}</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.addSlot}>
                  <Ionicons name="add" size={30} color={COLORS.textLight} />
                  <Text style={styles.addText}>Add Bike</Text>
                </View>
              )}
            </View>

            {/* VS Badge */}
            <View style={styles.vsBadge}>
              <Text style={styles.vsText}>VS</Text>
            </View>

            {/* Fighter 2 */}
            <View style={styles.fighter}>
              {selectedBikes[1] ? (
                <TouchableOpacity onPress={() => handleBikeSelect(selectedBikes[1])} activeOpacity={0.8}>
                  <Image
                    source={selectedBikes[1].images?.length > 0 ? getBikeImage(selectedBikes[1].images[0]) : null}
                    style={styles.fighterImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.fighterName} numberOfLines={1}>{selectedBikes[1].name}</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.addSlot}>
                  <Ionicons name="add" size={30} color={COLORS.textLight} />
                  <Text style={styles.addText}>Add Bike</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Comparison Stats */}
        <ScrollView style={styles.scrollContent} contentContainerStyle={{ paddingBottom: 200, paddingTop: 60 }} showsVerticalScrollIndicator={false}>
          {selectedBikes.length > 0 ? (
            <View>
              {/* Core Stats */}
              <Text style={styles.sectionHeader}>Performance</Text>
              {renderComparisonRow('Price', selectedBikes[0]?.price, selectedBikes[1]?.price)}
              {renderComparisonRow('Engine', selectedBikes[0]?.engineCC, selectedBikes[1]?.engineCC, ' cc')}
              {renderComparisonRow('Mileage', selectedBikes[0]?.mileage, selectedBikes[1]?.mileage, ' kmpl')}

              {/* Dynamic Specs from JSON */}
              <View style={{ marginTop: 20 }}>
                <Text style={styles.sectionHeader}>Detailed Specs</Text>

                {/* Combine all unique indices/keys from both bikes */}
                {Array.from(new Set([
                  ...(selectedBikes[0]?.specs?.map(s => s.key) || []),
                  ...(selectedBikes[1]?.specs?.map(s => s.key) || [])
                ])).map((specKey, index) => {
                  // Check if it's already covered in Core Stats (Power/Weight sometimes duplicate if keys match)
                  const val1 = selectedBikes[0]?.specs?.find(s => s.key === specKey)?.value || '-';
                  const val2 = selectedBikes[1]?.specs?.find(s => s.key === specKey)?.value || '-';

                  // Simple row for non-numeric or mixed text specs
                  return (
                    <View key={index} style={styles.simpleRow}>
                      <Text style={styles.simpleLabel}>{specKey}</Text>
                      <View style={styles.simpleValues}>
                        <Text style={styles.simpleVal}>{val1}</Text>
                        <View style={styles.verticalLine} />
                        <Text style={styles.simpleVal}>{val2}</Text>
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
  },
  fighterImage: {
    width: 120,
    height: 90,
    marginBottom: 10,
  },
  fighterName: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    color: COLORS.textPrimary,
    paddingHorizontal: 5,
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
  statComparison: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statSideLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  statSideRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: '#EEE',
    marginHorizontal: 15,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  winningText: {
    color: COLORS.primary,
  },
  barContainerLeft: {
    width: '100%',
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    flexDirection: 'row', // Default LTR, ok for this side? No, LTR fill is fine.
    overflow: 'hidden',
  },
  barContainerRight: {
    width: '100%',
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    flexDirection: 'row-reverse', // Fill from right
    overflow: 'hidden',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  simpleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    width: 80,
  },
  simpleValues: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', // Center vertically
  },
  verticalLine: {
    width: 1,
    height: '80%',
    backgroundColor: '#EEE',
    marginHorizontal: 10,
  },
  simpleVal: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
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
  }
});

export default CompareScreen;
