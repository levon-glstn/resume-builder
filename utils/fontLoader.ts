// Since we're only using Arial which is a system font,
// we don't need complex font loading logic.
// This file is kept minimal for potential future font additions.

import fs from 'fs';
import path from 'path';

export const fonts = [
  { name: 'Arial', url: '' } // Arial is a system font, no URL needed
];

// Initialize fonts - kept for future extensibility
export const initFontsFromCache = () => {
  // No initialization needed for system fonts
};

// Preload fonts - kept for future extensibility
export const preloadFonts = async (): Promise<void> => {
  // No preloading needed for system fonts
};

// Load font - kept for future extensibility
export const loadFont = async (fontName: string): Promise<void> => {
  // No loading needed for system fonts
};

const getFontPath = (fontFileName: string): string => {
  // Try different possible paths
  const paths = [
    path.join(process.cwd(), 'public', 'fonts', fontFileName),
    path.join(process.cwd(), 'fonts', fontFileName),
    path.join(process.cwd(), '..', 'public', 'fonts', fontFileName)
  ];

  for (const p of paths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  throw new Error(`Font file not found: ${fontFileName}`);
};

export const loadFontAsBase64 = (fontFileName: string): string => {
  try {
    const fontPath = getFontPath(fontFileName);
    const fontBuffer = fs.readFileSync(fontPath);
    return fontBuffer.toString('base64');
  } catch (error) {
    console.error(`Error loading font ${fontFileName}:`, error);
    throw new Error(`Failed to load font ${fontFileName}`);
  }
};

export const getFontData = () => {
  try {
    return {
      regular: loadFontAsBase64('Rubik-Regular.ttf'),
      medium: loadFontAsBase64('Rubik-Medium.ttf'),
      semibold: loadFontAsBase64('Rubik-SemiBold.ttf'),
      bold: loadFontAsBase64('Rubik-Bold.ttf')
    };
  } catch (error) {
    console.error('Error getting font data:', error);
    throw new Error('Failed to load font data');
  }
}; 