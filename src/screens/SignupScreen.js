import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Dimensions } from 'react-native';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
import { auth } from '../../firebase';
import { COLORS, SIZES, SHADOWS } from '../utils/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const SignupScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Flow State
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [confirmError, setConfirmError] = useState('');
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [verificationSent, setVerificationSent] = useState(false);
    const [createdUser, setCreatedUser] = useState(null);

    // Polling Ref
    const pollingInterval = useRef(null);

    // Cleanup polling on unmount
    useEffect(() => {
        return () => {
            if (pollingInterval.current) clearInterval(pollingInterval.current);
        };
    }, []);

    // Monitoring Verification
    useEffect(() => {
        if (verificationSent && createdUser && !isEmailVerified) {
            pollingInterval.current = setInterval(async () => {
                try {
                    await createdUser.reload();
                    if (createdUser.emailVerified) {
                        setIsEmailVerified(true);
                        setVerificationSent(false); // Stop showing "Sent" UI, show "Verified" UI
                        clearInterval(pollingInterval.current);
                        Alert.alert("Success", "Email Verified! You can now complete your signup.");
                    }
                } catch (e) {
                    console.log("Polling error:", e);
                }
            }, 3000); // Check every 3 seconds
        }
    }, [verificationSent, createdUser]);

    const handleVerifyEmail = async () => {
        if (!name || !email || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields first');
            return;
        }

        if (password !== confirmPassword) {
            setConfirmError('Passwords do not match');
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Error', 'Password should be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            // 1. Create the user (Pending state)
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Send Link
            await sendEmailVerification(user);

            setCreatedUser(user);
            setVerificationSent(true);

            Alert.alert(
                'Verification Sent',
                'We have sent a link to your email. Please check your inbox (and spam) and click the link. The app will detect it automatically.',
            );

        } catch (error) {
            let errorMessage = 'An error occurred';
            if (error.code === 'auth/email-already-in-use') {
                setEmailError('This email is already registered. Please Login.');
                Alert.alert('Existing Account', 'This email is already registered. Please go to Login.');
                return;
            }
            if (error.code === 'auth/invalid-email') errorMessage = 'Invalid email address';
            if (error.code === 'auth/weak-password') errorMessage = 'Password is too weak';
            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteSignup = async () => {
        if (!createdUser || !isEmailVerified) {
            Alert.alert("Pending", "Please verify your email first.");
            return;
        }

        setLoading(true);
        try {
            await updateProfile(createdUser, {
                displayName: name
            });

            // Navigate to Login
            navigation.navigate('Login');

        } catch (error) {
            Alert.alert('Error', 'Failed to finalize profile: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
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

                        <View style={styles.navBar}>
                            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                                <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>Create Account</Text>
                            <View style={{ width: 40 }} />
                        </View>
                    </LinearGradient>
                    <View style={styles.curveMask} />
                </View>

                {/* Main Card */}
                <View style={styles.cardContainer}>
                    <View style={styles.card}>

                        {/* Status Banners */}
                        {isEmailVerified && (
                            <View style={styles.successBanner}>
                                <Ionicons name="checkmark-circle" size={24} color="#2E7D32" />
                                <Text style={styles.successText}>Email Verified! Ready to start.</Text>
                            </View>
                        )}

                        {verificationSent && !isEmailVerified && (
                            <View style={styles.waitingBanner}>
                                <ActivityIndicator size="small" color={COLORS.primary} style={{ marginRight: 10 }} />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.waitingTitle}>Verification Link Sent</Text>
                                    <Text style={styles.waitingText}>Please check your inbox. Waiting for confirmation...</Text>
                                </View>
                            </View>
                        )}

                        {/* Inputs */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Full Name</Text>
                            <View style={[styles.inputWrapper, isEmailVerified && styles.disabledInput]}>
                                <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="John Doe"
                                    value={name}
                                    onChangeText={setName}
                                    editable={!createdUser} // Lock after creation
                                    placeholderTextColor="#999"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email Address</Text>
                            <View style={[
                                styles.inputWrapper,
                                isEmailVerified && styles.disabledInput,
                                emailError ? { borderColor: COLORS.error || '#D32F2F', borderWidth: 1 } : {}
                            ]}>
                                <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="name@example.com"
                                    value={email}
                                    onChangeText={(text) => {
                                        setEmail(text);
                                        setEmailError('');
                                    }}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    editable={!createdUser}
                                    placeholderTextColor="#999"
                                />
                            </View>
                            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Password</Text>
                            <View style={[styles.inputWrapper, isEmailVerified && styles.disabledInput]}>
                                <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="••••••••"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    editable={!createdUser}
                                    placeholderTextColor="#999"
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#999" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Confirm Password</Text>
                            <View style={[
                                styles.inputWrapper,
                                isEmailVerified && styles.disabledInput,
                                confirmError ? { borderColor: COLORS.error || '#D32F2F', borderWidth: 1 } : {}
                            ]}>
                                <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChangeText={(text) => {
                                        setConfirmPassword(text);
                                        setConfirmError('');
                                    }}
                                    secureTextEntry={!showPassword}
                                    editable={!createdUser}
                                    placeholderTextColor="#999"
                                />
                            </View>
                            {confirmError ? <Text style={styles.errorText}>{confirmError}</Text> : null}
                        </View>

                        {/* Action Buttons */}
                        {!isEmailVerified ? (
                            <TouchableOpacity
                                style={[styles.signupButton]}
                                onPress={handleVerifyEmail}
                                disabled={loading || verificationSent}
                            >
                                <LinearGradient
                                    colors={verificationSent ? ['#B0BEC5', '#78909C'] : [COLORS.primary, '#B71C1C']}
                                    style={styles.gradientButton}
                                >
                                    {loading ? (
                                        <ActivityIndicator color={COLORS.white} />
                                    ) : (
                                        <Text style={styles.signupButtonText}>
                                            {verificationSent ? 'Link Sent' : 'VERIFY EMAIL'}
                                        </Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                style={[styles.signupButton]}
                                onPress={handleCompleteSignup}
                                disabled={loading}
                            >
                                <LinearGradient
                                    colors={['#43A047', '#2E7D32']}
                                    style={styles.gradientButton}
                                >
                                    {loading ? (
                                        <ActivityIndicator color={COLORS.white} />
                                    ) : (
                                        <Text style={styles.signupButtonText}>COMPLETE SIGNUP</Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        )}

                        <View style={styles.loginContainer}>
                            <Text style={styles.loginText}>Already a member? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.loginLink}>Login Here</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
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
        paddingTop: 20, // Minimal
        paddingBottom: 15, // Minimal
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    navBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 10,
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
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.white,
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
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        color: '#424242', // Darker gray
        marginBottom: 8,
        fontWeight: '700', // Bolder
        textTransform: 'uppercase', // Premium feel
        letterSpacing: 0.5,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 55,
        borderWidth: 0,
    },
    disabledInput: {
        backgroundColor: '#F0F0F0',
        borderColor: '#E0E0E0'
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
    signupButton: {
        borderRadius: 14,
        overflow: 'hidden',
        ...SHADOWS.light,
        marginBottom: 24,
        marginTop: 10,
    },
    gradientButton: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    signupButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginText: {
        color: '#757575',
        fontSize: 14,
    },
    loginLink: {
        color: COLORS.primary,
        fontWeight: 'bold',
        fontSize: 14,
    },
    successBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        padding: 15,
        borderRadius: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#C8E6C9'
    },
    successText: {
        color: '#2E7D32',
        fontWeight: 'bold',
        marginLeft: 10,
    },
    waitingBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF3E0',
        padding: 15,
        borderRadius: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.primary + '40' // faint red
    },
    waitingTitle: {
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 2,
    },
    waitingText: {
        color: COLORS.primary,
        fontSize: 12,
    },
    errorText: {
        color: COLORS.error || '#D32F2F',
        fontSize: 12,
        marginTop: 5,
        marginLeft: 5,
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

export default SignupScreen;
