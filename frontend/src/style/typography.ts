import { Platform } from 'react-native';

if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const linkId = 'google-font-nunito';
  if (!document.getElementById(linkId)) {
    const link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap';
    document.head.appendChild(link);

    const style = document.createElement('style');
    style.id = 'google-font-nunito-style';
    style.textContent = `
      body, button, input, textarea, select {
        font-family: 'Nunito', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      }
      [style*="Ionicons"],
      [style*="ionicons"],
      [style*="font-family: Ionicons"],
      [style*="font-family: 'Ionicons'"],
      [style*='font-family: "Ionicons"'],
      [data-icon],
      .ionicons {
        font-family: Ionicons !important;
      }
    `;
    document.head.appendChild(style);
  }
}

export const fonts = {
  regular: 'Nunito_400Regular',
  medium: 'Nunito_500Medium',
  semiBold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  extraBold: 'Nunito_800ExtraBold',
};
