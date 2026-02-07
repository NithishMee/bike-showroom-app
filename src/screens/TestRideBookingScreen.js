import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  Modal,
  Dimensions,
  StatusBar,
  Platform,
  FlatList
} from 'react-native';
import { addDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../utils/theme';
import { getBikeImage } from '../utils/imageMapper';


const { width } = Dimensions.get('window');

const TIME_SLOTS = [
  "09:00 AM - 11:00 AM",
  "11:00 AM - 01:00 PM",
  "01:00 PM - 03:00 PM",
  "03:00 PM - 05:00 PM",
  "05:00 PM - 07:00 PM"
];

const MinimalModal = ({ visible, onClose }) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" size={32} color="#fff" />
          </View>
          <Text style={styles.modalTitle}>Booking Confirmed</Text>
          <Text style={styles.modalText}>
            We've received your request. Our team will call you shortly to finalize the time.
          </Text>
          <TouchableOpacity style={styles.modalButton} onPress={onClose}>
            <Text style={styles.modalButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const TestRideBookingScreen = ({ route, navigation }) => {
  const { bikeName, bikeImage } = route.params || {};

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedDate, setSelectedDate] = useState(null); // Store date object or string
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);

  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Generated Dates (Next 14 Days)
  const [dates, setDates] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);

  // Init Data
  useEffect(() => {
    // Generate Dates
    const next14Days = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + i);
      next14Days.push({
        id: i,
        dayName: nextDate.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: nextDate.getDate(),
        monthName: nextDate.toLocaleDateString('en-US', { month: 'short' }),
        fullDate: nextDate.toLocaleDateString('en-GB'), // DD/MM/YYYY for storage
        rawDate: nextDate
      });
    }
    setDates(next14Days);

    // Auto-fill User
    const user = auth.currentUser;
    if (user) {
      if (user.displayName) setName(user.displayName);
      if (user.email) setEmail(user.email);
    }
  }, []);

  // Fetch booked slots when date changes
  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!selectedDate) return;

      const bikeToBook = bikeName || 'General';
      const dateToBook = selectedDate.fullDate;

      const q = query(
        collection(db, 'testRides'),
        where('bikeName', '==', bikeToBook),
        where('preferredDate', '==', dateToBook)
      );

      try {
        const querySnapshot = await getDocs(q);
        const slots = [];
        querySnapshot.forEach((doc) => {
          slots.push(doc.data().preferredTime);
        });
        setBookedSlots(slots);
      } catch (error) {
        console.error("Error fetching booked slots: ", error);
      }
    };

    fetchBookedSlots();
  }, [selectedDate, bikeName]);

  const sendBookingEmail = async (bookingData) => {
    // Check if config is present (basic check)
    if (!EMAIL_CONFIG.SERVICE_ID || EMAIL_CONFIG.SERVICE_ID === 'YOUR_SERVICE_ID') {
      console.log('EmailJS not configured, skipping email.');
      return;
    }

    const templateParams = {
      to_name: bookingData.name,
      to_email: bookingData.email,
      bike_name: bookingData.bikeName,
      date: bookingData.preferredDate,
      time: bookingData.preferredTime,
      phone: bookingData.phone,
    };

    try {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: EMAIL_CONFIG.SERVICE_ID,
          template_id: EMAIL_CONFIG.TEMPLATE_ID,
          user_id: EMAIL_CONFIG.PUBLIC_KEY,
          template_params: templateParams,
        }),
      });

      if (response.ok) {
        console.log('Email sent successfully!');
      } else {
        const text = await response.text();
        console.error('Failed to send email:', text);
      }
    } catch (error) {
      console.error('Email send error:', error);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) return Alert.alert('Required', 'Please enter your full name');
    if (!email.trim()) return Alert.alert('Required', 'Please enter your email');
    if (!phone.trim()) return Alert.alert('Required', 'Please enter your phone number');
    if (!selectedDate) return Alert.alert('Required', 'Please select a preferred date');
    if (!selectedTimeSlot) return Alert.alert('Required', 'Please select a time slot');

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone.trim())) {
      return Alert.alert('Invalid', 'Please enter a valid 10-digit number');
    }

    setLoading(true);
    try {
      // Check for existing booking
      const bikeToBook = bikeName || 'General';
      const dateToBook = selectedDate.fullDate;
      const timeToBook = selectedTimeSlot;

      const bookingQuery = query(
        collection(db, 'testRides'),
        where('bikeName', '==', bikeToBook),
        where('preferredDate', '==', dateToBook),
        where('preferredTime', '==', timeToBook)
      );

      const querySnapshot = await getDocs(bookingQuery);

      if (!querySnapshot.empty) {
        setLoading(false);
        return Alert.alert(
          'Slot Unavailable',
          'This time slot is already booked for this bike. Please choose another time or date.'
        );
      }

      await addDoc(collection(db, 'testRides'), {
        userId: auth.currentUser?.uid || 'anonymous',
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        preferredDate: selectedDate.fullDate,
        preferredTime: selectedTimeSlot,
        bikeName: bikeName || 'General',
        status: 'pending',
        createdAt: new Date(),
      });

      setShowSuccess(true);

      setShowSuccess(true);
    } catch (error) {
      console.error('Booking Error:', error);
      Alert.alert('Error', 'Could not submit booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShowSuccess(false);
    navigation.goBack();
  };

  const bikeImgSource = getBikeImage(bikeImage);

  // Render Items
  const renderDateItem = ({ item }) => {
    const isSelected = selectedDate?.id === item.id;
    return (
      <TouchableOpacity
        style={[styles.dateChip, isSelected && styles.dateChipSelected]}
        onPress={() => setSelectedDate(item)}
        activeOpacity={0.7}
      >
        <Text style={[styles.dateMonth, isSelected && styles.dateTextSelected]}>{item.monthName}</Text>
        <Text style={[styles.dateNumber, isSelected && styles.dateTextSelected]}>{item.dayNumber}</Text>
        <Text style={[styles.dateDay, isSelected && styles.dateTextSelected]}>{item.dayName}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <MinimalModal visible={showSuccess} onClose={handleClose} />

      {/* Clean Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Book Test Ride</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Bike Card */}
        <View style={styles.bikeCard}>
          <View style={styles.imageWrapper}>
            {bikeImgSource ? (
              <Image source={bikeImgSource} style={styles.bikeImage} resizeMode="contain" />
            ) : (
              <View style={[styles.bikeImage, { backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }]}>
                <Ionicons name="bicycle" size={48} color="#ccc" />
              </View>
            )}
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardLabel}>SELECTED MODEL</Text>
            <Text style={styles.cardTitle}>{bikeName || 'Unknown Model'}</Text>
          </View>
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          <Text style={styles.sectionHeader}>PERSONAL DETAILS</Text>

          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.inputField}
              value={name}
              onChangeText={setName}
              placeholder="Enter Name"
              placeholderTextColor="#aaa"
            />
          </View>

          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Mobile</Text>
            <TextInput
              style={styles.inputField}
              value={phone}
              onChangeText={setPhone}
              placeholder="10-digit number"
              keyboardType="numeric"
              maxLength={10}
              placeholderTextColor="#aaa"
            />
          </View>

          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={[styles.inputField, { color: '#888' }]}
              value={email}
              editable={false}
              placeholder="Email Address"
            />
          </View>

          {/* Date Selection */}
          <Text style={[styles.sectionHeader, { marginTop: 24 }]}>SELECT PREFERRED DATE</Text>
          <View style={styles.dateListContainer}>
            <FlatList
              horizontal
              data={dates}
              renderItem={renderDateItem}
              keyExtractor={item => item.id.toString()}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 4 }} // Padding for first/last item
            />
          </View>

          {/* Time Slot Selection */}
          <Text style={[styles.sectionHeader, { marginTop: 24 }]}>SELECT TIME SLOT</Text>
          <View style={styles.timeSlotContainer}>
            {TIME_SLOTS.map((slot, index) => {
              const isSelected = selectedTimeSlot === slot;
              const isBooked = bookedSlots.includes(slot);

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.timeChip,
                    isSelected && styles.timeChipSelected,
                    isBooked && styles.timeChipDisabled
                  ]}
                  onPress={() => setSelectedTimeSlot(slot)}
                  activeOpacity={0.7}
                  disabled={isBooked}
                >
                  <Text style={[
                    styles.timeText,
                    isSelected && styles.timeTextSelected,
                    isBooked && styles.timeTextDisabled
                  ]}>
                    {slot}
                  </Text>
                  {isSelected && <Ionicons name="checkmark-circle" size={16} color="#fff" style={{ marginLeft: 6 }} />}
                  {isBooked && <Ionicons name="lock-closed" size={14} color="#888" style={{ marginLeft: 6 }} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={[styles.primaryBtn, (loading || !selectedTimeSlot || showSuccess) && styles.disabledBtn]}
          onPress={handleSubmit}
          disabled={loading || !selectedTimeSlot || showSuccess}
        >
          <Text style={styles.btnText}>
            {loading ? 'Booking...' : showSuccess ? 'Booked' : 'Confirm Request'}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  content: {
    padding: 20,
    paddingBottom: 50,
  },
  bikeCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    alignItems: 'center',
    ...SHADOWS.medium,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  imageWrapper: {
    width: '100%',
    height: 180,
    marginBottom: 15,
  },
  bikeImage: {
    width: '100%',
    height: '100%',
  },
  cardInfo: {
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#000',
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  formContainer: {
    marginBottom: 30,
  },
  inputRow: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputField: {
    backgroundColor: '#F5F5F7',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#000',
  },

  // Date Selector Styles
  dateListContainer: {
    marginBottom: 0,
    height: 90, // Increased height for 3 lines
  },
  dateChip: {
    width: 65,
    height: 80, // Increased height
    backgroundColor: '#F5F5F7',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  dateChipSelected: {
    backgroundColor: '#000',
    borderColor: '#000',
    ...SHADOWS.light,
  },
  dateMonth: {
    fontSize: 10,
    color: COLORS.primary, // Red accent for month
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  dateNumber: {
    fontSize: 20,
    color: '#000',
    fontWeight: '800',
    marginBottom: 2,
  },
  dateDay: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
  },
  dateTextSelected: {
    color: '#fff', // White text on black selection
  },

  // Time Slot Styles
  timeSlotContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10, // Modern gap property
  },
  timeChip: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F5F5F7',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeChipSelected: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  timeChipDisabled: {
    backgroundColor: '#E0E0E0',
    borderColor: '#E0E0E0',
  },
  timeText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
  },
  timeTextSelected: {
    color: '#fff',
  },
  timeTextDisabled: {
    color: '#333',
  },

  primaryBtn: {
    backgroundColor: '#000',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    ...SHADOWS.light,
    marginTop: 20,
  },
  disabledBtn: {
    backgroundColor: '#ccc',
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  // Minimal Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    ...SHADOWS.dark,
  },
  checkCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: '#F5F5F7',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 15,
  },
});

export default TestRideBookingScreen;
