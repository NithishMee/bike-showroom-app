# Assets Folder

This folder should contain the following image files for the Expo app:

- **icon.png** (1024x1024) - App icon
- **splash.png** (1242x2436) - Splash screen image
- **adaptive-icon.png** (1024x1024) - Android adaptive icon
- **favicon.png** (48x48) - Web favicon (optional)

## Quick Setup

You can generate these assets using Expo's asset generator or create them manually:

1. **Using Expo CLI** (recommended):
   ```bash
   npx expo install expo-asset
   ```

2. **Or create simple placeholder images** using any image editor:
   - Use a solid color or simple logo
   - Ensure correct dimensions as specified above

3. **For now, you can use placeholder URLs** or remove the web favicon from app.json if you're only targeting mobile platforms.

## Temporary Fix

If you're getting errors about missing assets, you can temporarily comment out the web section in `app.json` or create simple placeholder PNG files with the correct dimensions.
