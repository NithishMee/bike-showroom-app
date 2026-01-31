import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, StatusBar, Linking } from 'react-native';
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
      <View style={styles.iconContainer}>
        <View style={[styles.iconCircle, { backgroundColor: `${color}15` }]}>
          <Ionicons name={icon} size={28} color={color} />
        </View>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardValue}>{content}</Text>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: color }]} onPress={action}>
          <Text style={styles.actionButtonText}>{actionLabel}</Text>
          <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Hero Header */}
      <LinearGradient
        colors={[COLORS.primaryDark, COLORS.primary]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Get in Touch</Text>
          <Text style={styles.headerSubtitle}>We'd love to hear from you</Text>
        </View>

        {/* Decorative Pattern */}
        <Ionicons name="chatbubbles-outline" size={120} color="rgba(255,255,255,0.1)" style={styles.headerIcon} />
      </LinearGradient>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Main Contact Cards */}
        <View style={styles.cardsContainer}>
          <ContactCard
            icon="location"
            title="Visit Our Showroom"
            content={showroomAddress}
            action={handleOpenMaps}
            actionLabel="Get Directions"
            color="#FF9800"
          />

          <ContactCard
            icon="call"
            title="Call Us"
            content={phoneNumber}
            action={handleCall}
            actionLabel="Call Now"
            color="#2196F3"
          />

          <ContactCard
            icon="mail"
            title="Email Support"
            content={email}
            action={handleEmail}
            actionLabel="Send Email"
            color="#E91E63"
          />
        </View>

        {/* Business Hours */}
        <View style={styles.hoursCard}>
          <View style={styles.hoursHeader}>
            <Ionicons name="time" size={24} color={COLORS.textPrimary} />
            <Text style={styles.hoursTitle}>Business Hours</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.hourRow}>
            <Text style={styles.day}>Monday - Saturday</Text>
            <Text style={styles.time}>9:00 AM - 8:00 PM</Text>
          </View>
          <View style={styles.hourRow}>
            <Text style={styles.day}>Sunday</Text>
            <Text style={styles.time}>10:00 AM - 6:00 PM</Text>
          </View>
        </View>

        {/* Connect Section */}
        <View style={styles.connectSection}>
          <Text style={styles.connectTitle}>Connect with us</Text>
          <View style={styles.socialRow}>
            {['logo-facebook', 'logo-instagram', 'logo-twitter', 'logo-whatsapp'].map((icon, index) => (
              <TouchableOpacity key={index} style={styles.socialIcon}>
                <Ionicons name={icon} size={24} color={COLORS.primary} />
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
  header: {
    height: 240,
    paddingTop: 60,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    position: 'relative',
    overflow: 'hidden',
  },
  headerContent: {
    zIndex: 2,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  headerIcon: {
    position: 'absolute',
    right: -20,
    bottom: -30,
    transform: [{ rotate: '-10deg' }]
  },
  scrollView: {
    flex: 1,
    marginTop: -80,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  cardsContainer: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    ...SHADOWS.medium,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 15,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 4,
  },
  hoursCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    ...SHADOWS.light,
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
    marginBottom: 10,
  },
  day: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  time: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  connectSection: {
    alignItems: 'center',
  },
  connectTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 15,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 20,
  },
  socialIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.light,
  }
});

export default ContactScreen;
