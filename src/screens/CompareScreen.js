import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, ActivityIndicator, Image, TextInput } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import BikeCard from '../components/BikeCard';
import { Ionicons } from '@expo/vector-icons';

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
      // Remove if already selected
      setSelectedBikes(selectedBikes.filter(b => b.id !== bike.id));
    } else if (selectedBikes.length < 2) {
      // Add if less than 2 selected
      setSelectedBikes([...selectedBikes, bike]);
    } else {
      // Replace first one if 2 already selected
      setSelectedBikes([selectedBikes[1], bike]);
    }
  };

  const clearSelection = () => {
    setSelectedBikes([]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading bikes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Selection Instructions */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>
          Select up to 2 bikes to compare
        </Text>
        {selectedBikes.length > 0 && (
          <TouchableOpacity onPress={clearSelection} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Comparison View */}
      {selectedBikes.length === 2 ? (
        <ScrollView style={styles.comparisonContainer}>
          <View style={styles.comparisonHeader}>
            <View style={styles.comparisonColumn}>
              <Text style={styles.bikeName}>{selectedBikes[0].name}</Text>
            </View>
            <View style={styles.comparisonColumn}>
              <Text style={styles.bikeName}>{selectedBikes[1].name}</Text>
            </View>
          </View>

          {/* Key Highlights */}
          <Text style={styles.sectionHeader}>Key Highlights</Text>

          <View style={styles.comparisonRow}>
            <View style={styles.comparisonColumn}>
              <Text style={styles.comparisonValue}>₹{selectedBikes[0].price?.toLocaleString() || 'N/A'}</Text>
              <Text style={styles.comparisonLabel}>Price</Text>
            </View>
            <View style={styles.comparisonColumn}>
              <Text style={styles.comparisonValue}>₹{selectedBikes[1].price?.toLocaleString() || 'N/A'}</Text>
              <Text style={styles.comparisonLabel}>Price</Text>
            </View>
          </View>

          <View style={styles.comparisonRow}>
            <View style={styles.comparisonColumn}>
              <Text style={styles.comparisonValue}>{selectedBikes[0].mileage || 'N/A'} kmpl</Text>
              <Text style={styles.comparisonLabel}>Mileage</Text>
            </View>
            <View style={styles.comparisonColumn}>
              <Text style={styles.comparisonValue}>{selectedBikes[1].mileage || 'N/A'} kmpl</Text>
              <Text style={styles.comparisonLabel}>Mileage</Text>
            </View>
          </View>

          <View style={styles.comparisonRow}>
            <View style={styles.comparisonColumn}>
              <Text style={styles.comparisonValue}>{selectedBikes[0].engineCC || 'N/A'} CC</Text>
              <Text style={styles.comparisonLabel}>Engine</Text>
            </View>
            <View style={styles.comparisonColumn}>
              <Text style={styles.comparisonValue}>{selectedBikes[1].engineCC || 'N/A'} CC</Text>
              <Text style={styles.comparisonLabel}>Engine</Text>
            </View>
          </View>

          {/* Dynamic Specs Comparison */}
          <Text style={styles.sectionHeader}>Detailed Specifications</Text>
          {selectedBikes[0].specs && selectedBikes[0].specs.map((spec, index) => {
            const bike2Spec = selectedBikes[1].specs?.find(s => s.key === spec.key);
            return (
              <View key={index} style={styles.specRow}>
                <Text style={styles.specTitle}>{spec.key}</Text>
                <View style={styles.specValuesRow}>
                  <Text style={styles.specValueLeft}>{spec.value}</Text>
                  <Text style={styles.specValueRight}>{bike2Spec ? bike2Spec.value : '-'}</Text>
                </View>
              </View>
            );
          })}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.detailsButton}
              onPress={() => navigation.navigate('BikeDetails', { bike: selectedBikes[0] })}
            >
              <Text style={styles.detailsButtonText}>View Details</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.detailsButton}
              onPress={() => navigation.navigate('BikeDetails', { bike: selectedBikes[1] })}
            >
              <Text style={styles.detailsButtonText}>View Details</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.placeholderContainer}>
          <Ionicons name="git-compare-outline" size={64} color="#ccc" />
          <Text style={styles.placeholderText}>
            {selectedBikes.length === 0
              ? 'Select 2 bikes to compare'
              : 'Select one more bike to compare'}
          </Text>
        </View>
      )}

      {/* Bike Selection List */}
      <View style={styles.selectionContainer}>
        <Text style={styles.selectionTitle}>Add to Compare ({selectedBikes.length}/2)</Text>
        <FlatList
          data={bikes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isSelected = selectedBikes.find(b => b.id === item.id);
            const imageUri = item.images && item.images.length > 0 ? item.images[0] : 'https://via.placeholder.com/150';

            return (
              <TouchableOpacity
                style={[
                  styles.bikeSelectionCard,
                  isSelected && styles.bikeSelectionCardSelected
                ]}
                onPress={() => handleBikeSelect(item)}
              >
                <Image source={{ uri: imageUri }} style={styles.bikeSelectionImage} resizeMode="contain" />
                <View style={styles.bikeSelectionInfo}>
                  <Text style={styles.bikeSelectionName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.bikeSelectionPrice}>₹{item.price?.toLocaleString()}</Text>
                </View>
                {isSelected && (
                  <View style={styles.checkIconOverlay}>
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.selectionList}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  instructionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  instructionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  comparisonContainer: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  comparisonHeader: {
    flexDirection: 'row',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  comparisonColumn: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  bikeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
    marginTop: 8,
    textAlign: 'center',
  },
  comparisonRow: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f9f9f9',
    paddingBottom: 8,
  },
  comparisonValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#EE2824',
    textAlign: 'center',
  },
  comparisonLabel: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 4,
  },
  specRow: {
    marginBottom: 16,
    backgroundColor: '#fafafa',
    padding: 12,
    borderRadius: 8,
  },
  specTitle: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
  },
  specValuesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  specValueLeft: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    borderRightWidth: 1,
    borderRightColor: '#eee',
  },
  specValueRight: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 20,
  },
  detailsButton: {
    flex: 1,
    backgroundColor: '#EE2824',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  detailsButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
  },
  selectionContainer: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  selectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  selectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
    textTransform: 'uppercase',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 10,
    width: 150,
    height: 36,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#333',
    paddingVertical: 0,
  },
  selectionList: {
    paddingHorizontal: 16,
  },
  bikeSelectionCard: {
    backgroundColor: '#fff',
    width: 140,
    marginRight: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  bikeSelectionCardSelected: {
    borderColor: '#EE2824',
    backgroundColor: '#fff5f5',
    borderWidth: 1.5,
  },
  bikeSelectionImage: {
    width: '100%',
    height: 80,
    marginBottom: 8,
  },
  bikeSelectionInfo: {
    alignItems: 'center',
  },
  bikeSelectionName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 2,
  },
  bikeSelectionPrice: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#EE2824',
  },
  checkIconOverlay: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EE2824',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CompareScreen;
