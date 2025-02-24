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
  url: '\uf0ac'         // fa-globe
};

// Section spacing constants
const SPACING = {
  AFTER_HEADER: 15,     // Space after the header section (name, title, contacts)
  BETWEEN_SECTIONS: 25, // Space between major sections
  AFTER_SECTION_TITLE: 2, // Space after section titles (reduced from 8)
  BETWEEN_ITEMS: 15,    // Space between items within a section
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
  }
}

// Wait for fonts to load before generating PDF
async function waitForFonts() {
  const fonts = [
    new FontFaceObserver('Helvetica'),
    new FontFaceObserver('FontAwesome')
  ];

  try {
    await Promise.all(fonts.map(font => font.load(null, 5000)));
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

export async function generatePDF(resumeElement: HTMLElement): Promise<void> {
  try {
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

    // Clone the element to avoid modifying the original
    const clonedElement = resumeElement.cloneNode(true) as HTMLElement;
    document.body.appendChild(clonedElement);
    clonedElement.style.position = 'absolute';
    clonedElement.style.left = '-9999px';
    clonedElement.style.width = '225mm'; // A4+ width
    
    // Remove editor-only elements
    const removeElements = (element: HTMLElement, selectors: string[]) => {
      selectors.forEach(selector => {
        element.querySelectorAll(selector).forEach(el => el.remove());
      });
    };

    // Clean up editor elements
    removeElements(clonedElement, [
      'button',
      'input[type="text"]',
      '.skill-tag button',
      '[role="button"]',
    ]);

    // Fix photo sizing and aspect ratio
    const photoElement = clonedElement.querySelector('img[alt="Profile"]');
    if (photoElement instanceof HTMLImageElement) {
      photoElement.style.width = '128px'; // 32mm equivalent
      photoElement.style.height = '128px';
      photoElement.style.objectFit = 'cover';
      photoElement.style.borderRadius = '8px';
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

    // Verify and fix contact icons
    clonedElement.querySelectorAll('.contact > div').forEach((item, index) => {
      const itemEl = item as HTMLElement;
      const icon = itemEl.querySelector('svg, img');
      console.log(`Contact icon ${index} final check:`, {
        itemDisplay: itemEl.style.display,
        itemAlign: itemEl.style.alignItems,
        iconPresent: !!icon,
        iconDisplay: icon instanceof HTMLElement ? icon.style.display : 'N/A'
      });
    });

    // Fix skill tags styling with debug markers
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
        font-weight: 500 !important;
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
    clonedElement.style.padding = '15mm';
    clonedElement.style.boxSizing = 'border-box';

    // Wait for fonts and images
    await waitForFonts();
    convertSvgIconsToImages(clonedElement);
    await waitForImages(clonedElement);

    // Create PDF with A4+ dimensions
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [225, 315], // A4+ size
      compress: true
    });

    // Calculate dimensions and scaling
    const pdfWidth = 225; // A4+ width in mm
    const pdfHeight = 315; // A4+ height in mm
    
    // Calculate the scale factor to maintain aspect ratio with higher quality
    const elementWidth = clonedElement.offsetWidth;
    const elementHeight = clonedElement.offsetHeight;
    const scale = 4; // Fixed high-quality scale

    // Generate high-quality canvas with proper scaling
    const canvas = await html2canvas(clonedElement, {
      scale: scale,
      useCORS: true,
      logging: true, // Enable logging
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: elementWidth,
      height: elementHeight,
      imageTimeout: 15000,
      onclone: (clonedDoc, element) => {
        // Original text rendering enhancement
        const style = element.style as any;
        style['-webkit-font-smoothing'] = 'antialiased';
        style['-moz-osx-font-smoothing'] = 'grayscale';
        style['text-rendering'] = 'optimizeLegibility';
      }
    });

    // Add canvas to PDF
    pdf.addImage(canvas, 'JPEG', 0, 0, pdfWidth, pdfHeight);

    // Save PDF
    pdf.save(fileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
}