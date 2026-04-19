import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { COLORS, SIZES, SHADOWS } from '../utils/theme';
import CustomLoader from '../components/CustomLoader';

const { width } = Dimensions.get('window');

const ReviewsScreen = ({ route, navigation }) => {
  const { bike } = route.params;
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [bike.name]);

  const fetchReviews = async () => {
    try {
      const q = query(
        collection(db, 'reviews'),
        where('bikeName', '==', bike.name)
      );
      
      const querySnapshot = await getDocs(q);
      const fetchedReviews = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedReviews.push({ id: doc.id, ...data });
      });

      // Sort by createdAt descending client-side
      fetchedReviews.sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() || 0;
        const timeB = b.createdAt?.toMillis?.() || 0;
        return timeB - timeA;
      });

      setReviews(fetchedReviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating, size = 16) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= Math.round(rating) ? 'star' : 'star-outline'}
          size={size}
          color="#FFD700"
        />
      );
    }
    return <View style={{ flexDirection: 'row' }}>{stars}</View>;
  };

  const renderReviewItem = ({ item }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewerInfo}>
            <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{item.userName.charAt(0).toUpperCase()}</Text>
            </View>
            <View>
                <Text style={styles.reviewUserName}>{item.userName}</Text>
                <Text style={styles.reviewDate}>
                  {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Just now'}
                </Text>
            </View>
        </View>
        {renderStars(item.rating, 14)}
      </View>
      <Text style={styles.reviewComment}>{item.comment}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Reviews</Text>
        <View style={{ width: 40 }} />
      </View>

      <Text style={styles.bikeNameSubtitle}>{bike.name}</Text>

      {loading ? (
        <CustomLoader />
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={renderReviewItem}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyReviewsContainer}>
                <Ionicons name="chatbubbles-outline" size={60} color={COLORS.textLight} />
                <Text style={styles.noReviewsText}>No reviews available yet.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: SIZES.h3,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  bikeNameSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '600',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  reviewCard: {
    backgroundColor: COLORS.white,
    padding: 18,
    borderRadius: SIZES.radius,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    ...SHADOWS.light,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reviewerInfo: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  avatarCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: COLORS.surfaceDark,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
  },
  avatarText: {
      fontSize: 18,
      fontWeight: '700',
      color: COLORS.primary,
  },
  reviewUserName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  reviewDate: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  reviewComment: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  emptyReviewsContainer: {
      alignItems: 'center',
      paddingVertical: 50,
      justifyContent: 'center',
  },
  noReviewsText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 15,
    fontWeight: '500',
  },
});

export default ReviewsScreen;
