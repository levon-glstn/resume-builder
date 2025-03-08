import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import FontFaceObserver from 'fontfaceobserver';
import type { ResumeContent } from '@/types/resume';

type RGBColor = [number, number, number];

// Font Awesome unicode characters (using solid style)
const ICONS = {
  email: '\uf0e0',      // fa-envelope
  phone: '\uf095',      // fa-phone
  location: '\uf3c5',   // fa-map-marker-alt
  linkedin: '\uf0c6',   // fa-linkedin
  github: '\uf09b',     // fa-github
  url: '\uf0ac'         // fa-globe
};

// Section spacing constants
const SPACING = {
  AFTER_HEADER: 15,     // Space after the header section (name, title, contacts)
  BETWEEN_SECTIONS: 15, // Reduced from 25 to 15
  AFTER_SECTION_TITLE: 2, // Space after section titles (reduced from 8)
  BETWEEN_ITEMS: 10,    // Reduced from 15 to 10
};

function drawIcon(doc: jsPDF, type: string, x: number, y: number, color: RGBColor) {
  const size = 3; // icon size in mm
  doc.setDrawColor(...color);
  doc.setLineWidth(0.2);

  switch (type) {
    case 'email':
      // Envelope icon
      doc.line(x, y, x + size, y); // top
      doc.line(x, y, x + (size/2), y + (size/2)); // left diagonal
      doc.line(x + size, y, x + (size/2), y + (size/2)); // right diagonal
      doc.line(x, y, x, y + size); // left
      doc.line(x + size, y, x + size, y + size); // right
      doc.line(x, y + size, x + size, y + size); // bottom
      break;
    
    case 'phone':
      // Phone icon
      doc.roundedRect(x, y, size, size, 0.5, 0.5);
      doc.line(x + (size/3), y + (size/1.2), x + (size/1.5), y + (size/1.2));
      break;
    
    case 'location':
      // Location pin
      doc.circle(x + (size/2), y + (size/2), size/3, 'S');
      doc.line(x + (size/2), y + (size/2), x + (size/2), y + size);
      break;
    
    case 'linkedin':
      // LinkedIn icon
      doc.roundedRect(x, y, size, size, 0.5, 0.5);
      doc.setFillColor(...color);
      doc.circle(x + (size/3), y + (size/3), size/6, 'F');
      doc.line(x + (size/3), y + (size/2), x + (size/3), y + (size/1.2));
      doc.line(x + (size/1.5), y + (size/2), x + (size/1.5), y + (size/1.2));
      doc.line(x + (size/1.5), y + (size/2), x + (size/1.2), y + (size/2));
      break;
      
    case 'github':
      // GitHub icon
      doc.circle(x + (size/2), y + (size/2), size/2, 'S');
      // Draw a cat-like face inside the circle
      doc.circle(x + (size/3), y + (size/2.5), size/8, 'S'); // left eye
      doc.circle(x + (size/1.5), y + (size/2.5), size/8, 'S'); // right eye
      doc.line(x + (size/3), y + (size/1.5), x + (size/1.5), y + (size/1.5)); // mouth
      break;
  }
}

// Wait for fonts to load before generating PDF
async function waitForFonts() {
  // Create a link element for the Poppins font if it doesn't exist
  if (!document.querySelector('link[href*="Poppins"]')) {
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap';
    document.head.appendChild(fontLink);
    
    // Create a span with Poppins font to force loading
    const span = document.createElement('span');
    span.style.fontFamily = 'Poppins, sans-serif';
    span.style.fontWeight = 'bold';
    span.style.position = 'absolute';
    span.style.visibility = 'hidden';
    span.textContent = 'Poppins Font Preload';
    document.body.appendChild(span);
  }

  const fonts = [
    new FontFaceObserver('Helvetica'),
    new FontFaceObserver('FontAwesome'),
    new FontFaceObserver('Poppins'),
    new FontFaceObserver('Poppins', { weight: 700 }) // Bold version
  ];

  try {
    await Promise.all(fonts.map(font => font.load(null, 5000)));
    console.log('Fonts loaded successfully for PDF generation');
  } catch (error) {
    console.warn('Some fonts failed to load:', error);
  }
}

// Wait for all images to load
async function waitForImages(element: HTMLElement): Promise<void> {
  const images = Array.from(element.getElementsByTagName('img'));
  const imagePromises = images.map(img => {
    if (img.complete) return Promise.resolve();
    return new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });
  });
  await Promise.all(imagePromises);
}

// Convert SVG icons to inline images
function convertSvgIconsToImages(element: HTMLElement): void {
  const svgElements = element.querySelectorAll('svg');
  svgElements.forEach(svg => {
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = document.createElement('img');
    const computedStyle = window.getComputedStyle(svg);
    
    // Preserve the SVG styles in the image
    img.style.cssText = computedStyle.cssText;
    img.style.width = '16px';
    img.style.height = '16px';
    img.style.display = 'block';
    img.style.flexShrink = '0';
    img.style.margin = '0';
    img.style.objectFit = 'contain';
    
    // Convert SVG to base64
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
    
    // Create a container to maintain alignment
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.width = '16px';
    container.style.height = '16px';
    container.style.flexShrink = '0';
    container.appendChild(img);
    
    svg.parentNode?.replaceChild(container, svg);
  });
}

// Cache for the preloaded watermark image
let cachedWatermarkImage: HTMLImageElement | null = null;
let cachedWatermarkBase64: string | null = null;
let poppinsFontRegistered = false;

// Add Poppins font to jsPDF
function addPoppinsFont(pdf: jsPDF): void {
  if (poppinsFontRegistered) return;
  
  try {
    // Add standard fonts as fallback
    pdf.setFont('helvetica', 'bold');
    
    // Add Poppins font using standard normal font
    pdf.addFileToVFS('Poppins-normal.ttf', poppinsNormalBase64Font);
    pdf.addFont('Poppins-normal.ttf', 'Poppins', 'normal');
    
    // Add Poppins font using standard bold font
    pdf.addFileToVFS('Poppins-bold.ttf', poppinsBoldBase64Font);
    pdf.addFont('Poppins-bold.ttf', 'Poppins', 'bold');
    
    // Test if the fonts were properly registered
    try {
      // Test normal font
      pdf.setFont('Poppins', 'normal');
      console.log('Poppins normal font registered successfully');
      
      // Test bold font
      pdf.setFont('Poppins', 'bold');
      console.log('Poppins bold font registered successfully');
      
      // Reset to helvetica for safety
      pdf.setFont('helvetica', 'normal');
    } catch (testError) {
      console.warn('Font test failed:', testError);
    }
    
    poppinsFontRegistered = true;
    console.log('Poppins font registered with jsPDF');
  } catch (error) {
    console.warn('Failed to add Poppins font to jsPDF:', error);
  }
}

// Base64 encoded Poppins normal font (truncated for brevity)
const poppinsNormalBase64Font = 'AAEAAAASAQAABAAgR0RFRgBKAAgAAAHMAAAAJkdQT1MF1F4iAAAD9AAAAUpHU1VCDqILdwAAAewAAAA0T1MvMnSaAagAAAL4AAAAYGNtYXAAvADcAAACWAAAAERjdnQgK6gHnQAAAqAAAABUZnBnbXf4YKsAAAUEAAABvGdhc3AACAATAAABLAAAAAxnbHlmQQzFEQAACMAAAARgaGVhZBRp/HkAAAKIAAAANmhoZWEHKwOFAAACvAAAACRobXR4EUUBOQAAAeQAAAA2bG9jYQdaBiIAAAKUAAAAHG1heHABIABgAAABnAAAACBuYW1lL0EgkAAAA0wAAAIicG9zdP+4ADIAAAFsAAAAIHByZXB5oUJfAAAEWAAAAH8AAQAAAAFaafEJPYpfDzz1AB8D6AAAAADWN74XAAAAAN1PGxf/OPzvBIkEOgAAAAgAAgAAAAAAAHicY2BkYGC+8e8OAwML0//PDCDAyIAKggEAVbgDiQAAAAAAAwAAABIAAQAAAAAAAgAAABAAcwAAAB4ASgABAAAAAAAAAAAAAAAAAwABAAMAEQABAAAAAAACAAEAAgAWAAABAABRAAAAAAAoArwAAwABBAkAAACAAIwAAwABBAkAAQAMAHAAAwABBAkAAgAIAGgAAwABBAkAAwAMAFwAAwABBAkABAAMAHAAAwABBAkABQAWAFAAAwABBAkABgAcADQAAwABBAkADgA0AAAAaAB0AHQAcAA6AC8ALwBzAGMAcgBpAHAAdABzAC4AcwBpAGwALgBvAHIAZwAvAE8ARgBMAFAAbwBwAHAAaQBuAHMALQBSAGUAZwB1AGwAYQByAFYAZQByAHMAaQBvAG4AIAAzAC4AMAAwADAAUABvAHAAcABpAG4AcwAgAFIAZQBnAHUAbABhAHIAMwAuADAAMAAwADsASQBUAEYATwA7AFAAbwBwAHAAaQBuAHMALQBSAGUAZwB1AGwAYQByAFIAZQBnAHUAbABhAHIAUABvAHAAcABpAG4AcwBDAG8AcAB5AHIAaQBnAGgAdAAgADIAMAAxADQAIABJAG4AZABpAGEAbgAgAFQAeQBwAGUAIABGAG8AdQBuAGQAcgB5AC4AIABBAGwAbAAgAHIAaQBnAGgAdABzACAAcgBlAHMAZQByAHYAZQBkAC4A';

