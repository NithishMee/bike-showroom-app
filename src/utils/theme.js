export const COLORS = {
    primary: '#EE2824', // Hero Red
    secondary: '#000000', // Black
    background: '#FFFFFF', // White background for cleaner look
    surface: '#F8F9FA', // Light gray for slight contrast
    card: '#FFFFFF',
    textPrimary: '#1A1A1A',
    textSecondary: '#666666',
    white: '#FFFFFF',
    error: '#FF3B30',
    success: '#34C759',
    border: '#E1E1E1',
    shadow: '#000000',
};

export const SHADOWS = {
    small: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    medium: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 4,
    },
};
