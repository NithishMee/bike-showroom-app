export const COLORS = {
    // Primary - Hero Red Gradients
    primary: '#EE2824',
    primaryDark: '#B9120E',
    primaryGradient: ['#FF4D4D', '#EE2824'], // Light to Hero Red

    // Backgrounds
    background: '#FEFefe', // Almost white
    surface: '#F5F5F7', // iOS style light gray
    surfaceDark: '#E5E5EA',

    // Text
    textPrimary: '#1C1C1E', // Almost black
    textSecondary: '#636366', // Dark gray
    textLight: '#AEAEB2',

    // Functional
    white: '#FFFFFF',
    black: '#000000',
    error: '#FF3B30',
    success: '#34C759',
    warning: '#FFCC00',

    // UI Elements
    border: '#C6C6C8',
    card: '#FFFFFF',
    shadow: '#000000',
    overlay: 'rgba(0,0,0,0.5)',
};

export const SIZES = {
    // Global sizes
    base: 8,
    font: 14,
    radius: 12,
    padding: 24,

    // Font Sizes
    h1: 30,
    h2: 22,
    h3: 16,
    h4: 14,
    body1: 30,
    body2: 22,
    body3: 16,
    body4: 14,
};

export const SHADOWS = {
    light: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3,
    },
    medium: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.29,
        shadowRadius: 4.65,
        elevation: 7,
    },
    dark: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 7 },
        shadowOpacity: 0.41,
        shadowRadius: 9.11,
        elevation: 14,
    },
};

const appTheme = { COLORS, SIZES, SHADOWS };

export default appTheme;