// Base64 encoded Poppins bold font (truncated for brevity)
const poppinsBoldBase64Font = 'AAEAAAASAQAABAAgR0RFRgBJAAgAAAHMAAAAJkdQT1MF014iAAAD9AAAAUpHU1VCDqILdwAAAewAAAA0T1MvMnSaAagAAAL4AAAAYGNtYXAAvADcAAACWAAAAERjdnQgK6gHnQAAAqAAAABUZnBnbXf4YKsAAAUEAAABvGdhc3AACAATAAABLAAAAAxnbHlmQQzFEQAACMAAAARgaGVhZBRp/HkAAAKIAAAANmhoZWEHKwOFAAACvAAAACRobXR4EUUBOQAAAeQAAAA2bG9jYQdaBiIAAAKUAAAAHG1heHABIABgAAABnAAAACBuYW1lL0EgkAAAA0wAAAIicG9zdP+4ADIAAAFsAAAAIHByZXB5oUJfAAAEWAAAAH8AAQAAAAFaafEJPYpfDzz1AB8D6AAAAADWN74XAAAAAN1PGxf/OPzvBIkEOgAAAAgAAgAAAAAAAHicY2BkYGC+8e8OAwML0//PDCDAyIAKggEAVbgDiQAAAAAAAwAAABIAAQAAAAAAAgAAABAAcwAAAB4ASgABAAAAAAAAAAAAAAAAAwABAAMAEQABAAAAAAACAAEAAgAWAAABAABRAAAAAAAoArwAAwABBAkAAACAAIwAAwABBAkAAQAMAHAAAwABBAkAAgAIAGgAAwABBAkAAwAMAFwAAwABBAkABAAMAHAAAwABBAkABQAWAFAAAwABBAkABgAcADQAAwABBAkADgA0AAAAaAB0AHQAcAA6AC8ALwBzAGMAcgBpAHAAdABzAC4AcwBpAGwALgBvAHIAZwAvAE8ARgBMAFAAbwBwAHAAaQBuAHMALQBCAG8AbABkAFYAZQByAHMAaQBvAG4AIAAzAC4AMAAwADAAUABvAHAAcABpAG4AcwAgAEIAbwBsAGQAMwAuADAAMAAwADsASQBUAEYATwA7AFAAbwBwAHAAaQBuAHMALQBCAG8AbABkAEIAbwBsAGQAUABvAHAAcABpAG4AcwBDAG8AcAB5AHIAaQBnAGgAdAAgADIAMAAxADQAIABJAG4AZABpAGEAbgAgAFQAeQBwAGUAIABGAG8AdQBuAGQAcgB5AC4AIABBAGwAbAAgAHIAaQBnAGgAdABzACAAcgBlAHMAZQByAHYAZQBkAC4A';

// Fallback base64 encoded watermark image (a simple circle)
const FALLBACK_WATERMARK_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAABZklEQVR4nO2XMU7DQBBF3xIJIVGkpEmRBuUCHIFDUFBwAa7AEWi5AhVdCpqIggKJIoUiEgUNEs6XxrJiOYljexcKRnrS2B7vzP7xem2TUkpJ/1hLdQfMgAEwBc6BDrAHNLXPFLgARsCkuEEVAVPgFjgDusAu0AZWdWwCH8AYeARGwFtZkDIBM+AeOAW2gTWgASz7MdDSsQ5wBDwAz8DHvCBlAqbADXAErAMrwFLJvHVgEzgG7oDXIpAiAVPgCjgB1nOSFwVpA/vAJfBcFKRIwANwYJJXBekBt8BbXpAQYAYcSvKqILvAuTSfhSAhwAzYyJmwbJCuNKcQJASYqOTKBOkDV3lBQoAPoF8ySJkg6yHAK7BVMkiZIMMQ4EnmKxOkX2ZRWg8BRrJg2SDbwEsI8KwFqEyQgZbmWQgwkQsOKwTZkQvGIcCXSu6kQpCBSu4rBPiWkB9VCNKXkH+EAD9y41GFIGMJ+VsI8KtF6B9/yC9qD0ql6ULwoQAAAABJRU5ErkJggg==';

// Preload the watermark image
async function preloadWatermarkImage(): Promise<void> {
  // If already cached, return immediately
  if (cachedWatermarkImage && cachedWatermarkBase64) {
    return Promise.resolve();
  }
  
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Enable CORS
    
    // Set a timeout to ensure we don't wait forever
    const timeout = setTimeout(() => {
      console.warn('Watermark image preload timed out');
      resolve();
    }, 3000);
    
    img.onload = () => {
      clearTimeout(timeout);
      cachedWatermarkImage = img;
      
      // Convert the image to base64
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          cachedWatermarkBase64 = canvas.toDataURL('image/png');
          console.log('Watermark image converted to base64');
        }
      } catch (error) {
        console.error('Failed to convert watermark image to base64:', error);
      }
      
      console.log('Watermark image preloaded successfully');
      resolve();
    };
    
    img.onerror = () => {
      clearTimeout(timeout);
      console.error('Failed to preload watermark image');
      resolve(); // Continue anyway
    };
    
    img.src = window.location.origin + '/images/watermark.png';
  });
}

// Function to crop an image to a square with object-fit: cover behavior
function cropImageToSquare(imgElement: HTMLImageElement, size: number): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // Create a high-resolution canvas element (2x the display size for better quality)
      const canvasSize = size * 2; // Double the size for higher resolution
      const canvas = document.createElement('canvas');
      canvas.width = canvasSize;
      canvas.height = canvasSize;
      const ctx = canvas.getContext('2d', { alpha: true, willReadFrequently: true });
      
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      // Enable high-quality image rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Clear the canvas with a transparent background
      ctx.clearRect(0, 0, canvasSize, canvasSize);
      
      // Calculate dimensions for cropping
      const imgWidth = imgElement.naturalWidth;
      const imgHeight = imgElement.naturalHeight;
      
      let sourceX = 0;
      let sourceY = 0;
      let sourceWidth = imgWidth;
      let sourceHeight = imgHeight;
      
      // Determine which dimension to use for cropping
      if (imgWidth > imgHeight) {
        // Landscape image: crop the sides
        sourceX = (imgWidth - imgHeight) / 2;
        sourceWidth = imgHeight;
      } else if (imgHeight > imgWidth) {
        // Portrait image: crop the top and bottom
        sourceY = (imgHeight - imgWidth) / 2;
        sourceHeight = imgWidth;
      }
      
      // Draw the cropped image on the canvas with high quality
      ctx.drawImage(
        imgElement,
        sourceX, sourceY, sourceWidth, sourceHeight, // Source rectangle
        0, 0, canvasSize, canvasSize // Destination rectangle (larger for higher resolution)
      );
      
      // Apply a subtle sharpening filter for better clarity
      try {
        const imageData = ctx.getImageData(0, 0, canvasSize, canvasSize);
        const data = imageData.data;
        const sharpenKernel = [
          0, -1, 0,
          -1, 5, -1,
          0, -1, 0
        ];
        
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvasSize;
        tempCanvas.height = canvasSize;
        const tempCtx = tempCanvas.getContext('2d');
        
        if (tempCtx) {
          tempCtx.putImageData(imageData, 0, 0);
          ctx.drawImage(tempCanvas, 0, 0);
        }
      } catch (sharpenError) {
        console.warn('Sharpening filter not applied:', sharpenError);
        // Continue without sharpening if it fails
      }
      
      // Convert canvas to data URL with PNG format for better quality
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      resolve(dataUrl);
    } catch (error) {
      console.error('Error cropping image:', error);
      reject(error);
    }
  });
}

// Add a function to detect mobile devices
function isMobileDevice(): boolean {
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
    navigator.userAgent.toLowerCase()
  );
}

// Add a function to detect iOS devices
function isIOS(): boolean {
  return /iphone|ipad|ipod/i.test(
    navigator.userAgent.toLowerCase()
  );
}

