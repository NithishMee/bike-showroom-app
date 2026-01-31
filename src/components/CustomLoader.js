import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '../utils/theme';
import { Ionicons } from '@expo/vector-icons';

const CustomLoader = () => {
    const spinValue = new Animated.Value(0);
    const pulseValue = new Animated.Value(1);

    useEffect(() => {
        // Spin Animation
        Animated.loop(
            Animated.timing(spinValue, {
                toValue: 1,
                duration: 2000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();

        // Pulse Animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseValue, {
                    toValue: 1.2,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseValue, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[COLORS.background, COLORS.surface]}
                style={styles.background}
            />

            <View style={styles.content}>
                <Animated.View style={{ transform: [{ rotate: spin }, { scale: pulseValue }] }}>
                    <Ionicons name="bicycle" size={60} color={COLORS.primary} />
                </Animated.View>

                <Text style={styles.text}>Loading Showroom...</Text>

                <View style={styles.barContainer}>
                    <Animated.View
                        style={[
                            styles.barFill,
                            {
                                width: spinValue.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: ['0%', '100%']
                                })
                            }
                        ]}
                    />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    background: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    content: {
        alignItems: 'center',
    },
    text: {
        marginTop: 20,
        fontSize: SIZES.h3,
        color: COLORS.textSecondary,
        fontWeight: '600',
        letterSpacing: 1,
    },
    barContainer: {
        width: 200,
        height: 4,
        backgroundColor: COLORS.surfaceDark,
        borderRadius: 2,
        marginTop: 15,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        backgroundColor: COLORS.primary,
    }
});

export default CustomLoader;
