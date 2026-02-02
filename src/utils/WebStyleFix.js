import { Platform } from 'react-native';

export const injectWebStyles = () => {
    if (Platform.OS === 'web') {
        try {
            const styleId = 'custom-auth-web-styles';
            if (!document.getElementById(styleId)) {
                const style = document.createElement('style');
                style.id = styleId;
                style.textContent = `
          input::-ms-reveal,
          input::-ms-clear {
            display: none !important;
          }
          /* Additional web-only tweaks if needed */
          input:-webkit-autofill,
          input:-webkit-autofill:hover, 
          input:-webkit-autofill:focus, 
          input:-webkit-autofill:active{
              -webkit-box-shadow: 0 0 0 30px #F5F5F5 inset !important;
          }
        `;
                document.head.appendChild(style);
            }
        } catch (e) {
            console.warn('Failed to inject web styles', e);
        }
    }
};