// Add a function to detect Safari
function isSafari(): boolean {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

export async function generatePDF(resumeElement: HTMLElement): Promise<void> {
  try {
    // Ensure Poppins font is loaded
    await loadPoppinsFont();
    
    // Preload the watermark image
    await preloadWatermarkImage();
    
    // Get the name from the resume element
    const nameElement = resumeElement.querySelector('.name');
    let fileName = 'resume.pdf';
    if (nameElement && nameElement.textContent) {
      const name = nameElement.textContent.trim();
      if (name) {
        // Convert name to firstName-lastName format
        fileName = name.toLowerCase()
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .replace(/[^a-z0-9-]/g, '') // Remove special characters
          + '.pdf';
      }
    }

    // Extract the primary color from the resume element
    // Look for elements with bg-primary-600 class or inline style to determine the theme color
    let primaryColor = '#4f46e5'; // Default color if we can't find it
    
    // Try multiple methods to extract the color
    
    // Method 1: Try to find an active language level circle with inline style
    const activeCircleWithStyle = resumeElement.querySelector('.level-circle[data-active="true"][style*="background"]');
    if (activeCircleWithStyle instanceof HTMLElement && activeCircleWithStyle.style.backgroundColor) {
      primaryColor = activeCircleWithStyle.style.backgroundColor;
      console.log('Extracted primary color from inline style:', primaryColor);
    } 
    // Method 2: Try to find an active language level circle with bg-primary class
    else {
      const activeCircle = resumeElement.querySelector('.level-circle.bg-primary-600');
      if (activeCircle) {
        const computedStyle = window.getComputedStyle(activeCircle);
        const bgColor = computedStyle.backgroundColor;
        if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
          primaryColor = bgColor;
          console.log('Extracted primary color from class:', primaryColor);
        }
      }
    }
    
    // Method 3: Try to find any element with the primary color
    if (primaryColor === '#4f46e5') {
      const sectionHeaders = resumeElement.querySelectorAll('[style*="color"]');
      for (const header of sectionHeaders) {
        if (header instanceof HTMLElement) {
          const style = window.getComputedStyle(header);
          if (style.color && style.color !== 'rgba(0, 0, 0, 0)' && style.color !== 'rgb(0, 0, 0)') {
            primaryColor = style.color;
            console.log('Extracted primary color from section header:', primaryColor);
            break;
          }
        }
      }
    }
    
    console.log('Final primary color for PDF:', primaryColor);

    // Clone the element to avoid modifying the original
    const clonedElement = resumeElement.cloneNode(true) as HTMLElement;
    document.body.appendChild(clonedElement);
    clonedElement.style.position = 'absolute';
    clonedElement.style.left = '-9999px';
    clonedElement.style.width = '250mm'; // Exact B4 width (changed from A4 210mm)
    
    // Remove editor-only elements
    const removeElements = (element: HTMLElement, selectors: string[]) => {
      selectors.forEach(selector => {
        element.querySelectorAll(selector).forEach(el => el.remove());
      });
    };

    // Clean up editor elements
    removeElements(clonedElement, [
      'button:not([data-level-value])', // Don't remove level circles which have data-level-value
      'input[type="text"]',
      '.skill-tag button',
      '[role="button"]:not([data-level-value])', // Don't remove level circles
    ]);

    // Ensure watermark is present in the PDF
    const existingWatermark = clonedElement.querySelector('.watermark-label');
    if (existingWatermark) {
      // Remove existing watermark as we'll add it directly to the canvas
      existingWatermark.remove();
    }

    // Remove all previous positioning adjustments
    const proficiencyCirclesContainers = clonedElement.querySelectorAll('[data-pdf-language-circles="true"], .language-level');
    proficiencyCirclesContainers.forEach(container => {
      if (container instanceof HTMLElement) {
        // Reset all positioning
        container.style.position = '';
        container.style.top = '';
        container.style.transform = '';
        container.style.marginTop = '';
        container.style.verticalAlign = '';
      }
    });

    // Reset any positioning on individual circles
    const allCircles = clonedElement.querySelectorAll('[data-pdf-circle="true"], .level-circle, [data-level-value]');
    allCircles.forEach(circle => {
      if (circle instanceof HTMLElement) {
        circle.style.position = 'relative';
        circle.style.top = '4px'; // Move circles 4px lower
        circle.style.transform = '';
        circle.style.verticalAlign = 'middle';
        circle.style.width = '14px'; // Increase circle size
        circle.style.height = '14px'; // Increase circle size
      }
    });

    // Simple approach: just move the text higher
    const languageSections = clonedElement.querySelectorAll('[class*="languages"]');
    languageSections.forEach(section => {
      // Adjust language names
      const languageNames = section.querySelectorAll('.flex.justify-between.items-center > span:first-child');
      languageNames.forEach(name => {
        if (name instanceof HTMLElement) {
          name.style.position = 'relative';
          name.style.top = '-4px';
        }
      });
      
      // Adjust proficiency text
      const proficiencyTexts = section.querySelectorAll('.text-sm.text-gray-600');
      proficiencyTexts.forEach(text => {
        if (text instanceof HTMLElement) {
          text.style.position = 'relative';
          text.style.top = '-4px';
        }
      });

      // Specifically target the language-level class
      const languageLevelContainers = section.querySelectorAll('.language-level');
      languageLevelContainers.forEach(container => {
        if (container instanceof HTMLElement) {
          container.style.display = 'flex';
          container.style.alignItems = 'center';
          container.style.gap = '3px';
          container.style.position = 'relative';
          container.style.top = '0px'; // Adjust this value as needed
        }
        
        // Style the individual circles within the language-level container
        const circles = container.querySelectorAll('.level-circle');
        circles.forEach(circle => {
          if (circle instanceof HTMLElement) {
            circle.style.width = '10px';
            circle.style.height = '10px';
            circle.style.borderRadius = '50%';
            circle.style.display = 'inline-block';
            circle.style.verticalAlign = 'middle';
            circle.style.position = 'relative';
            circle.style.top = '0px';
          }
        });
      });
    });

    // Create custom language level indicators for PDF
    let languageItems = clonedElement.querySelectorAll('[class*="languages"] .flex.justify-between.items-center');
    
    // If no items found with the first selector, try a more general one
    if (languageItems.length === 0) {
      console.log('No language items found with primary selector, trying fallback...');
      languageItems = clonedElement.querySelectorAll('[class*="languages"] > div > div');
    }
    
    // Try to find language items with the specific language-level class
    const languageLevelItems = clonedElement.querySelectorAll('.language-level');
    if (languageLevelItems.length > 0) {
      console.log(`Found ${languageLevelItems.length} language level items with .language-level class`);
      
      // Process these items first
      languageLevelItems.forEach((container, index) => {
        if (container instanceof HTMLElement) {
          // Make sure the container has the right styling
          container.style.cssText = `
            display: flex !important;
            align-items: center !important;
            gap: 3px !important;
            position: relative !important;
            top: 4px !important; /* Move circles 4px lower */
          `;
          
          // Get the level from the data attribute
          let level = 0;
          if (container.hasAttribute('data-level')) {
            const dataLevel = container.getAttribute('data-level');
            if (dataLevel) {
              level = parseInt(dataLevel, 10);
            }
          }
          
          // If level is still 0, count active circles
          if (level === 0) {
            const activeCircles = container.querySelectorAll('[data-active="true"]');
            level = activeCircles.length;
          }
          
          // Style each circle
          const circles = container.querySelectorAll('.level-circle');
          circles.forEach(circle => {
            if (circle instanceof HTMLElement) {
              // Get the value of this circle
              let value = 0;
              if (circle.hasAttribute('data-level-value')) {
                const dataValue = circle.getAttribute('data-level-value');
                if (dataValue) {
                  value = parseInt(dataValue, 10);
                }
              }
              
              // Style the circle
              circle.style.cssText = `
                width: 14px !important;
                height: 14px !important;
                border-radius: 50% !important;
                background-color: ${value <= level ? primaryColor : '#e5e7eb'} !important;
                display: inline-block !important;
                vertical-align: middle !important;
                position: relative !important;
                top: 4px !important; /* Move circles 4px lower */
              `;
            }
          });
          
          console.log(`Processed language level item ${index} with level ${level}`);
        }
      });
    }
    
    // Continue with the regular processing for other items
    languageItems.forEach((item, index) => {
      if (item instanceof HTMLElement) {
        // Skip if this item contains or is a language-level element that we've already processed
        if (item.classList.contains('language-level') || item.querySelector('.language-level')) {
          console.log(`Skipping item ${index} as it's already been processed as a language-level item`);
          return;
        }
        
        console.log(`Processing language item ${index + 1}/${languageItems.length}`);
        // Find the language name and proficiency container
        const nameElement = item.querySelector('span:first-child');
        const proficiencyContainer = item.querySelector('.flex.items-center.gap-4');
        
        if (nameElement && proficiencyContainer) {
          // Get the language name
          const languageName = nameElement.textContent || '';
          
          // Get the proficiency text
          const proficiencyTextSpan = proficiencyContainer.querySelector('.text-sm.text-gray-600');
          const proficiencyTextContent = proficiencyTextSpan ? proficiencyTextSpan.textContent || '' : '';
          
          // Create a new container for the language item with a table-like structure
          const newItem = document.createElement('table');
          newItem.className = 'language-item-pdf';
          newItem.style.cssText = `
            width: 100% !important;
            border-collapse: collapse !important;
            margin-bottom: 10px !important;
            table-layout: fixed !important;
          `;
          
          // Create a single row
          const row = document.createElement('tr');
          
          // Create language name cell
          const nameCell = document.createElement('td');
          nameCell.style.cssText = `
            font-weight: bold !important;
            text-align: left !important;
            vertical-align: middle !important;
            padding: 0 !important;
            width: 50% !important;
            position: relative !important;
            top: 0px !important;
          `;
          nameCell.textContent = languageName;
          
          // Create proficiency cell
          const proficiencyCell = document.createElement('td');
          proficiencyCell.style.cssText = `
            text-align: right !important;
            vertical-align: middle !important;
            padding: 0 !important;
            width: 50% !important;
          `;
          
          // Create proficiency text and circles container
          const proficiencyFlexContainer = document.createElement('div');
          proficiencyFlexContainer.style.cssText = `
            display: inline-flex !important;
            align-items: center !important;
            justify-content: flex-end !important;
            gap: 8px !important;
            position: relative !important;
          `;
          
          // Create proficiency text
          const proficiencyTextElement = document.createElement('span');
          proficiencyTextElement.textContent = proficiencyTextContent.replace(/\d/g, '').trim();
          proficiencyTextElement.style.cssText = `
            font-size: 14px !important;
            color: #666 !important;
            position: relative !important;
            top: 0px !important;
          `;
          
          // Create circles container
          const pdfCirclesContainer = document.createElement('div');
          pdfCirclesContainer.style.cssText = `
            display: inline-flex !important;
            align-items: center !important;
            gap: 3px !important;
            position: relative !important;
            top: 4px !important; /* Move circles 4px lower */
          `;
          
          // Determine the level (1-5) from the data attributes
          let level = 0;
          let originalDataLevel = '';
          
          // Try to get level from the circles container
          const circlesContainerElement = proficiencyContainer.querySelector('[data-pdf-language-circles="true"]');
          if (circlesContainerElement) {
            const activeCircles = circlesContainerElement.querySelectorAll('[data-pdf-active="true"]');
            if (activeCircles.length > 0) {
              level = activeCircles.length;
            } else {
              // Try to get from data-pdf-level attribute
              const levelCircle = circlesContainerElement.querySelector('[data-pdf-level]');
              if (levelCircle) {
                const dataLevel = levelCircle.getAttribute('data-pdf-level');
                if (dataLevel) {
                  level = parseInt(dataLevel, 10);
                  originalDataLevel = dataLevel;
                }
              }
            }
          }
          
          // If still not found, try to count the active circles by their background color
          if (level === 0) {
            const levelCircles = proficiencyContainer.querySelectorAll('.rounded-full');
            const activeCircles = Array.from(levelCircles).filter(circle => {
              if (circle instanceof HTMLElement) {
                const style = window.getComputedStyle(circle);
                return style.backgroundColor !== 'rgb(229, 231, 235)' && 
                       style.backgroundColor !== '#e5e7eb';
              }
              return false;
            });
            level = activeCircles.length;
          }
          
          // Default to level 3 if we couldn't detect it
          if (level <= 0 || level > 5) {
            level = 3;
          }
          
          // Create circles
          for (let i = 1; i <= 5; i++) {
            const circle = document.createElement('div');
            circle.style.cssText = `
              width: 12px !important;
              height: 12px !important;
              border-radius: 50% !important;
              background-color: ${i <= level ? primaryColor : '#e5e7eb'} !important;
              display: inline-block !important;
              vertical-align: middle !important;
              position: relative !important;
              top: 4px !important; /* Move circles 4px lower */
            `;
            circle.setAttribute('data-pdf-circle', 'true');
            circle.setAttribute('data-pdf-position', i.toString());
            circle.setAttribute('data-pdf-active', i <= level ? 'true' : 'false');
            pdfCirclesContainer.appendChild(circle);
          }
          
          // Assemble the elements
          proficiencyFlexContainer.appendChild(proficiencyTextElement);
          proficiencyFlexContainer.appendChild(pdfCirclesContainer);
          proficiencyCell.appendChild(proficiencyFlexContainer);
          
          row.appendChild(nameCell);
          row.appendChild(proficiencyCell);
          newItem.appendChild(row);
          
          // Replace the original item with the new one
          if (item.parentNode) {
            item.parentNode.replaceChild(newItem, item);
            
            // Add debug info to help troubleshoot
            console.log('Language item processed with table layout:', {
              name: languageName,
              proficiency: proficiencyTextContent,
              level: level,
              originalDataLevel: originalDataLevel
            });
          }
        }
      }
    });

    // Adjust bullet points and text in Experience section
    const experienceListItems = clonedElement.querySelectorAll('.experience li');
    experienceListItems.forEach(item => {
      if (item instanceof HTMLElement) {
        // Style for the list item container
        item.style.position = 'relative';
        item.style.listStylePosition = 'outside';
        item.style.paddingLeft = '20px';
        item.style.marginBottom = '8px';
        
        // Find and adjust the existing bullet point
        const bulletPoint = item.querySelector('.bullet-point');
        if (bulletPoint instanceof HTMLElement) {
          bulletPoint.style.cssText = `
            flex-shrink: 0;
            margin-right: 0.625rem;
            border-radius: 9999px;
            transform: translateY(10px);
            position: absolute;
            left: 5px;
          `;
        }
        
        // Create a wrapper for the content
        const content = item.innerHTML;
        const wrapper = document.createElement('div');
        wrapper.innerHTML = content;
        wrapper.style.cssText = `
          display: block;
          transform: translateY(-4px);  /* Adjust text position up/down */
        `;
        
        // Replace the content
        item.innerHTML = '';
        item.appendChild(wrapper);
      }
    });

    // Remove photo placeholder if no photo was uploaded
    const photoContainer = clonedElement.querySelector('.flex-shrink-0.w-32.h-32');
    if (photoContainer) {
      const photoImg = photoContainer.querySelector('img[src]');
      if (!photoImg || !photoImg.getAttribute('src')) {
        // No photo was uploaded, remove the entire photo container
        photoContainer.remove();
      } else {
        // Fix photo sizing and aspect ratio
        if (photoImg instanceof HTMLImageElement) {
          // Wait for the image to load if it hasn't already
          if (!photoImg.complete) {
            await new Promise((resolve) => {
              photoImg.onload = resolve;
              photoImg.onerror = resolve; // Continue even if there's an error
            });
          }
          
          try {
            // Apply proper cropping for object-fit: cover behavior
            const displaySize = 128; // 32mm equivalent (128px)
            const croppedImageUrl = await cropImageToSquare(photoImg, displaySize);
            
            // Replace the original image with the cropped version
            photoImg.src = croppedImageUrl;
            photoImg.style.width = `${displaySize}px`;
            photoImg.style.height = `${displaySize}px`;
            photoImg.style.objectFit = 'none'; // No need for object-fit now as we've manually cropped
            photoImg.style.borderRadius = '8px';
            
            // Add additional styling for better rendering in PDF
            photoImg.style.imageRendering = 'high-quality';
            photoImg.style.maxWidth = 'none'; // Prevent browser from scaling down
            photoImg.style.maxHeight = 'none';
          } catch (error) {
            console.error('Failed to crop profile photo:', error);
            // Fallback to original approach
            photoImg.style.width = '128px';
            photoImg.style.height = '128px';
            photoImg.style.objectFit = 'cover';
            photoImg.style.borderRadius = '8px';
          }
        }
      }
    }

    // Fix contact icons alignment
    const contactItems = clonedElement.querySelectorAll('.contact > div');
    contactItems.forEach((item, index) => {
      const itemElement = item as HTMLElement;
      
      // Main container
      itemElement.style.cssText = `
        position: relative !important;
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
        height: 24px !important;
        padding: 0 !important;
      `;
      
      // Icon container
      const iconContainer = itemElement.querySelector('div:first-child');
      if (iconContainer instanceof HTMLElement) {
        iconContainer.style.cssText = `
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          width: 16px !important;
          height: 16px !important;
          flex-shrink: 0 !important;
          transform: translateY(3px) !important;  // Adjust icon position
        `;
      }

      // Text content
      const textContent = Array.from(itemElement.childNodes).find(node => 
        node.nodeType === Node.TEXT_NODE || 
        (node instanceof HTMLElement && !node.querySelector('svg, img'))
      );
      
      if (textContent) {
        const textContainer = document.createElement('div');
        textContainer.style.cssText = `
          display: flex !important;
          align-items: center !important;
          height: 24px !important;
          flex: 1 !important;
        `;

        const textSpan = document.createElement('span');
        textSpan.textContent = textContent.textContent;
        textSpan.style.cssText = `
          display: inline-block !important;
          font-size: 14px !important;
          line-height: 24px !important;
          transform: translateY(-5px) !important;  // Adjust text position
        `;
        
        textContainer.appendChild(textSpan);
        
        if (textContent.parentNode) {
          textContent.parentNode.removeChild(textContent);
        }
        
        itemElement.appendChild(textContainer);
      }
    });

    // Fix skill tags styling with debug markers - Make text bold
    const skillTags = clonedElement.querySelectorAll('.skill-tag');
    skillTags.forEach((tag, index) => {
      const tagElement = tag as HTMLElement;
      const computedStyle = window.getComputedStyle(tag);
      const backgroundColor = computedStyle.backgroundColor;

      // Simplified approach: single container with text
      const container = document.createElement('div');
      container.className = 'skill-tag-debug';
      
      // Text element
      const textSpan = document.createElement('span');
      textSpan.textContent = tagElement.textContent || '';
      
      // Apply styles
      container.style.cssText = `
        position: relative !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        min-width: 60px !important;
        height: 28px !important;
        margin: 4px !important;
        padding: 0 10px !important;
        border-radius: 6px !important;
        background-color: ${backgroundColor} !important;
        box-sizing: border-box !important;
        overflow: visible !important;
      `;

      textSpan.style.cssText = `
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        height: 24px !important;
        line-height: 24px !important;
        transform: translateY(-8px) !important;
        font-size: 14px !important;
        font-weight: 700 !important; /* Changed from 500 to 700 for bolder text */
        color: white !important;
        font-family: system-ui, -apple-system, sans-serif !important;
        text-align: center !important;
        white-space: nowrap !important;
        padding: 0 6px !important;
        margin: 0 !important;
        box-sizing: border-box !important;
        position: relative !important;
        z-index: 2 !important;
        vertical-align: middle !important;
      `;

      // Assemble the structure
      container.appendChild(textSpan);
      
      // Replace the original tag
      tagElement.parentNode?.replaceChild(container, tagElement);
    });

    // Ensure proper styling
    const styles = window.getComputedStyle(resumeElement);
    clonedElement.style.fontFamily = styles.fontFamily;
    clonedElement.style.fontSize = styles.fontSize;
    clonedElement.style.color = styles.color;
    clonedElement.style.backgroundColor = 'white';
    clonedElement.style.padding = '10mm';
    clonedElement.style.boxSizing = 'border-box';

    // Adjust heading sizes based on the font size
    const baseFontSize = parseFloat(styles.fontSize);
    if (!isNaN(baseFontSize)) {
      // Adjust heading sizes proportionally
      const nameElement = clonedElement.querySelector('.name');
      if (nameElement instanceof HTMLElement) {
        nameElement.style.fontSize = `${Math.round(baseFontSize * 2.5)}px`;
      }
      
      const titleElement = clonedElement.querySelector('.title');
      if (titleElement instanceof HTMLElement) {
        titleElement.style.fontSize = `${Math.round(baseFontSize * 1.25)}px`;
      }
      
      // Adjust section headers
      const sectionHeaders = clonedElement.querySelectorAll('h2, h3');
      sectionHeaders.forEach(header => {
        if (header instanceof HTMLElement) {
          header.style.fontSize = `${Math.round(baseFontSize * 1.5)}px`;
        }
      });
    }

    // Wait for fonts and images
    await waitForFonts();
    convertSvgIconsToImages(clonedElement);
    await waitForImages(clonedElement);

    // Create PDF with B4 dimensions (changed from A4)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [250, 353], // B4 dimensions in mm (changed from 'a4')
      compress: true,
      putOnlyUsedFonts: true, // Important for text selection
      floatPrecision: 16 // Higher precision for better text positioning
    });

    // Define B4 dimensions in mm (changed from A4)
    const pdfWidth = 250; // B4 width in mm (changed from 210mm for A4)
    const pdfHeight = 353; // B4 height in mm (changed from 297mm for A4)
    
    // Define margins in mm
    const margin = 10; // 10mm margin on all sides
    const contentWidth = pdfWidth - (margin * 2);
    const contentHeight = pdfHeight - (margin * 2);
    
    // Use a higher scale factor for maximum quality
    const scale = 2.5;
    
    // Get the total height of the element
    const elementWidth = clonedElement.offsetWidth;
    const elementHeight = clonedElement.offsetHeight;
    
    console.log(`Original element dimensions: ${elementWidth}px × ${elementHeight}px`);
    
    // Ensure the background is pure white
    clonedElement.style.backgroundColor = '#ffffff';
    document.body.style.backgroundColor = '#ffffff';
    
    // Apply additional styling for better rendering
    const allElements = clonedElement.querySelectorAll('*');
    allElements.forEach(el => {
      if (el instanceof HTMLElement) {
        // Improve text rendering for all elements
        el.style.textRendering = 'geometricPrecision';
        
        // Ensure all text is crisp
        if (el.style.color) {
          // Make sure text is fully opaque
          const color = window.getComputedStyle(el).color;
          if (color.includes('rgba')) {
            el.style.color = color.replace(/rgba/, 'rgb').replace(/,[^,]+\)/, ')');
          }
        }
      }
    });
    
    // Generate a single canvas for the entire content with improved quality settings
    const fullCanvas = await html2canvas(clonedElement, {
      scale: scale,
      useCORS: true,
      logging: false,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: elementWidth,
      height: elementHeight,
      imageTimeout: 30000, // Increased timeout for higher quality rendering
      onclone: (clonedDoc, element) => {
        // Ensure white background in the cloned document
        clonedDoc.body.style.backgroundColor = '#ffffff';
        element.style.backgroundColor = '#ffffff';
        
        // Apply high-quality rendering settings
        const style = element.style as any;
        style['-webkit-font-smoothing'] = 'antialiased';
        style['-moz-osx-font-smoothing'] = 'grayscale';
        style['text-rendering'] = 'geometricPrecision';
        
        // Apply additional styling to all elements in the cloned document
        const allClonedElements = element.querySelectorAll('*');
        allClonedElements.forEach(el => {
          if (el instanceof HTMLElement) {
            el.style.textRendering = 'geometricPrecision';
          }
        });
      }
    });
    
    // Add watermark to the canvas
    await addWatermarkToCanvas(fullCanvas);
    
    console.log(`Canvas dimensions: ${fullCanvas.width}px × ${fullCanvas.height}px`);
    
    // Calculate PDF dimensions in pixels at the current scale
    const pdfWidthInPx = pdfWidth * 3.779528 * scale; // Convert mm to px (1mm ≈ 3.779528px)
    const pdfHeightInPx = pdfHeight * 3.779528 * scale;
    const contentHeightInPx = contentHeight * 3.779528 * scale;
    
    console.log(`PDF dimensions in pixels: ${pdfWidthInPx}px × ${pdfHeightInPx}px (B4 format)`);
    console.log(`Content area in pixels: ${contentWidth * 3.779528 * scale}px × ${contentHeightInPx}px`);
    
    // Calculate how many pages we need
    const pageCount = Math.ceil(fullCanvas.height / contentHeightInPx);
    console.log(`Resume content requires ${pageCount} pages (canvas height: ${fullCanvas.height}px, content height per page: ${contentHeightInPx}px)`);
    
    // If content fits on a single page, use a simpler approach
    if (pageCount === 1) {
      console.log('Content fits on a single page, using single-page approach');
      
      // Calculate aspect ratio to prevent stretching
      const canvasAspectRatio = fullCanvas.width / fullCanvas.height;
      
      let finalWidth, finalHeight;
      
      // Determine if we should fit to width or height
      if (fullCanvas.width / fullCanvas.height > contentWidth / contentHeight) {
        // Canvas is wider than PDF content area, fit to width
        finalWidth = contentWidth;
        finalHeight = contentWidth / canvasAspectRatio;
      } else {
        // Canvas is taller than PDF content area, fit to height
        finalHeight = contentHeight;
        finalWidth = contentHeight * canvasAspectRatio;
      }
      
      // IMPORTANT: Use a different approach to ensure text is selectable
      // Convert the canvas to a data URL with a lower quality to reduce file size
      const canvasDataUrl = fullCanvas.toDataURL('image/jpeg', 0.95);
      
      // Add the image as a background layer
      pdf.addImage(
        canvasDataUrl,
        'JPEG',
        margin,
        margin,
        finalWidth,
        finalHeight,
        undefined,
        'FAST' // Use fast compression algorithm
      );
      
      // Now extract text from the original HTML and add it as an invisible layer
      // This makes the text selectable while maintaining the visual appearance
      extractTextFromHTML(clonedElement, (text, x, y, fontSize, fontFamily, color) => {
        // Convert coordinates from pixels to PDF units (mm)
        const pdfX = (x / fullCanvas.width) * finalWidth + margin;
        const pdfY = (y / fullCanvas.height) * finalHeight + margin;
        
        // Set text properties
        pdf.setFont(fontFamily || 'helvetica');
        pdf.setFontSize(fontSize || 12);
        pdf.setTextColor(color || '#000000');
        
        // Add invisible text (white text on white background)
        pdf.setTextColor(0, 0, 0);
        pdf.text(text, pdfX, pdfY, {
          baseline: 'top',
          renderingMode: 'invisible'
        });
      });
      
    } else {
      // For multi-page content, we need to split the canvas into pages
      console.log(`Content requires multiple pages (${pageCount} pages)`);
      
      // Find optimal page breaks based on section boundaries
      const sectionBoundaries = findSectionBoundaries(clonedElement, scale, contentHeightInPx);
      
      // Calculate the actual number of pages needed based on content and section boundaries
      const actualPageCount = sectionBoundaries.length;
      
      console.log(`Optimized to ${actualPageCount} pages based on section boundaries`);
      
      // Process each page
      for (let i = 0; i < actualPageCount; i++) {
        // If not the first page, add a new page
        if (i > 0) {
          pdf.addPage();
        }
        
        // Get the start and end Y positions for this page
        const startY = i === 0 ? 0 : sectionBoundaries[i - 1].endY;
        const endY = sectionBoundaries[i].endY;
        const srcHeight = endY - startY;
        
        console.log(`Page ${i + 1}: startY=${startY}px, endY=${endY}px, height=${srcHeight}px`);
        
        // Skip if the height is too small (likely empty page)
        if (srcHeight < 100) {
          console.log(`Skipping page ${i + 1} as it's too small (height: ${srcHeight}px)`);
          continue;
        }
        
        // Create a canvas for this page
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = fullCanvas.width;
        pageCanvas.height = srcHeight;
        
        const pageCtx = pageCanvas.getContext('2d');
        if (!pageCtx) {
          console.error('Failed to get 2D context for page canvas');
          continue;
        }
        
        // Draw the section of the full canvas onto this page canvas
        pageCtx.drawImage(
          fullCanvas, 
          0, startY, // Source x, y
          fullCanvas.width, srcHeight, // Source width, height
          0, 0, // Destination x, y
          fullCanvas.width, srcHeight // Destination width, height
        );
        
        // Add watermark to each page
        await addWatermarkToCanvas(pageCanvas);
        
        // Calculate dimensions for the PDF
        const pageAspectRatio = pageCanvas.width / pageCanvas.height;
        const finalWidth = contentWidth;
        const finalHeight = finalWidth / pageAspectRatio;
        
        // IMPORTANT: Use a different approach to ensure text is selectable
        // Convert the canvas to a data URL with a lower quality to reduce file size
        const canvasDataUrl = pageCanvas.toDataURL('image/jpeg', 0.95);
        
        // Add the image as a background layer
        pdf.addImage(
          canvasDataUrl,
          'JPEG',
          margin, margin,
          finalWidth, finalHeight,
          undefined,
          'FAST'
        );
        
        // Now extract text from the original HTML for this page and add it as an invisible layer
        extractTextFromHTMLForPage(clonedElement, startY, endY, (text, x, y, fontSize, fontFamily, color) => {
          // Convert coordinates from pixels to PDF units (mm)
          const pdfX = (x / pageCanvas.width) * finalWidth + margin;
          const pdfY = ((y - startY) / srcHeight) * finalHeight + margin;
          
          // Set text properties
          pdf.setFont(fontFamily || 'helvetica');
          pdf.setFontSize(fontSize || 12);
          
          // Add invisible text (black text with rendering mode 'invisible')
          pdf.setTextColor(0, 0, 0);
          pdf.text(text, pdfX, pdfY, {
            baseline: 'top',
            renderingMode: 'invisible'
          });
        });
        
        console.log(`Added page ${i + 1}: startY=${startY}px, endY=${endY}px, height=${srcHeight}px, PDF dimensions: ${finalWidth}mm × ${finalHeight}mm`);
      }
    }
    
    // Add watermark directly to the PDF
    addWatermarkToPDF(pdf);
    
    // Check if it's a mobile device
    if (isMobileDevice()) {
      console.log('Using mobile PDF handling');
      
      try {
        // For iOS devices, use a data URI approach which works better
        if (isIOS()) {
          console.log('Using iOS-specific PDF handling');
          
          // Get PDF as data URI
          const pdfData = pdf.output('datauristring');
          
          // Create a link and click it
          const link = document.createElement('a');
          link.href = pdfData;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          
          // iOS requires the link to be in the DOM and visible
          link.style.position = 'fixed';
          link.style.top = '0';
          link.style.left = '0';
          link.style.opacity = '0';
          document.body.appendChild(link);
          
          // Simulate a click
          const event = document.createEvent('MouseEvents');
          event.initEvent('click', true, true);
          link.dispatchEvent(event);
          
          // Clean up after a delay
          setTimeout(() => {
            document.body.removeChild(link);
          }, 1000);
          
          console.log('PDF opened using data URI approach for iOS');
        } 
        // For Android and other mobile devices
        else {
          console.log('Using standard mobile PDF handling');
          
          // Use the blob approach but with a longer timeout
          const pdfBlob = new Blob([pdf.output('arraybuffer')], { type: 'application/pdf' });
          const blobUrl = URL.createObjectURL(pdfBlob);
          
          // Create a link and click it instead of using window.open
          const link = document.createElement('a');
          link.href = blobUrl;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.click();
          
          // Clean up the blob URL after a longer delay
          setTimeout(() => {
            URL.revokeObjectURL(blobUrl);
          }, 60000); // 60 seconds to ensure it's loaded
          
          console.log('PDF opened using blob URL approach for Android');
        }
      } catch (mobileError) {
        console.error('Mobile PDF handling error:', mobileError);
        
        // Fallback to the simplest approach
        try {
          // Get PDF as data URI and just change location
          const pdfData = pdf.output('datauristring');
          window.location.href = pdfData;
          console.log('PDF opened using location change fallback');
        } catch (fallbackError) {
          console.error('Mobile fallback error:', fallbackError);
        }
      }
    } else {
      // For desktop browsers, save the PDF as a download
      pdf.save(fileName);
    }
    
    // Clean up the cloned element
    document.body.removeChild(clonedElement);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

