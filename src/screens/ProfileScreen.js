import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth } from '../../firebase';
import { COLORS, SIZES, SHADOWS } from '../utils/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const ProfileScreen = ({ navigation }) => {
    const user = auth.currentUser;
    const [name, setName] = useState(user?.displayName || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleUpdateProfile = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Name cannot be empty');
            return;
        }

        setLoading(true);
        try {
            await updateProfile(user, {
                displayName: name
            });
            Alert.alert('Success', 'Profile updated successfully!');
            // Optional: navigation.goBack();
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (!currentPassword || !newPassword) {
            Alert.alert('Error', 'Please enter both current and new passwords');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Error', 'New password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPassword);

            Alert.alert('Success', 'Password updated! Please login again.');
            setCurrentPassword('');
            setNewPassword('');
        } catch (error) {
            console.error(error);
            let msg = 'Failed to update password.';
            if (error.code === 'auth/wrong-password') msg = 'Current password is incorrect.';
            if (error.code === 'auth/requires-recent-login') msg = 'Please login again before changing password.';
            Alert.alert('Error', msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

                {/* Premium Header Container */}
                <View style={styles.headerContainer}>
                    <LinearGradient
                        colors={['#B71C1C', '#D32F2F', '#E53935']}
                        style={styles.headerGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        {/* Pattern Overlay */}
                        <View style={styles.patternDots}>
                            {[...Array(15)].map((_, i) => (
                                <View key={i} style={[styles.patternDot, { left: Math.random() * width, top: Math.random() * 200, opacity: Math.random() * 0.4 }]} />
                            ))}
                        </View>

                        <View style={styles.navBar}>
                            <TouchableOpacity
                                style={styles.backButton}
                                onPress={() => navigation.goBack()}
                            >
                                <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>Edit Profile</Text>
                            <View style={{ width: 40 }} />
                        </View>

                        {/* Profile Info in Header */}
                        <View style={styles.profileHeaderContent}>
                            <View style={styles.avatarWrapper}>
                                <Image
                                    source={{ uri: `https://ui-avatars.com/api/?name=${name || 'User'}&background=ffffff&color=B71C1C&size=200&length=1&bold=true` }}
                                    style={styles.avatar}
                                />
                                <View style={styles.cameraBadge}>
                                    <Ionicons name="camera" size={18} color={COLORS.white} />
                                </View>
                            </View>
                            <Text style={styles.userNameHeader}>{name || 'Hero User'}</Text>
                            <Text style={styles.userEmailHeader}>{user?.email}</Text>
                        </View>
                    </LinearGradient>

                    {/* Curve Bottom */}
                    <View style={styles.curveMask} />
                </View>

                {/* Main Content Areas */}
                <View style={styles.contentContainer}>

                    {/* Status Card */}
                    <View style={styles.statusCard}>
                        <View style={styles.statusRow}>
                            <View style={styles.statusIconContainer}>
                                <Ionicons name="shield-checkmark" size={24} color={user?.emailVerified ? "#2E7D32" : "#F57C00"} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.statusLabel}>Account Status</Text>
                                <Text style={[styles.statusValue, { color: user?.emailVerified ? "#2E7D32" : "#F57C00" }]}>
                                    {user?.emailVerified ? "Verified Member" : "Verification Pending"}
                                </Text>
                            </View>
                            {user?.emailVerified && <Ionicons name="checkmark-circle" size={24} color="#2E7D32" />}
                        </View>
                    </View>

                    {/* Edit Details Section */}
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Ionicons name="person" size={20} color={COLORS.primary} />
                            <Text style={styles.cardTitle}>Personal Information</Text>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Full Name</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.input}
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="Enter your name"
                                />
                                <Ionicons name="create-outline" size={20} color="#999" />
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.updateButton}
                            onPress={handleUpdateProfile}
                            disabled={loading}
                        >
                            <LinearGradient
                                colors={['#333', '#000']}
                                style={styles.buttonGradient}
                            >
                                <Text style={styles.buttonText}>Update Profile</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    {/* Security Section */}
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Ionicons name="lock-closed" size={20} color={COLORS.primary} />
                            <Text style={styles.cardTitle}>Security</Text>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Current Password</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.input}
                                    value={currentPassword}
                                    onChangeText={setCurrentPassword}
                                    secureTextEntry={!showPassword}
                                    placeholder="••••••••"
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#999" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>New Password</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.input}
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    secureTextEntry={!showPassword}
                                    placeholder="Min 6 characters"
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.updateButton}
                            onPress={handleUpdatePassword}
                            disabled={loading}
                        >
                            <LinearGradient
                                colors={[COLORS.primary, '#B71C1C']}
                                style={styles.buttonGradient}
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.buttonText}>Change Password</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                </View>

            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    headerContainer: {
        marginBottom: 20,
    },
    headerGradient: {
        paddingTop: 50,
        paddingBottom: 50,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    navBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    profileHeaderContent: {
        alignItems: 'center',
    },
    avatarWrapper: {
        position: 'relative',
        marginBottom: 15,
        ...SHADOWS.medium,
    },
    avatar: {
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    cameraBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#333',
        width: 34,
        height: 34,
        borderRadius: 17,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: COLORS.primary, // Red border matching gradient roughly
    },
    userNameHeader: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
    },
    userEmailHeader: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
    },
    contentContainer: {
        paddingHorizontal: 20,
        marginTop: -30, // Pull up to overlap
    },
    statusCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        ...SHADOWS.medium,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    statusLabel: {
        fontSize: 12,
        color: '#757575',
        marginBottom: 2,
    },
    statusValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        ...SHADOWS.light,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 10,
    },
    inputContainer: {
        marginBottom: 18,
    },
    inputLabel: {
        fontSize: 13,
        color: '#666',
        marginBottom: 8,
        fontWeight: '500',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9F9F9',
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 50,
        borderWidth: 1,
        borderColor: '#eee',
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#333',
    },
    updateButton: {
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 10,
        ...SHADOWS.medium,
    },
    buttonGradient: {
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 15,
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

export default ProfileScreen;
