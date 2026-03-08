import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, StatusBar, Linking, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../utils/theme';
import { useNavigation } from '@react-navigation/native';

const ContactScreen = () => {
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const showroomAddress = "RPT Motors,\nSankagiri Main Road, Ottamethai,\nPallipalayam - 638006";
  const phoneNumber = "+91 9443262624"; // Using one of the provided mobiles as primary
  const email = "rptmotors@gmail.com";

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

  const handleEnquiry = () => {
    navigation.navigate('EnquiryForm');
  };

  const ContactItem = ({ icon, title, content, action, actionLabel }) => (
    <Animated.View
      style={[
        styles.contactRow,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
      ]}
    >
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={22} color="#000" />
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactLabel}>{title}</Text>
        <Text style={styles.contactValue}>{content}</Text>
        {action && (
          <TouchableOpacity onPress={action} style={styles.actionLink}>
            <Text style={styles.actionLinkText}>{actionLabel}</Text>
            <Ionicons name="arrow-forward" size={14} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Minimalist Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Get in Touch</Text>
          <Text style={styles.headerSubtitle}>We are here to help you</Text>
        </View>
        <View style={styles.headerIcon}>
          <Ionicons name="chatbubble-ellipses-outline" size={28} color="#000" />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* Primary Action */}
        <TouchableOpacity
          style={styles.mainActionBtn}
          onPress={handleEnquiry}
          activeOpacity={0.8}
        >
          <View style={styles.mainActionContent}>
            <Ionicons name="mail" size={24} color="#fff" />
            <Text style={styles.mainActionText}>Send Us a Message</Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Contact Details List */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>CONTACT DETAILS</Text>
        </View>

        <View style={styles.detailsContainer}>
          <ContactItem
            icon="location-outline"
            title="Visit Showroom"
            content={showroomAddress}
            action={handleOpenMaps}
            actionLabel="Get Directions"
          />

          <View style={styles.itemDivider} />

          <ContactItem
            icon="call-outline"
            title="Phone Support"
            content={phoneNumber}
            action={handleCall}
            actionLabel="Call Now"
          />

          <View style={styles.itemDivider} />

          <ContactItem
            icon="mail-outline"
            title="Email Support"
            content={email}
            action={handleEmail}
            actionLabel="Send Email"
          />
        </View>



        {/* Business Hours */}
        <View style={styles.hoursContainer}>
          <View style={styles.hoursHeaderRow}>
            <Ionicons name="time-outline" size={20} color="#000" />
            <Text style={styles.hoursHeading}>Business Hours</Text>
          </View>

          <View style={styles.hoursContent}>
            <View style={styles.hourRow}>
              <Text style={styles.dayText}>Mon - Sat</Text>
              <Text style={styles.timeText}>09:00 AM - 08:00 PM</Text>
            </View>
            <View style={[styles.hourRow, { marginTop: 8 }]}>
              <Text style={styles.dayText}>Sunday</Text>
              <Text style={[styles.timeText, { color: COLORS.primary }]}>10:00 AM - 06:00 PM</Text>
            </View>
          </View>
        </View>

        {/* Social Media Footer */}
        <View style={styles.socialSection}>
          <Text style={styles.socialTitle}>FOLLOW US</Text>
          <View style={styles.socialIcons}>
            {[
              { icon: 'logo-facebook', color: '#1877F2' },
              { icon: 'logo-instagram', color: '#E4405F' },
              { icon: 'logo-twitter', color: '#1DA1F2' },
              { icon: 'logo-whatsapp', color: '#25D366' }
            ].map((item, i) => (
              <TouchableOpacity key={i} style={styles.socialBtn}>
                <Ionicons name={item.icon} size={22} color={item.color} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingHorizontal: 24,
    paddingBottom: 20,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
    marginTop: 4,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },

  mainActionBtn: {
    backgroundColor: '#000',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...SHADOWS.medium,
    shadowColor: '#000',
    shadowOpacity: 0.2,
  },
  mainActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mainActionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 30,
  },

  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8E8E93',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  detailsContainer: {
    backgroundColor: '#F9F9F9',
    borderRadius: 20,
    padding: 20,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFEFEF',
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
    paddingTop: 2,
  },
  contactLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  actionLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  itemDivider: {
    height: 1,
    backgroundColor: '#EFEFEF',
    marginVertical: 16,
    marginLeft: 56, // Align with text start
  },

  mapContainer: {
    height: 160,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#F5F5F7',
  },
  mapTouch: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFEFEF',
    borderRadius: 20,
  },
  mapText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },

  hoursContainer: {
    marginTop: 30,
    backgroundColor: '#F9F9F9',
    borderRadius: 20,
    padding: 20,
  },
  hoursHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  hoursHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  hourRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  timeText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
  },

  socialSection: {
    marginTop: 40,
    alignItems: 'center',
  },
  socialTitle: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '700',
    marginBottom: 20,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  socialIcons: {
    flexDirection: 'row',
    gap: 24,
  },
  socialBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ContactScreen;