// Helper function to extract text from HTML elements
function extractTextFromHTML(element: HTMLElement, callback: (text: string, x: number, y: number, fontSize: number, fontFamily: string, color: string) => void): void {
  // Get all text nodes
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: function(node) {
        // Skip empty text nodes or nodes with only whitespace
        if (!node.textContent || !node.textContent.trim()) {
          return NodeFilter.FILTER_REJECT;
        }
        
        // Skip nodes that are children of script or style elements
        const parent = node.parentElement;
        if (parent && (parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE')) {
          return NodeFilter.FILTER_REJECT;
        }
        
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );
  
  // Process each text node
  let node;
  while (node = walker.nextNode()) {
    const textNode = node as Text;
    const parentElement = textNode.parentElement;
    
    if (parentElement) {
      // Get the text content
      const text = textNode.textContent?.trim() || '';
      if (!text) continue;
      
      // Get the position of the text
      const range = document.createRange();
      range.selectNodeContents(textNode);
      const rect = range.getBoundingClientRect();
      
      // Get the computed style of the parent element
      const style = window.getComputedStyle(parentElement);
      const fontSize = parseFloat(style.fontSize);
      const fontFamily = style.fontFamily;
      const color = style.color;
      
      // Calculate the position relative to the element
      const elementRect = element.getBoundingClientRect();
      const x = rect.left - elementRect.left;
      const y = rect.top - elementRect.top;
      
      // Call the callback with the text and its properties
      callback(text, x, y, fontSize, fontFamily, color);
    }
  }
}

// Helper function to extract text from HTML elements for a specific page
function extractTextFromHTMLForPage(
  element: HTMLElement, 
  startY: number, 
  endY: number, 
  callback: (text: string, x: number, y: number, fontSize: number, fontFamily: string, color: string) => void
): void {
  // Get all text nodes
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: function(node) {
        // Skip empty text nodes or nodes with only whitespace
        if (!node.textContent || !node.textContent.trim()) {
          return NodeFilter.FILTER_REJECT;
        }
        
        // Skip nodes that are children of script or style elements
        const parent = node.parentElement;
        if (parent && (parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE')) {
          return NodeFilter.FILTER_REJECT;
        }
        
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );
  
  // Process each text node
  let node;
  while (node = walker.nextNode()) {
    const textNode = node as Text;
    const parentElement = textNode.parentElement;
    
    if (parentElement) {
      // Get the text content
      const text = textNode.textContent?.trim() || '';
      if (!text) continue;
      
      // Get the position of the text
      const range = document.createRange();
      range.selectNodeContents(textNode);
      const rect = range.getBoundingClientRect();
      
      // Get the computed style of the parent element
      const style = window.getComputedStyle(parentElement);
      const fontSize = parseFloat(style.fontSize);
      const fontFamily = style.fontFamily;
      const color = style.color;
      
      // Calculate the position relative to the element
      const elementRect = element.getBoundingClientRect();
      const x = rect.left - elementRect.left;
      const y = rect.top - elementRect.top;
      
      // Only include text that is on this page
      if (y >= startY && y < endY) {
        // Call the callback with the text and its properties
        callback(text, x, y, fontSize, fontFamily, color);
      }
    }
  }
}

// Function to find smart page break positions that avoid cutting text
function findSectionBoundaries(element: HTMLElement, scale: number, pageHeightInPx: number): Array<{endY: number, element?: HTMLElement}> {
  // Get all section elements and their positions
  const sections = element.querySelectorAll('section, h1, h2, h3, h4, h5, h6, .section, [class*="section"], [class*="languages"], [class*="experience"], [class*="education"], [class*="skills"], [class*="projects"]');
  
  // Create an array to store all potential break points
  const breakPoints: Array<{y: number, element: HTMLElement, priority: number, type: string}> = [];
  
  // Add the end of the document as the final break point
  breakPoints.push({
    y: element.offsetHeight * scale,
    element: element,
    priority: 0, // Highest priority
    type: 'document-end'
  });
  
  // Map to store section headings and their content elements
  const sectionMap: Map<HTMLElement, {
    heading: HTMLElement,
    content: HTMLElement[],
    headingTop: number,
    headingBottom: number,
    contentTop: number,
    contentBottom: number
  }> = new Map();
  
  // First pass: identify section headings
  const sectionHeadings = element.querySelectorAll('h1, h2, h3, h4, h5, h6, [class*="section-title"], [class*="sectionTitle"]');
  sectionHeadings.forEach(heading => {
    if (heading instanceof HTMLElement) {
      const rect = heading.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      
      // Calculate the position relative to the cloned element
      const headingTop = (rect.top - elementRect.top) * scale;
      const headingBottom = (rect.bottom - elementRect.top) * scale;
      
      // Initialize the section entry
      sectionMap.set(heading, {
        heading,
        content: [],
        headingTop,
        headingBottom,
        contentTop: Infinity,
        contentBottom: -Infinity
      });
    }
  });
  
  // Second pass: associate content with section headings
  const contentElements = element.querySelectorAll('p, li, div, table, ul, ol, .skill-tag-debug, .language-item-pdf');
  contentElements.forEach(content => {
    if (content instanceof HTMLElement) {
      const rect = content.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      
      // Calculate the position relative to the cloned element
      const contentTop = (rect.top - elementRect.top) * scale;
      const contentBottom = (rect.bottom - elementRect.top) * scale;
      
      // Find the closest section heading that precedes this content
      let closestHeading: HTMLElement | null = null;
      let closestDistance = Infinity;
      
      sectionMap.forEach((section, heading) => {
        // Only consider headings that come before this content
        if (section.headingTop < contentTop) {
          const distance = contentTop - section.headingTop;
          if (distance < closestDistance) {
            closestDistance = distance;
            closestHeading = heading;
          }
        }
      });
      
      // Associate this content with the closest heading
      if (closestHeading && sectionMap.has(closestHeading)) {
        const section = sectionMap.get(closestHeading)!;
        section.content.push(content);
        section.contentTop = Math.min(section.contentTop, contentTop);
        section.contentBottom = Math.max(section.contentBottom, contentBottom);
      }
    }
  });
  
  // Find skill tag containers to treat them as cohesive units
  const skillContainers = element.querySelectorAll('.skills, [class*="skills-container"], [class*="skill-container"], [class*="skills"], div:has(.skill-tag), div:has(.skill-tag-debug)');
  skillContainers.forEach(container => {
    if (container instanceof HTMLElement) {
      const rect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      
      // Calculate the position relative to the cloned element
      const containerTop = (rect.top - elementRect.top) * scale;
      const containerBottom = (rect.bottom - elementRect.top) * scale;
      
      // Add the top of the skill container as a high-priority break point
      breakPoints.push({
        y: containerTop,
        element: container,
        priority: 0, // Highest priority (changed from 1)
        type: 'skill-container-top'
      });
      
      // Add the bottom of the skill container as a high-priority break point
      breakPoints.push({
        y: containerBottom,
        element: container,
        priority: 0, // Highest priority (changed from 1)
        type: 'skill-container-bottom'
      });
      
      // Find all skill tags within this container
      const skillTags = container.querySelectorAll('.skill-tag-debug, .skill-tag');
      
      // If there are multiple skill tags, treat them as a group
      if (skillTags.length > 0) {
        console.log(`Found ${skillTags.length} skill tags in container`);
        
        // Find the first and last skill tag
        const firstTag = skillTags[0];
        const lastTag = skillTags[skillTags.length - 1];
        
        if (firstTag instanceof HTMLElement && lastTag instanceof HTMLElement) {
          const firstRect = firstTag.getBoundingClientRect();
          const lastRect = lastTag.getBoundingClientRect();
          
          const groupTop = (firstRect.top - elementRect.top) * scale;
          const groupBottom = (lastRect.bottom - elementRect.top) * scale;
          
          // Add the skill tag group as a cohesive unit with very high priority
          breakPoints.push({
            y: groupTop,
            element: firstTag,
            priority: 0, // Highest priority (changed from 1)
            type: 'skill-group-top'
          });
          
          breakPoints.push({
            y: groupBottom,
            element: lastTag,
            priority: 0, // Highest priority (changed from 1)
            type: 'skill-group-bottom'
          });
          
          console.log(`Added skill group break points: top=${groupTop}, bottom=${groupBottom}`);
        }
      }
    }
  });
  
  // Add break points based on section structure
  sectionMap.forEach((section) => {
    // Never break between a heading and its first content element
    // Add the heading top as a potential break point (high priority)
    breakPoints.push({
      y: section.headingTop,
      element: section.heading,
      priority: 1,
      type: 'heading-top'
    });
    
    // If there's content, add break points for content boundaries
    if (section.content.length > 0) {
      // Add break points for content elements, but not between heading and first content
      section.content.forEach((contentElement, index) => {
        const rect = contentElement.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        
        const contentTop = (rect.top - elementRect.top) * scale;
        const contentBottom = (rect.bottom - elementRect.top) * scale;
        
        // Don't add a break point between heading and first content
        // or if the content is too close to the heading
        // For B4, we can increase this threshold since we have more space
        const isTooCloseToHeading = contentTop - section.headingBottom < 25; // Increased from 20 for B4
        
        if (index > 0 || !isTooCloseToHeading) {
          breakPoints.push({
            y: contentTop,
            element: contentElement,
            priority: 3,
            type: 'content-top'
          });
        }
        
        breakPoints.push({
          y: contentBottom,
          element: contentElement,
          priority: 2,
          type: 'content-bottom'
        });
      });
    }
  });
  
  // Process each section to find additional potential break points
  sections.forEach(section => {
    if (section instanceof HTMLElement) {
      const rect = section.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      
      // Calculate the position relative to the cloned element
      const relativeTop = (rect.top - elementRect.top) * scale;
      const relativeBottom = (rect.bottom - elementRect.top) * scale;
      
      // Add the section bottom as a potential break point (medium priority)
      breakPoints.push({
        y: relativeBottom,
        element: section,
        priority: 2,
        type: 'section-bottom'
      });
    }
  });
  
  // Find all paragraphs, list items, and other text containers not already processed
  const textContainers = element.querySelectorAll('p, li, div > span, td');
  
  // Process each text container to find potential break points
  textContainers.forEach(container => {
    if (container instanceof HTMLElement) {
      // Skip if this element is already a child of a processed section
      let isPartOfSection = false;
      sectionMap.forEach(section => {
        if (section.content.includes(container)) {
          isPartOfSection = true;
        }
      });
      
      if (!isPartOfSection) {
        const rect = container.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        
        // Calculate the position relative to the cloned element
        const relativeBottom = (rect.bottom - elementRect.top) * scale;
        
        // Add the bottom of the text container as a potential break point (low priority)
        breakPoints.push({
          y: relativeBottom,
          element: container,
          priority: 3,
          type: 'text-bottom'
        });
      }
    }
  });
  
  // Sort break points by position
  breakPoints.sort((a, b) => a.y - b.y);
  
  // Filter out break points that are too close to each other
  // For B4, we can increase this threshold since we have more space
  const filteredBreakPoints = breakPoints.filter((point, index, array) => {
    if (index === 0) return true;
    return Math.abs(point.y - array[index - 1].y) > 15; // Increased from 10 for B4
  });
  
  console.log(`Found ${filteredBreakPoints.length} potential break points`);
  
  // Calculate optimal page breaks
  const boundaries: Array<{endY: number, element?: HTMLElement}> = [];
  let currentPage = 1;
  let currentPageEndY = pageHeightInPx; // First page ends at pageHeightInPx
  
  while (currentPageEndY < element.offsetHeight * scale) {
    // Find the best break point for the current page
    let bestBreakPoint: typeof filteredBreakPoints[0] | undefined;
    let bestBreakY = currentPageEndY;
    
    // First, check if we're about to break within a skill tag group
    const isBreakingSkillGroup = isBreakingSkillTagGroup(filteredBreakPoints, currentPageEndY);
    
    if (isBreakingSkillGroup) {
      // We're breaking within a skill tag group, find a better break point
      const betterBreakPoint = findBetterBreakPointForSkills(filteredBreakPoints, currentPageEndY, pageHeightInPx);
      
      if (betterBreakPoint) {
        bestBreakY = betterBreakPoint.y;
        bestBreakPoint = betterBreakPoint;
        console.log(`Avoiding breaking skill tags by moving break to y=${bestBreakY}, type=${betterBreakPoint.type}`);
      }
    } else {
      // Check if we're about to break between a heading and its content
      const headingBeforeBreak = findHeadingBeforeBreak(filteredBreakPoints, currentPageEndY, sectionMap);
      
      if (headingBeforeBreak) {
        // We found a heading that would be separated from its content
        // Move the break point to before the heading
        const section = sectionMap.get(headingBeforeBreak);
        if (section) {
          const breakPointBeforeHeading = filteredBreakPoints.find(point => 
            point.y < section.headingTop && 
            currentPageEndY - point.y < pageHeightInPx * 0.25 // Increased from 0.2 for B4
          );
          
          if (breakPointBeforeHeading) {
            bestBreakY = breakPointBeforeHeading.y;
            bestBreakPoint = breakPointBeforeHeading;
            console.log(`Avoiding orphaned heading by moving break to y=${bestBreakY}`);
          }
        }
      } else {
        // Normal break point selection logic
        // Look for break points before the current page end
        const breakPointsBefore = filteredBreakPoints
          .filter(point => point.y <= currentPageEndY)
          .sort((a, b) => {
            // Sort by distance to page end and then by priority
            const distA = currentPageEndY - a.y;
            const distB = currentPageEndY - b.y;
            
            // If they're within a certain distance of each other, prefer the higher priority one
            // For B4, we can increase this threshold since we have more space
            if (Math.abs(distA - distB) < 120) { // Increased from 100 for B4
              return a.priority - b.priority;
            }
            
            // Otherwise, prefer the one closer to the page end
            return distA - distB;
          });
        
        // If we found suitable break points before the page end, use the best one
        if (breakPointsBefore.length > 0) {
          const candidate = breakPointsBefore[0];
          
          // Only use this break point if it's not too far from the page end
          // For B4, we can increase this threshold since we have more space
          if (currentPageEndY - candidate.y < pageHeightInPx * 0.25) { // Increased from 0.2 for B4
            bestBreakY = candidate.y;
            bestBreakPoint = candidate;
          }
        }
        
        // If we couldn't find a good break point before, look for one after
        if (bestBreakY === currentPageEndY) {
          const breakPointAfter = filteredBreakPoints.find(point => point.y > currentPageEndY);
          // For B4, we can increase this threshold since we have more space
          if (breakPointAfter && breakPointAfter.y - currentPageEndY < pageHeightInPx * 0.25) { // Increased from 0.2 for B4
            bestBreakY = breakPointAfter.y;
            bestBreakPoint = breakPointAfter;
          }
        }
      }
    }
    
    // Add the boundary
    boundaries.push({
      endY: bestBreakY,
      element: bestBreakPoint?.element
    });
    
    console.log(`Page ${currentPage} ends at y=${bestBreakY}px, element:`, bestBreakPoint?.element?.tagName, 'type:', bestBreakPoint?.type);
    
    // Move to the next page
    currentPage++;
    currentPageEndY = bestBreakY + pageHeightInPx;
  }
  
  // Add the final boundary if needed
  if (boundaries.length === 0 || boundaries[boundaries.length - 1].endY < element.offsetHeight * scale) {
    boundaries.push({
      endY: element.offsetHeight * scale
    });
  }
  
  return boundaries;
}

// Helper function to check if a break would split a skill tag group
function isBreakingSkillTagGroup(
  breakPoints: Array<{y: number, element: HTMLElement, priority: number, type: string}>,
  breakY: number
): boolean {
  // Find skill group boundaries
  const skillGroupTops = breakPoints.filter(point => point.type === 'skill-group-top' || point.type === 'skill-container-top');
  const skillGroupBottoms = breakPoints.filter(point => point.type === 'skill-group-bottom' || point.type === 'skill-container-bottom');
  
  // Check if the break point is within any skill group
  for (let i = 0; i < skillGroupTops.length; i++) {
    const top = skillGroupTops[i].y;
    // Find the corresponding bottom for this top
    const bottom = skillGroupBottoms.find(point => point.y > top)?.y || Infinity;
    
    // If the break is within this group, return true
    if (breakY > top && breakY < bottom) {
      console.log(`Break at y=${breakY} would split skill group (${top}-${bottom})`);
      return true;
    }
    
    // Also check if the break is too close to the top of a skill group
    // This prevents a break right before skills that would leave them orphaned at the top of the next page
    if (Math.abs(breakY - top) < 50 && breakY < top) {
      console.log(`Break at y=${breakY} is too close to the top of skill group at ${top}`);
      return true;
    }
  }
  
  return false;
}

// Helper function to find a better break point when skills would be split
function findBetterBreakPointForSkills(
  breakPoints: Array<{y: number, element: HTMLElement, priority: number, type: string}>,
  breakY: number,
  pageHeightInPx: number
): typeof breakPoints[0] | undefined {
  // Find skill group boundaries
  const skillGroupTops = breakPoints.filter(point => point.type === 'skill-group-top' || point.type === 'skill-container-top');
  const skillGroupBottoms = breakPoints.filter(point => point.type === 'skill-group-bottom' || point.type === 'skill-container-bottom');
  
  // Find the skill group that would be split or is too close to the break
  let splitGroupTop: number | undefined;
  let splitGroupBottom: number | undefined;
  let isTooCloseToTop = false;
  
  for (let i = 0; i < skillGroupTops.length; i++) {
    const top = skillGroupTops[i].y;
    // Find the corresponding bottom for this top
    const bottom = skillGroupBottoms.find(point => point.y > top)?.y || Infinity;
    
    // If the break is within this group, we found our split group
    if (breakY > top && breakY < bottom) {
      splitGroupTop = top;
      splitGroupBottom = bottom;
      break;
    }
    
    // Check if break is too close to the top of a skill group
    // For B4, we can increase this threshold slightly since we have more space
    if (Math.abs(breakY - top) < 60 && breakY < top) {
      splitGroupTop = top;
      splitGroupBottom = bottom;
      isTooCloseToTop = true;
      break;
    }
  }
  
  if (splitGroupTop === undefined || splitGroupBottom === undefined) {
    return undefined;
  }
  
  // If we're too close to the top of a skill group, find a break point before the group
  if (isTooCloseToTop) {
    console.log(`Break is too close to the top of skill group, finding break point before group`);
    
    // Find a suitable break point before the skill group
    // For B4, we can allow a slightly larger distance since we have more space
    const breakPointBeforeGroup = breakPoints
      .filter(point => point.y < splitGroupTop! && point.type !== 'skill-group-top' && point.type !== 'skill-container-top')
      .sort((a, b) => b.y - a.y) // Sort in descending order to get the closest one
      .find(point => splitGroupTop! - point.y < pageHeightInPx * 0.35); // Increased from 0.3 to 0.35 for B4
    
    if (breakPointBeforeGroup) {
      console.log(`Found break point before skill group at y=${breakPointBeforeGroup.y}`);
      return breakPointBeforeGroup;
    }
  }
  
  // Determine if we should break before or after the skill group
  const distanceToTop = breakY - splitGroupTop;
  const distanceToBottom = splitGroupBottom - breakY;
  const groupHeight = splitGroupBottom - splitGroupTop;
  
  console.log(`Skill group: top=${splitGroupTop}, bottom=${splitGroupBottom}, height=${groupHeight}`);
  console.log(`Distance to top: ${distanceToTop}, distance to bottom: ${distanceToBottom}`);
  
  // If the skill group is too large to fit on a single page, we need to make a decision
  // For B4, we can increase this threshold since we have more space
  if (groupHeight > pageHeightInPx * 0.85) { // Increased from 0.8 to 0.85 for B4
    console.log(`Skill group is too large (${groupHeight}px) to fit on a single page`);
    
    // In this case, try to find a natural break point within the skill group
    // This could be between rows of skill tags
    const breakPointsWithinGroup = breakPoints.filter(point => 
      point.y > splitGroupTop! && 
      point.y < splitGroupBottom! && 
      point.type !== 'skill-group-top' && 
      point.type !== 'skill-group-bottom' &&
      point.type !== 'skill-container-top' &&
      point.type !== 'skill-container-bottom'
    );
    
    if (breakPointsWithinGroup.length > 0) {
      // Find the break point closest to our current break
      breakPointsWithinGroup.sort((a, b) => Math.abs(a.y - breakY) - Math.abs(b.y - breakY));
      console.log(`Found natural break within large skill group at y=${breakPointsWithinGroup[0].y}`);
      return breakPointsWithinGroup[0];
    }
    
    // If we can't find a natural break, default to the original break
    return undefined;
  }
  
  // For smaller skill groups that can fit on a single page, make a smarter decision
  
  // If we're closer to the top and the group is small enough to fit on the current page
  // For B4, we can increase this threshold since we have more space
  if (distanceToTop < distanceToBottom && groupHeight < pageHeightInPx * 0.75) { // Increased from 0.7 to 0.75 for B4
    // Try to find a break point before the skill group
    const breakPointBeforeGroup = breakPoints
      .filter(point => 
        point.y < splitGroupTop! && 
        point.type !== 'skill-group-top' && 
        point.type !== 'skill-container-top'
      )
      .sort((a, b) => b.y - a.y) // Sort in descending order to get the closest one
      .find(point => splitGroupTop! - point.y < pageHeightInPx * 0.35); // Increased from 0.3 to 0.35 for B4
    
    if (breakPointBeforeGroup) {
      console.log(`Moving break to before skill group at y=${breakPointBeforeGroup.y}`);
      return breakPointBeforeGroup;
    }
  } 
  // If we're closer to the bottom or the group won't fit on the current page
  else {
    // Try to find a break point after the skill group
    const breakPointAfterGroup = breakPoints
      .filter(point => 
        point.y > splitGroupBottom! && 
        point.type !== 'skill-group-bottom' && 
        point.type !== 'skill-container-bottom'
      )
      .sort((a, b) => a.y - b.y) // Sort in ascending order to get the closest one
      .find(point => point.y - splitGroupBottom! < pageHeightInPx * 0.35); // Increased from 0.3 to 0.35 for B4
    
    if (breakPointAfterGroup) {
      console.log(`Moving break to after skill group at y=${breakPointAfterGroup.y}`);
      return breakPointAfterGroup;
    }
  }
  
  // If we can't find a good break point before or after, use the skill group boundaries
  if (distanceToTop < distanceToBottom) {
    // Find the closest break point before the skill group
    const closestBeforeGroup = breakPoints
      .filter(point => point.y < splitGroupTop!)
      .sort((a, b) => b.y - a.y)[0]; // Get the closest one before
    
    if (closestBeforeGroup) {
      console.log(`Using closest break point before skill group at y=${closestBeforeGroup.y}`);
      return closestBeforeGroup;
    }
    
    // If no break point found before, use the skill group top
    const groupTopPoint = skillGroupTops.find(point => point.y === splitGroupTop);
    if (groupTopPoint) {
      console.log(`Using skill group top as break point at y=${groupTopPoint.y}`);
      return groupTopPoint;
    }
  } else {
    // Find the closest break point after the skill group
    const closestAfterGroup = breakPoints
      .filter(point => point.y > splitGroupBottom!)
      .sort((a, b) => a.y - b.y)[0]; // Get the closest one after
    
    if (closestAfterGroup) {
      console.log(`Using closest break point after skill group at y=${closestAfterGroup.y}`);
      return closestAfterGroup;
    }
    
    // If no break point found after, use the skill group bottom
    const groupBottomPoint = skillGroupBottoms.find(point => point.y === splitGroupBottom);
    if (groupBottomPoint) {
      console.log(`Using skill group bottom as break point at y=${groupBottomPoint.y}`);
      return groupBottomPoint;
    }
  }
  
  // If all else fails, return undefined to use the original break
  return undefined;
}

// Helper function to find if there's a heading that would be separated from its content
function findHeadingBeforeBreak(
  breakPoints: Array<{y: number, element: HTMLElement, priority: number, type: string}>,
  breakY: number,
  sectionMap: Map<HTMLElement, {
    heading: HTMLElement,
    content: HTMLElement[],
    headingTop: number,
    headingBottom: number,
    contentTop: number,
    contentBottom: number
  }>
): HTMLElement | null {
  // Check each section heading
  for (const [heading, section] of sectionMap.entries()) {
    // If the heading is before the break but its content starts after the break
    if (section.headingTop < breakY && 
        section.headingBottom < breakY && 
        section.contentTop > breakY) {
      // This heading would be orphaned from its content
      return heading;
    }
    
    // If the heading is before the break but very close to it
    // For B4, we can increase this threshold since we have more space
    if (section.headingTop < breakY && 
        breakY - section.headingBottom < 60 && // Increased from 50 to 60 for B4
        section.contentBottom - breakY > (section.contentBottom - section.contentTop) * 0.7) {
      // This heading has too little content on this page
      return heading;
    }
  }
  
  return null;
}

// Helper function to add watermark to the PDF
function addWatermarkToCanvas(canvas: HTMLCanvasElement): Promise<void> {
  return new Promise((resolve) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      resolve();
      return;
    }
    
    // Position at bottom right with 5mm margin (convert mm to px)
    const scale = 2.5; // Match the scale used in the PDF generation
    const bottomMargin = 5 * 3.779528 * scale; // Convert mm to px (1mm ≈ 3.779528px)
    const rightMargin = 5 * 3.779528 * scale;
    
    // Watermark dimensions
    const width = 160 * scale; // Increased width to accommodate larger font
    const height = 24 * scale; // Increased height to accommodate larger font
    const x = canvas.width - width - rightMargin;
    const y = canvas.height - height - bottomMargin;
    const radius = 4 * scale;
    
    // Draw the watermark background immediately
    ctx.save();
    ctx.fillStyle = 'white';
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1 * scale;
    
    // Use a more compatible approach for rounded rectangle
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    
    ctx.fill();
    ctx.stroke();
    
    // Draw the text with semi-bold font
    ctx.fillStyle = '#6b7280';
    ctx.font = `600 ${12 * scale}px Arial`; // Added 600 for semi-bold
    ctx.fillText('Built with', x + 8 * scale, y + height/2 + 4 * scale);
    
    // Use the cached image if available, otherwise load it
    if (cachedWatermarkImage) {
      // Draw the image in the middle
      const imgSize = 18 * scale; // Increased image size
      try {
        ctx.drawImage(
          cachedWatermarkImage, 
          x + 55 * scale, // Adjusted position
          y + (height - imgSize) / 2, 
          imgSize, 
          imgSize
        );
        
        // Draw the second part of text
        ctx.fillText('ResumeCool', x + 75 * scale, y + height/2 + 4 * scale); // Adjusted position
        
        ctx.restore();
        resolve();
      } catch (error) {
        console.error('Error drawing cached watermark image:', error);
        // Fallback to just text
        ctx.fillText('ResumeCool', x + 55 * scale, y + height/2 + 4 * scale);
        ctx.restore();
        resolve();
      }
    } else {
      // Create an image for the watermark
      const img = new Image();
      img.crossOrigin = 'anonymous'; // Enable CORS
      
      // Set a timeout to ensure we don't wait forever
      const timeout = setTimeout(() => {
        console.warn('Watermark image load timed out, continuing without image');
        ctx.fillText('ResumeCool', x + 55 * scale, y + height/2 + 4 * scale);
        ctx.restore();
        resolve();
      }, 2000);
      
      img.onload = () => {
        clearTimeout(timeout);
        
        // Cache the image for future use
        cachedWatermarkImage = img;
        
        // Draw the image in the middle
        const imgSize = 24 * scale; // Increased image size
        ctx.drawImage(
          img, 
          x + 55 * scale, // Adjusted position
          y + (height - imgSize) / 2, 
          imgSize, 
          imgSize
        );
        
        // Draw the second part of text
        ctx.fillText('ResumeCool', x + 75 * scale, y + height/2 + 4 * scale); // Adjusted position
        
        ctx.restore();
        resolve();
      };
      
      // Handle image loading errors
      img.onerror = () => {
        clearTimeout(timeout);
        console.error('Failed to load watermark image');
        // Just draw the text without the image
        ctx.fillText('ResumeCool', x + 55 * scale, y + height/2 + 4 * scale);
        ctx.restore();
        resolve();
      };
      
      img.src = window.location.origin + '/images/watermark.png';
    }
  });
}

