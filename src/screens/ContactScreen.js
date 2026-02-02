import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, StatusBar, Linking, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../utils/theme';

const { width } = Dimensions.get('window');

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
    const encodedAddress = encodeURIComponent(showroomAddress);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`);
  };

  const ContactCard = ({ icon, title, content, action, actionLabel, color }) => (
    <View style={styles.card}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardValue}>{content}</Text>
        {action && (
          <TouchableOpacity style={styles.linkButton} onPress={action}>
            <Text style={[styles.linkText, { color }]}>{actionLabel}</Text>
            <Ionicons name="arrow-forward" size={14} color={color} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Premium Gradient Header */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={['#B71C1C', '#D32F2F', '#E53935']}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.patternDots}>
            {[...Array(20)].map((_, i) => (
              <View key={i} style={[styles.patternDot, { left: Math.random() * width, top: Math.random() * 150, opacity: Math.random() * 0.4 }]} />
            ))}
          </View>

          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Get in Touch</Text>
            <Text style={styles.headerSubtitle}>We'd love to hear from you</Text>
          </View>
        </LinearGradient>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Placeholder Map / Showroom Image */}
        <View style={styles.mapContainer}>
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map" size={40} color="#CFD8DC" />
            <Text style={styles.mapText}>Showroom Location Map</Text>
            <TouchableOpacity style={styles.mapButton} onPress={handleOpenMaps}>
              <Text style={styles.mapButtonText}>View on Google Maps</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Contact Info Cards */}
        <View style={styles.sectionContainer}>
          <ContactCard
            icon="location"
            title="Our Showroom"
            content={showroomAddress}
            action={handleOpenMaps}
            actionLabel="Get Directions"
            color="#E65100"
          />

          <ContactCard
            icon="call"
            title="Phone Number"
            content={phoneNumber}
            action={handleCall}
            actionLabel="Call Now"
            color="#1565C0"
          />

          <ContactCard
            icon="mail"
            title="Email Address"
            content={email}
            action={handleEmail}
            actionLabel="Send Email"
            color="#C2185B"
          />
        </View>

        {/* Business Hours */}
        <View style={styles.hoursCard}>
          <View style={styles.hoursHeader}>
            <Ionicons name="time-outline" size={24} color={COLORS.textPrimary} />
            <Text style={styles.hoursTitle}>Business Hours</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.hourRow}>
            <Text style={styles.day}>Monday - Saturday</Text>
            <View style={styles.timeBadge}>
              <Text style={styles.time}>9:00 AM - 8:00 PM</Text>
            </View>
          </View>
          <View style={styles.hourRow}>
            <Text style={styles.day}>Sunday</Text>
            <View style={[styles.timeBadge, { backgroundColor: '#FFF3E0' }]}>
              <Text style={[styles.time, { color: '#E65100' }]}>10:00 AM - 6:00 PM</Text>
            </View>
          </View>
        </View>

        {/* Social Media Footer */}
        <View style={styles.socialSection}>
          <Text style={styles.socialTitle}>Connect with us</Text>
          <View style={styles.socialIcons}>
            {['logo-facebook', 'logo-instagram', 'logo-twitter', 'logo-whatsapp'].map((icon, i) => (
              <TouchableOpacity key={i} style={styles.socialBtn}>
                <Ionicons name={icon} size={22} color={COLORS.primary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerContainer: {
    marginBottom: 0,
    zIndex: 1,
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 50,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
    marginTop: -30,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  mapContainer: {
    height: 140,
    width: '100%',
    backgroundColor: '#ECEFF1',
    borderRadius: 20,
    marginBottom: 20,
    ...SHADOWS.medium,
    overflow: 'hidden',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 20,
  },
  mapText: {
    color: '#90A4AE',
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 10,
  },
  mapButton: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    ...SHADOWS.small,
  },
  mapButtonText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  sectionContainer: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...SHADOWS.light,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 13,
    color: '#757575',
    fontWeight: '600',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  linkText: {
    fontSize: 13,
    fontWeight: '600',
  },
  hoursCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
    ...SHADOWS.medium,
  },
  hoursHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  hoursTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginLeft: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginBottom: 15,
  },
  hourRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  day: {
    fontSize: 15,
    color: '#555',
    fontWeight: '600',
  },
  timeBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  time: {
    fontSize: 13,
    color: '#2E7D32',
    fontWeight: '700',
  },
  socialSection: {
    alignItems: 'center',
  },
  socialTitle: {
    fontSize: 14,
    color: '#999',
    fontWeight: '600',
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  socialIcons: {
    flexDirection: 'row',
    gap: 25,
  },
  socialBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.light,
  },
  patternDots: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  patternDot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#fff',
  }
});

export default ContactScreen;
