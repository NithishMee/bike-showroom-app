import React, { useRef, useState, useContext } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions, StatusBar, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getBikeImage } from '../utils/imageMapper';
import { COLORS, SIZES, SHADOWS } from '../utils/theme';
import { LinearGradient } from 'expo-linear-gradient';

import { db, auth } from '../../firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { AuthContext } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

const BikeDetailsScreen = ({ route, navigation }) => {
  const { bike } = route.params;
  const scrollY = useRef(new Animated.Value(0)).current;
  const [activeImage, setActiveImage] = useState(0);
  const [isBooked, setIsBooked] = useState(false);

  // Reviews State
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Auth Context
  const { setIsGuest } = useContext(AuthContext);

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
            } catch (e) { }
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

  // Fetch Reviews
  React.useEffect(() => {
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
      let totalRating = 0;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedReviews.push({ id: doc.id, ...data });
        totalRating += data.rating;
      });

      // Sort by createdAt descending client-side to avoid Firebase composite index requirement
      fetchedReviews.sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() || 0;
        const timeB = b.createdAt?.toMillis?.() || 0;
        return timeB - timeA;
      });

      setReviews(fetchedReviews);
      
      if (fetchedReviews.length > 0) {
        setAverageRating((totalRating / fetchedReviews.length).toFixed(1));
      } else {
        setAverageRating(0);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const handleWriteReviewPress = () => {
    const currentUser = auth ? auth.currentUser : null;
    if (!currentUser) {
      setIsGuest(false);
      return;
    }
    setIsReviewModalVisible(true);
  };

  const submitReview = async () => {
    if (userRating === 0) {
      Alert.alert("Rating Required", "Please select a star rating.");
      return;
    }
    if (!reviewText.trim()) {
      Alert.alert("Review Required", "Please write a short review.");
      return;
    }

    setIsSubmittingReview(true);
    const currentUser = auth.currentUser;

    try {
      await addDoc(collection(db, 'reviews'), {
        bikeName: bike.name,
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Anonymous User',
        rating: userRating,
        comment: reviewText.trim(),
        createdAt: serverTimestamp(),
      });

      setIsReviewModalVisible(false);
      setUserRating(0);
      setReviewText('');
      
      Alert.alert("Success", "Your review has been submitted!");
      fetchReviews(); // Refresh reviews list
    } catch (error) {
      console.error("Error submitting review:", error);
      Alert.alert("Error", "Failed to submit review. Please try again.");
    } finally {
      setIsSubmittingReview(false);
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

  // Ensure images is an array
  const bikeImages = bike.images || (bike.image ? [bike.image] : []);

  return (
    <SafeAreaView style={styles.container}>
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

          {/* Reviews Section */}
          <View style={styles.reviewsHeaderRow}>
            <Text style={styles.sectionTitle}>Reviews & Ratings</Text>
            <TouchableOpacity onPress={handleWriteReviewPress} style={styles.writeReviewBtn}>
               <Ionicons name="create-outline" size={16} color={COLORS.primary} style={{ marginRight: 4 }} />
              <Text style={styles.writeReviewText}>Write a Review</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.ratingSummary}>
            <View style={styles.ratingNumberContainer}>
                <Text style={styles.averageRating}>{averageRating}</Text>
                <Text style={styles.outOfFive}>/ 5</Text>
            </View>
            <View style={styles.ratingSummaryRight}>
              {renderStars(averageRating, 22)}
              <Text style={styles.totalReviews}>Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</Text>
            </View>
          </View>

          <View style={styles.reviewsListContainer}>
            {reviews.length > 0 ? (
               reviews.map((review) => (
                 <View key={review.id} style={styles.reviewCard}>
                   <View style={styles.reviewHeader}>
                     <View style={styles.reviewerInfo}>
                         <View style={styles.avatarCircle}>
                             <Text style={styles.avatarText}>{review.userName.charAt(0).toUpperCase()}</Text>
                         </View>
                         <View>
                             <Text style={styles.reviewUserName}>{review.userName}</Text>
                             <Text style={styles.reviewDate}>
                               {review.createdAt?.toDate ? review.createdAt.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Just now'}
                             </Text>
                         </View>
                     </View>
                     {renderStars(review.rating, 14)}
                   </View>
                   <Text style={styles.reviewComment}>{review.comment}</Text>
                 </View>
               ))
            ) : (
              <View style={styles.emptyReviewsContainer}>
                  <Ionicons name="chatbubbles-outline" size={40} color={COLORS.textLight} />
                  <Text style={styles.noReviewsText}>No reviews yet. Be the first to review!</Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            style={[styles.bookButton, isBooked && styles.bookButtonDisabled]}
            disabled={isBooked}
            onPress={() => {
              const currentUser = auth ? auth.currentUser : null;

              if (!currentUser) {
                // If the device alert doesn't show, we still want to force the login flow.
                // Setting isGuest to false will automatically switch the AppNavigator to the AuthStack.
                setIsGuest(false);
                return;
              }

              // User logged in
              navigation.navigate('TestRideBooking', {
                bikeName: bike.name,
                bikeImage: bike.images && bike.images.length > 0 ? bike.images[0] : bike.image
              });
            }}
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

      {/* Write Review Modal */}
      {isReviewModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Write a Review</Text>
              <TouchableOpacity onPress={() => setIsReviewModalVisible(false)} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>How would you rate the {bike.name}?</Text>
            <View style={styles.starSelectionContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setUserRating(star)}>
                  <Ionicons
                    name={star <= userRating ? 'star' : 'star-outline'}
                    size={40}
                    color="#FFD700"
                    style={{ marginHorizontal: 5 }}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.inputContainer}>
               <TextInput
                 style={styles.reviewInput}
                 placeholder="Share your thoughts about this bike..."
                 multiline
                 numberOfLines={4}
                 value={reviewText}
                 onChangeText={setReviewText}
                 placeholderTextColor={COLORS.textLight}
                 textAlignVertical="top"
               />
            </View>

            <TouchableOpacity 
              style={[styles.submitButton, isSubmittingReview && styles.disabledButtonContent]}
              onPress={submitReview}
              disabled={isSubmittingReview}
            >
               {isSubmittingReview ? (
                   <Text style={styles.submitButtonText}>Submitting...</Text>
               ) : (
                  <LinearGradient
                    colors={COLORS.primaryGradient}
                    style={styles.submitGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.submitButtonText}>Submit Review</Text>
                  </LinearGradient>
               )}
            </TouchableOpacity>

          </View>
        </View>
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
  bookButtonTextDisabled: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    marginRight: 10,
  },
  reviewsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  writeReviewBtn: {
     flexDirection: 'row',
     alignItems: 'center',
     backgroundColor: COLORS.surface,
     paddingHorizontal: 12,
     paddingVertical: 6,
     borderRadius: 20,
     borderWidth: 1,
     borderColor: COLORS.primary + '30',
  },
  writeReviewText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  ratingSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: SIZES.radius,
    marginBottom: 25,
    ...SHADOWS.light,
  },
  ratingNumberContainer: {
      flexDirection: 'row',
      alignItems: 'baseline',
      marginRight: 20,
  },
  averageRating: {
    fontSize: 42,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  outOfFive: {
      fontSize: 18,
      color: COLORS.textSecondary,
      marginLeft: 4,
      fontWeight: '600',
  },
  ratingSummaryRight: {
      flex: 1,
      justifyContent: 'center',
  },
  totalReviews: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 6,
    fontWeight: '500',
  },
  reviewsListContainer: {
    marginBottom: 30,
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
      paddingVertical: 30,
      backgroundColor: COLORS.surface,
      borderRadius: SIZES.radius,
  },
  noReviewsText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '500',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    width: width * 0.9,
    borderRadius: 24,
    padding: 25,
    ...SHADOWS.dark,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  closeButton: {
    padding: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
  },
  modalSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  starSelectionContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 15,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  reviewInput: {
    height: 120,
    fontSize: 15,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  submitButton: {
    width: '100%',
    height: 55,
    borderRadius: 16,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  submitGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
  },
});

export default BikeDetailsScreen;