// Add watermark directly to the PDF
function addWatermarkToPDF(pdf: jsPDF): void {
  try {
    // Add Poppins font to jsPDF
    addPoppinsFont(pdf);
    
    // Get page dimensions
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Watermark dimensions and position
    const margin = 5; // 5mm margin from edges
    const watermarkWidth = 55; // Width in mm - reduced to decrease right margin
    const watermarkHeight = 8.5; // Height in mm - reduced slightly
    const x = pageWidth - watermarkWidth - margin;
    const y = pageHeight - watermarkHeight - margin;
    const cornerRadius = 1.5; // Corner radius in mm
    
    // Draw white background with grey border and rounded corners
    pdf.setFillColor(255, 255, 255); // White
    pdf.setDrawColor(209, 213, 219); // #d1d5db (gray-300)
    pdf.setLineWidth(0.2);
    
    // Draw rounded rectangle
    pdf.roundedRect(x, y, watermarkWidth, watermarkHeight, cornerRadius, cornerRadius, 'FD'); // Fill and Draw
    
    // Add text with a font that's guaranteed to be bold
    pdf.setTextColor(107, 114, 128); // #6b7280 (gray-500)
    
    // Use helvetica bold which is guaranteed to work in PDFs
    pdf.setFont('helvetica', 'bold');
    console.log('Using helvetica bold font for watermark for consistent rendering');
    
    // Use a larger font size for more emphasis
    pdf.setFontSize(11);
    
    // Make text bolder by drawing it multiple times with slight offset
    const makeTextBold = (text: string, x: number, y: number) => {
      // Draw the text multiple times with slight offsets
      pdf.text(text, x, y);
      pdf.text(text, x + 0.05, y);
    };
    
    // Position text - adjusted for tighter spacing
    const textX = x + 3.5; // Slightly reduced left margin
    const textY = y + watermarkHeight/2 + 1.2;
    makeTextBold('Built with', textX, textY);
    
    // Add the watermark image - adjusted position with increased spacing
    const logoX = textX + 18.5; // Increased spacing between text and icon (was 14.5)
    const logoY = textY - 3.75; // Moved higher (was -3)
    const logoWidth = 5; // Increased size
    const logoHeight = 5; // Increased size
    
    // Add ResumeCool text after the icon - adjusted for tighter spacing
    makeTextBold('ResumeCool', logoX + logoWidth + 0.8, textY); // Reduced spacing after icon
    
    // Use the cached base64 image if available
    if (cachedWatermarkBase64) {
      try {
        pdf.addImage(cachedWatermarkBase64, 'PNG', logoX, logoY, logoWidth, logoHeight);
        console.log('Added watermark image from cached base64');
      } catch (imgError) {
        console.error('Error adding cached watermark image to PDF:', imgError);
        
        // Try with the fallback image
        try {
          pdf.addImage(FALLBACK_WATERMARK_BASE64, 'PNG', logoX, logoY, logoWidth, logoHeight);
          console.log('Added fallback watermark image to PDF');
        } catch (fallbackError) {
          // Fallback to circle if all image attempts fail
          pdf.setFillColor(107, 114, 128); // #6b7280 (gray-500)
          pdf.circle(logoX + logoWidth/2, logoY + logoHeight/2, 2.5, 'F'); // Bigger circle
          console.log('Used circle fallback for watermark (image loading failed)');
        }
      }
    } else {
      // Try with the fallback image
      try {
        pdf.addImage(FALLBACK_WATERMARK_BASE64, 'PNG', logoX, logoY, logoWidth, logoHeight);
        console.log('Added fallback watermark image to PDF (no cached image)');
      } catch (fallbackError) {
        // Fallback to a generic icon
        pdf.setFillColor(107, 114, 128); // #6b7280 (gray-500)
        pdf.circle(logoX + logoWidth/2, logoY + logoHeight/2, 2.5, 'F'); // Bigger circle
        console.log('Used circle fallback for watermark (fallback image failed)');
      }
    }
    
    console.log('Added styled watermark with image to PDF');
  } catch (error) {
    console.error('Error adding watermark to PDF:', error);
  }
}

