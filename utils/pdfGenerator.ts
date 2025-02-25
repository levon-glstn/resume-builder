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
    clonedElement.style.width = '225mm'; // A4+ width
    
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

    // Create PDF with A4 dimensions (not stretched)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4', // Standard A4 size
      compress: true
    });

    // Calculate dimensions and scaling
    const pdfWidth = 210; // Standard A4 width in mm
    const pdfHeight = 297; // Standard A4 height in mm
    
    // Calculate the scale factor to maintain aspect ratio with higher quality
    const elementWidth = clonedElement.offsetWidth;
    const elementHeight = clonedElement.offsetHeight;
    
    // Use a fixed scale for high quality without stretching
    const scale = 2;

    // Generate high-quality canvas with proper scaling
    const canvas = await html2canvas(clonedElement, {
      scale: scale,
      useCORS: true,
      logging: false,
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

    // Calculate aspect ratio to prevent stretching
    const canvasAspectRatio = canvas.width / canvas.height;
    const pdfAspectRatio = pdfWidth / pdfHeight;
    
    let finalWidth, finalHeight;
    
    if (canvasAspectRatio > pdfAspectRatio) {
      // Canvas is wider than PDF, fit to width
      finalWidth = pdfWidth - 20; // Leave 10mm margin on each side
      finalHeight = (pdfWidth - 20) / canvasAspectRatio;
    } else {
      // Canvas is taller than PDF, fit to height
      finalHeight = pdfHeight - 20; // Leave 10mm margin on top and bottom
      finalWidth = (pdfHeight - 20) * canvasAspectRatio;
    }
    
    // Center the image on the page
    const xOffset = (pdfWidth - finalWidth) / 2;
    const yOffset = (pdfHeight - finalHeight) / 2;

    // Add canvas to PDF with proper dimensions to prevent stretching
    pdf.addImage(canvas, 'JPEG', xOffset, yOffset, finalWidth, finalHeight);

    // Save PDF
    pdf.save(fileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
}