// Image Mapper for Local and Network Images

export const bikeImages = {
    'passion_plus': require('../../assets/images/bikes/passion_plus.png'),
    'xtreme_125r': require('../../assets/images/bikes/xtreme_125r.png'),
    'glamour_xtec': require('../../assets/images/bikes/glamour_xtec.png'),
    'xpulse_200_4v': require('../../assets/images/bikes/xpulse_200_4v.png'),
    'hf_deluxe': require('../../assets/images/bikes/hf_deluxe.png'),
    'mavrick_440': require('../../assets/images/bikes/mavrick_440.png'),
    'karizma_xmr': require('../../assets/images/bikes/karizma_xmr.png'),
    'destini_125_xtec': require('../../assets/images/bikes/destini_125_xtec.png'),
    'super_splendor_xtec': require('../../assets/images/bikes/super_splendor_xtec.png'),
    'pleasure_plus_xtec': require('../../assets/images/bikes/pleasure_plus_xtec.jpg'),
    // Add more mappings here as you add more images
    // 'splendor_plus': require('../../assets/images/bikes/splendor_plus.png'),
};

export const getBikeImage = (imageSource) => {
    if (!imageSource) return null;

    // Check if it's a local key (e.g., "local:passion_plus")
    if (typeof imageSource === 'string' && imageSource.startsWith('local:')) {
        const key = imageSource.split(':')[1];
        return bikeImages[key] || null; // Return null if key not found (handle default in component)
    }

    // Otherwise assume it's a URL
    return { uri: imageSource };
};
