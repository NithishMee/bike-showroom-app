import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '../../firebase';
import { AuthContext } from '../context/AuthContext';
import { COLORS, SIZES, SHADOWS } from '../utils/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const LoginScreen = ({ navigation, route }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Auth Context
    const { setIsGuest } = useContext(AuthContext);

    // Status States
    const [verificationSent, setVerificationSent] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [unverifiedUser, setUnverifiedUser] = useState(null);

    // Polling for Login Verification
    useEffect(() => {
        let interval;
        if (unverifiedUser) {
            interval = setInterval(async () => {
                try {
                    console.log("Polling login verification...");
                    await unverifiedUser.reload();
                    if (unverifiedUser.emailVerified) {
                        Alert.alert("Success", "Email Verified! Logging you in...");
                        setUnverifiedUser(null);
                        setErrorMsg(null);
                        await unverifiedUser.getIdToken(true); // Force refresh
                    }
                } catch (e) {
                    console.log("Polling error", e);
                }
            }, 3000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [unverifiedUser]);

    // Check for params from Signup
    useEffect(() => {
        if (route.params?.verificationSent) {
            setVerificationSent(true);
            const timer = setTimeout(() => setVerificationSent(false), 10000);
            return () => clearTimeout(timer);
        }
    }, [route.params]);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password');
            return;
        }

        setLoading(true);
        setErrorMsg(null);
        setUnverifiedUser(null);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            if (!user.emailVerified) {
                setUnverifiedUser(user);
                Alert.alert(
                    'Verification Required',
                    'Your email is not verified. Please check your inbox or spam folder.',
                    [
                        { text: 'Resend Email', onPress: () => handleResendEmail() },
                        { text: 'OK' }
                    ]
                );
                setLoading(false);
                return;
            }
        } catch (error) {
            console.error(error);
            let errorMessage = 'An error occurred during login';
            if (error.code === 'auth/invalid-email') errorMessage = 'Invalid email address';
            if (error.code === 'auth/user-not-found') errorMessage = 'User not found';
            if (error.code === 'auth/wrong-password') errorMessage = 'Incorrect password';
            if (error.code === 'auth/invalid-credential') errorMessage = 'Invalid credentials';

            setErrorMsg(errorMessage);
            setLoading(false);
        }
    };

    const handleResendEmail = async () => {
        if (!unverifiedUser) return;

        try {
            await sendEmailVerification(unverifiedUser);
            Alert.alert('Success', 'Verification email sent! Please check your Inbox and Spam folder.');
            setVerificationSent(true);
            setUnverifiedUser(null);
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to send. Please wait a moment and try again.');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                {/* Premium Header */}
                <View style={styles.headerContainer}>
                    <LinearGradient
                        colors={['#B71C1C', '#D32F2F', '#E53935']}
                        style={styles.headerGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.patternDots}>
                            {[...Array(20)].map((_, i) => (
                                <View key={i} style={[styles.patternDot, { left: Math.random() * width, top: Math.random() * 250, opacity: Math.random() * 0.4 }]} />
                            ))}
                        </View>

                        <View style={styles.headerContent}>
                            <View style={styles.navBar}>
                                <View style={{ flex: 1 }} />
                                <TouchableOpacity
                                    style={styles.skipButton}
                                    onPress={() => setIsGuest(true)}
                                >
                                    <Text style={styles.skipButtonText}>Skip</Text>
                                    <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.logoContainer}>
                                <Image
                                    source={require('../../assets/hero_logo.png')}
                                    style={styles.logoImage}
                                    resizeMode="contain"
                                />
                            </View>
                            <Text style={styles.welcomeText}>RPT Motors</Text>
                            <Text style={styles.subtitleText}>Sign in to your account</Text>
                        </View>
                    </LinearGradient>
                    <View style={styles.curveMask} />
                </View>

                {/* Main Card */}
                <View style={styles.cardContainer}>
                    <View style={styles.card}>

                        {/* Banners */}
                        {verificationSent && (
                            <View style={[styles.banner, styles.infoBanner]}>
                                <Ionicons name="mail-unread" size={24} color="#0D47A1" />
                                <View style={styles.bannerTextContainer}>
                                    <Text style={styles.bannerTitle}>Email Sent!</Text>
                                    <Text style={styles.bannerText}>Please check your inbox and SPAM folder.</Text>
                                </View>
                            </View>
                        )}

                        {errorMsg && (
                            <View style={[styles.banner, styles.errorBanner]}>
                                <Ionicons name="alert-circle" size={24} color="#D32F2F" />
                                <Text style={[styles.bannerText, { color: '#D32F2F', flex: 1, marginLeft: 10 }]}>{errorMsg}</Text>
                            </View>
                        )}

                        {unverifiedUser && (
                            <View style={[styles.banner, styles.warningBanner]}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Ionicons name="warning" size={24} color="#E65100" />
                                    <View style={styles.bannerTextContainer}>
                                        <Text style={[styles.bannerTitle, { color: '#E65100' }]}>Verification Pending</Text>
                                        <Text style={[styles.bannerText, { color: '#E65100' }]}>We are checking your status...</Text>
                                    </View>
                                </View>
                                <TouchableOpacity style={styles.resendButton} onPress={handleResendEmail}>
                                    <Text style={styles.resendButtonText}>Resend Email</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Inputs */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email Address</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="name@example.com"
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    placeholderTextColor="#999"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Password</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="••••••••"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    placeholderTextColor="#999"
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#999" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.forgotPassword}>
                            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.loginButton}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            <LinearGradient
                                colors={[COLORS.primary, '#B71C1C']}
                                style={styles.gradientButton}
                            >
                                {loading ? (
                                    <ActivityIndicator color={COLORS.white} />
                                ) : (
                                    <Text style={styles.loginButtonText}>LOGIN</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        <View style={styles.signupContainer}>
                            <Text style={styles.signupText}>New member? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                                <Text style={styles.signupLink}>Create Account</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    headerContainer: {
        marginBottom: 20,
    },
    headerGradient: {
        paddingTop: 40,
        paddingBottom: 40,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerContent: {
        alignItems: 'center',
    },
    navBar: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    skipButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    skipButtonText: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: 'bold',
        marginRight: 4,
    },
    logoContainer: {
        width: 80,
        height: 80,
        backgroundColor: '#fff', // White background for the logo
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        borderWidth: 0, // No border needed if logo has own shape
        ...SHADOWS.medium,
    },
    logoImage: {
        width: 50,
        height: 50,
    },
    welcomeText: {
        fontSize: 28,
        fontWeight: '900',
        fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif-condensed',
        letterSpacing: 2,
        color: COLORS.white,
        marginBottom: 5,
        textTransform: 'uppercase',
    },
    subtitleText: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
    },
    cardContainer: {
        paddingHorizontal: 20,
        marginTop: -40, // Pull up overlap
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        ...SHADOWS.medium,
        elevation: 5,
    },
    inputGroup: {
        marginBottom: 24, // More spacing
    },
    label: {
        fontSize: 14,
        color: '#424242', // Darker gray
        marginBottom: 8,
        fontWeight: '700', // Bolder
        textTransform: 'uppercase', // Optional: Premium feel
        letterSpacing: 0.5,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5', // Soft gray background
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 55,
        borderWidth: 0, // No border as requested
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        borderWidth: 0,
        height: '100%',
        // @ts-ignore - for web support
        outlineStyle: 'none',
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 24,
    },
    forgotPasswordText: {
        color: COLORS.primary,
        fontWeight: '600',
        fontSize: 13,
    },
    loginButton: {
        borderRadius: 14,
        overflow: 'hidden',
        ...SHADOWS.light,
        marginBottom: 24,
    },
    gradientButton: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loginButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    signupText: {
        color: '#757575',
        fontSize: 14,
    },
    signupLink: {
        color: COLORS.primary,
        fontWeight: 'bold',
        fontSize: 14,
    },
    banner: {
        padding: 15,
        borderRadius: 12,
        marginBottom: 20,
        borderWidth: 1,
    },
    infoBanner: {
        backgroundColor: '#E3F2FD',
        borderColor: '#BBDEFB',
        flexDirection: 'row',
        alignItems: 'center',
    },
    errorBanner: {
        backgroundColor: '#FFEBEE',
        borderColor: '#FFCDD2',
        flexDirection: 'row',
        alignItems: 'center',
    },
    warningBanner: {
        backgroundColor: '#FFF3E0',
        borderColor: '#FFE0B2',
    },
    bannerTextContainer: {
        flex: 1,
        marginLeft: 10,
    },
    bannerTitle: {
        fontWeight: 'bold',
        fontSize: 14,
        marginBottom: 2,
    },
    bannerText: {
        fontSize: 12,
        lineHeight: 16,
    },
    resendButton: {
        marginTop: 10,
        backgroundColor: 'rgba(230, 81, 0, 0.1)',
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 8,
    },
    resendButtonText: {
        color: '#E65100',
        fontWeight: 'bold',
        fontSize: 12,
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

export default LoginScreen;
