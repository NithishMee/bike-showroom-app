import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';

const ContactScreen = () => {
  const showroomAddress = "123 Main Street, City Center, Mumbai - 400001";
  const phoneNumber = "+919876543210";
  const email = "info@bikeshowroom.com";

  const handleCall = () => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleEmail = () => {
    Linking.openURL(`mailto:${email}`);
  };

  const handleOpenMaps = () => {
    // Open Google Maps with the address
    const encodedAddress = encodeURIComponent(showroomAddress);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="location-outline" size={48} color="#007AFF" />
          <Text style={styles.title}>Contact Us</Text>
          <Text style={styles.subtitle}>Visit our showroom or get in touch</Text>
        </View>

        {/* Address Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="business-outline" size={24} color="#007AFF" />
            <Text style={styles.cardTitle}>Showroom Address</Text>
          </View>
          <Text style={styles.address}>{showroomAddress}</Text>
          <TouchableOpacity style={styles.mapButton} onPress={handleOpenMaps}>
            <Ionicons name="map-outline" size={20} color="#007AFF" />
            <Text style={styles.mapButtonText}>Open in Maps</Text>
          </TouchableOpacity>
        </View>

        {/* Contact Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="call-outline" size={24} color="#007AFF" />
            <Text style={styles.cardTitle}>Phone</Text>
          </View>
          <Text style={styles.contactInfo}>{phoneNumber}</Text>
          <TouchableOpacity style={styles.contactButton} onPress={handleCall}>
            <Ionicons name="call" size={20} color="#fff" />
            <Text style={styles.contactButtonText}>Call Now</Text>
          </TouchableOpacity>
        </View>

        {/* Email Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="mail-outline" size={24} color="#007AFF" />
            <Text style={styles.cardTitle}>Email</Text>
          </View>
          <Text style={styles.contactInfo}>{email}</Text>
          <TouchableOpacity style={styles.emailButton} onPress={handleEmail}>
            <Ionicons name="mail" size={20} color="#007AFF" />
            <Text style={styles.emailButtonText}>Send Email</Text>
          </TouchableOpacity>
        </View>

        {/* Business Hours */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="time-outline" size={24} color="#007AFF" />
            <Text style={styles.cardTitle}>Business Hours</Text>
          </View>
          <View style={styles.hoursContainer}>
            <Text style={styles.hoursText}>Monday - Saturday: 9:00 AM - 8:00 PM</Text>
            <Text style={styles.hoursText}>Sunday: 10:00 AM - 6:00 PM</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  address: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 16,
  },
  contactInfo: {
    fontSize: 18,
    color: '#000',
    fontWeight: '600',
    marginBottom: 16,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#E3F2FD',
    gap: 8,
  },
  mapButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    gap: 8,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#E3F2FD',
    gap: 8,
  },
  emailButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  hoursContainer: {
    gap: 8,
  },
  hoursText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
});

export default ContactScreen;
