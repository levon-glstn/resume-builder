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

    // Create custom language level indicators for PDF
    let languageItems = clonedElement.querySelectorAll('[class*="languages"] > div > div[data-language-level]');
    
    // If no items found with the first selector, try a more general one
    if (languageItems.length === 0) {
      console.log('No language items found with primary selector, trying fallback...');
      languageItems = clonedElement.querySelectorAll('[class*="languages"] > div > div');
    }
    
    console.log(`Found ${languageItems.length} language items to process`);
    
    languageItems.forEach((item, index) => {
      if (item instanceof HTMLElement) {
        console.log(`Processing language item ${index + 1}/${languageItems.length}`);
        // Find the language name and proficiency container
        const nameElement = item.querySelector('[class*="font-semibold"]');
        const proficiencyContainer = item.querySelector('[class*="text-right"]');
        
        if (nameElement && proficiencyContainer) {
          // Get the language name
          const languageName = nameElement.textContent || '';
          
          // Get the proficiency text
          const proficiencyTextContent = proficiencyContainer.querySelector('.language-proficiency-text')?.textContent || '';
          
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
          `;
          
          // Create proficiency text
          const proficiencyTextElement = document.createElement('span');
          proficiencyTextElement.textContent = proficiencyTextContent.replace(/\d/g, '').trim();
          proficiencyTextElement.style.cssText = `
            font-size: 14px !important;
            color: #666 !important;
          `;
          
          // Create circles container
          const circlesContainer = document.createElement('div');
          circlesContainer.style.cssText = `
            display: inline-flex !important;
            align-items: center !important;
            gap: 3px !important;
          `;
          
          // Determine the level (1-5) from the data attributes
          let level = 0;
          
          // Try to get level directly from the item's data-language-level attribute
          const dataLanguageLevel = item.getAttribute('data-language-level');
          if (dataLanguageLevel) {
            level = parseInt(dataLanguageLevel, 10);
          }
          
          // If not found, try the language-level container
          if (level === 0) {
            const levelContainer = proficiencyContainer.querySelector('.language-level');
            if (levelContainer && levelContainer instanceof HTMLElement) {
              const containerDataLevel = levelContainer.getAttribute('data-level');
              if (containerDataLevel) {
                level = parseInt(containerDataLevel, 10);
              }
            }
          }
          
          // If still not found, try to count the active circles
          if (level === 0) {
            const levelCircles = proficiencyContainer.querySelectorAll('[data-level-value]');
            const activeCircles = Array.from(levelCircles).filter(circle => {
              if (circle instanceof HTMLElement) {
                return circle.classList.contains('bg-primary-600') || 
                       circle.classList.contains('bg-blue-600');
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
              width: 10px !important;
              height: 10px !important;
              border-radius: 50% !important;
              background-color: ${i <= level ? primaryColor : '#e5e7eb'} !important;
              display: inline-block !important;
            `;
            circlesContainer.appendChild(circle);
          }
          
          // Assemble the elements
          proficiencyFlexContainer.appendChild(proficiencyTextElement);
          proficiencyFlexContainer.appendChild(circlesContainer);
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
              originalDataLevel: dataLanguageLevel
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
          photoImg.style.width = '128px'; // 32mm equivalent
          photoImg.style.height = '128px';
          photoImg.style.objectFit = 'cover';
          photoImg.style.borderRadius = '8px';
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
      compress: true
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
      
      // Add canvas to PDF with maximum quality settings
      pdf.addImage(
        fullCanvas.toDataURL('image/png', 1.0),
        'PNG',
        margin,
        margin,
        finalWidth,
        finalHeight,
        undefined,
        'FAST' // Use fast compression algorithm for better quality
      );
      
      console.log(`Added single page: width=${finalWidth}mm, height=${finalHeight}mm`);
    } else {
      // Multi-page approach
      console.log(`Content requires ${pageCount} pages, using multi-page approach`);
      
      // First, identify section boundaries to avoid cutting text
      const sectionBoundaries = findSectionBoundaries(clonedElement, scale, contentHeightInPx);
      console.log('Identified section boundaries:', sectionBoundaries);
      
      // Calculate the actual number of pages needed based on content and section boundaries
      const actualPageCount = sectionBoundaries.length;
      console.log(`Actual pages needed with smart breaks: ${actualPageCount}`);
      
      // Process each page based on the smart boundaries
      for (let i = 0; i < actualPageCount; i++) {
        // If not the first page, add a new page to the PDF
        if (i > 0) {
          pdf.addPage([pdfWidth, pdfHeight]); // Specify B4 dimensions for new pages
        }
        
        console.log(`Processing page ${i + 1} of ${actualPageCount}`);
        
        // Get the start and end positions for this page
        const startY = i === 0 ? 0 : sectionBoundaries[i - 1].endY;
        const endY = sectionBoundaries[i].endY;
        const srcHeight = endY - startY;
        
        // Skip if we've gone beyond the canvas height or if the slice height is too small
        if (srcHeight <= 0 || srcHeight < 10) {
          console.log(`Skipping page ${i + 1} as it has no significant content (height: ${srcHeight}px)`);
          // If we added a page but there's no content, remove it
          if (i > 0) {
            pdf.deletePage(pdf.getNumberOfPages());
          }
          continue;
        }
        
        // Create a temporary canvas for this page with high-DPI settings
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = fullCanvas.width;
        pageCanvas.height = srcHeight;
        
        // Get a high-quality rendering context
        const ctx = pageCanvas.getContext('2d', { alpha: false, desynchronized: false });
        if (!ctx) {
          console.error(`Could not get canvas context for page ${i + 1}`);
          continue;
        }
        
        // Apply high-quality rendering settings
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Set white background for the page canvas
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        
        // Draw the slice from the full canvas to the page canvas with high quality
        ctx.drawImage(
          fullCanvas,
          0, startY, fullCanvas.width, srcHeight,  // Source rectangle
          0, 0, fullCanvas.width, srcHeight      // Destination rectangle
        );
        
        // Check if the page has actual content (not just white space)
        const imageData = ctx.getImageData(0, 0, pageCanvas.width, pageCanvas.height).data;
        let hasContent = false;
        
        // Sample the image data to check for non-white pixels
        // We don't need to check every pixel, just sample at regular intervals
        const sampleStep = 50; // Check every 50th pixel
        for (let p = 0; p < imageData.length; p += sampleStep * 4) {
          // If any RGB value is not 255 (white), we have content
          if (imageData[p] !== 255 || imageData[p + 1] !== 255 || imageData[p + 2] !== 255) {
            hasContent = true;
            break;
          }
        }
        
        if (!hasContent) {
          console.log(`Skipping page ${i + 1} as it appears to be empty (all white)`);
          // If we added a page but there's no content, remove it
          if (i > 0) {
            pdf.deletePage(pdf.getNumberOfPages());
          }
          continue;
        }
        
        // Calculate dimensions for the PDF
        const pageAspectRatio = pageCanvas.width / pageCanvas.height;
        const finalWidth = contentWidth;
        const finalHeight = finalWidth / pageAspectRatio;
        
        // Add the page canvas to the PDF with maximum quality settings
        pdf.addImage(
          pageCanvas.toDataURL('image/png', 1.0), 
          'PNG', 
          margin, margin, 
          finalWidth, finalHeight,
          undefined,
          'FAST' // Use fast compression algorithm for better quality
        );
        
        console.log(`Added page ${i + 1}: startY=${startY}px, endY=${endY}px, height=${srcHeight}px, PDF dimensions: ${finalWidth}mm × ${finalHeight}mm`);
      }
    }
    
    // Save the PDF with maximum quality
    pdf.save(fileName);
    
    // Clean up the cloned element
    document.body.removeChild(clonedElement);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
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
    if (Math.abs(breakY - top) < 60 && breakY < top) { // Increased from 50 to 60 for B4
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