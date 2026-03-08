import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, Platform, KeyboardAvoidingView, StatusBar, ActivityIndicator } from 'react-native';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../firebase';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../utils/theme';

const EnquiryFormScreen = ({ route, navigation }) => {
  const { bikeName } = route.params || {};
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bikeNameInput, setBikeNameInput] = useState(bikeName || '');
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

  const handleSubmit = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter your name');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Required', 'Please enter your phone number');
      return;
    }
    if (!bikeNameInput.trim()) {
      Alert.alert('Required', 'Please enter the bike model');
      return;
    }

    // Phone validation (basic)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone.trim())) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'enquiries'), {
        name: name.trim(),
        phone: phone.trim(),
        bikeName: bikeNameInput.trim(),
        createdAt: new Date(),
        status: 'new'
      });

      Alert.alert(
        'Request Sent',
        'We have received your enquiry. Our team will contact you shortly.',
        [
          {
            text: 'Done',
            onPress: () => {
              setName('');
              setPhone('');
              setBikeNameInput(bikeName || '');
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error submitting enquiry:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ label, placeholder, value, onChangeText, keyboardType, maxLength, fieldName }) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={[
          styles.inputField,
          focusedInput === fieldName && styles.inputFocused
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#aaa"
        keyboardType={keyboardType}
        maxLength={maxLength}
        onFocus={() => setFocusedInput(fieldName)}
        onBlur={() => setFocusedInput(null)}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Minimalist Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>New Enquiry</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.formScroll}
          contentContainerStyle={styles.formContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerTextContainer}>
            <Text style={styles.mainHeading}>Let's get started</Text>
            <Text style={styles.subHeading}>Fill in the details below and we will get back to you with the best offers.</Text>
          </View>

          <View style={styles.formContainer}>
            <InputField
              label="FULL NAME"
              placeholder="Enter your full name"
              value={name}
              onChangeText={setName}
              fieldName="name"
            />

            <InputField
              label="MOBILE NUMBER"
              placeholder="10-digit mobile number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={10}
              fieldName="phone"
            />

            <InputField
              label="INTERESTED MODEL"
              placeholder="e.g. Splendor Plus"
              value={bikeNameInput}
              onChangeText={setBikeNameInput}
              fieldName="bike"
            />

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Submit Enquiry</Text>
              )}
            </TouchableOpacity>

            <View style={styles.securityNote}>
              <Ionicons name="lock-closed-outline" size={14} color="#888" />
              <Text style={styles.securityText}>Your information is secure with us.</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  backBtn: {
    padding: 4,
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  formScroll: {
    flex: 1,
  },
  formContent: {
    padding: 24,
  },
  headerTextContainer: {
    marginBottom: 32,
  },
  mainHeading: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000',
    marginBottom: 8,
  },
  subHeading: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  formContainer: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
    letterSpacing: 0.5,
  },
  inputField: {
    backgroundColor: '#F5F5F7',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#000',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputFocused: {
    backgroundColor: '#FFF',
    borderColor: '#000',
    ...SHADOWS.light,
  },
  submitButton: {
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    marginTop: 16,
    ...SHADOWS.medium,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
  },
  securityText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  }
});

export default EnquiryFormScreen;
