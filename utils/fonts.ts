import { jsPDF } from 'jspdf';

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function loadFonts(doc: jsPDF): Promise<void> {
  try {
    // Load Font Awesome
    const fontResponse = await fetch('/fonts/fa-solid-900.ttf');
    const fontArrayBuffer = await fontResponse.arrayBuffer();
    const fontBase64 = arrayBufferToBase64(fontArrayBuffer);
    
    // Add the font to the PDF document
    doc.addFileToVFS('fa-solid-900.ttf', fontBase64);
    doc.addFont('fa-solid-900.ttf', 'FontAwesome', 'normal');
  } catch (error) {
    console.error('Error loading fonts:', error);
    throw error;
  }
} 