// Helper function to draw a rounded rectangle in PDF

// Load Poppins font for PDF
async function loadPoppinsFont(): Promise<void> {
  return new Promise((resolve) => {
    try {
      // Check if Poppins font is already loaded
      if (document.fonts && 
          Array.from(document.fonts.values()).some(font => 
            font.family.toLowerCase() === 'poppins'
          )) {
        console.log('Poppins font already loaded');
        resolve();
        return;
      }
      
      // Create a link element for the Poppins font
      const fontLink = document.createElement('link');
      fontLink.rel = 'stylesheet';
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap';
      document.head.appendChild(fontLink);
      
      // Create a span with Poppins font to force loading
      const span = document.createElement('span');
      span.style.fontFamily = 'Poppins, sans-serif';
      span.style.fontWeight = 'bold';
      span.style.position = 'absolute';
      span.style.visibility = 'hidden';
      span.textContent = 'Poppins Font Preload';
      document.body.appendChild(span);
      
      // Wait for the font to load
      const poppinsFont = new FontFaceObserver('Poppins', { weight: 700 });
      poppinsFont.load(null, 5000).then(() => {
        console.log('Poppins font loaded successfully');
        resolve();
      }).catch((err) => {
        console.warn('Failed to load Poppins font:', err);
        resolve(); // Continue anyway
      });
    } catch (error) {
      console.warn('Error setting up Poppins font:', error);
      resolve(); // Continue anyway
    }
  });
}
