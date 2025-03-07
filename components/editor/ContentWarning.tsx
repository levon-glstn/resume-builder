import React, { useEffect, useState } from 'react';
import { HiOutlineExclamation } from 'react-icons/hi';

interface ContentWarningProps {
  resumeElement: HTMLElement | null;
}

const ContentWarning: React.FC<ContentWarningProps> = ({ resumeElement }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Function to check if content is too long for a single page
    const checkContentLength = () => {
      if (!resumeElement) return;
      
      // B4 dimensions in mm
      const pdfWidth = 250; // B4 width
      const pdfHeight = 353; // B4 height
      
      // Define margins in mm
      const margin = 10; // 10mm margin on all sides
      const contentHeight = pdfHeight - (margin * 2);
      
      // Scale factor used in PDF generation
      const scale = 2.5;
      
      // Convert mm to pixels (1mm ≈ 3.779528px)
      const contentHeightInPx = contentHeight * 3.779528 * scale;
      
      // Get the total height of the element
      const elementHeight = resumeElement.offsetHeight;
      
      // Calculate scaled height
      const scaledHeight = elementHeight * scale;
      
      // Check if content exceeds a single page
      const isTooLong = scaledHeight > contentHeightInPx;
      
      setIsVisible(isTooLong);
    };

    // Check initially and whenever the resume element changes
    checkContentLength();
    
    // Set up a resize observer to check when content size changes
    if (resumeElement) {
      const resizeObserver = new ResizeObserver(() => {
        checkContentLength();
      });
      
      resizeObserver.observe(resumeElement);
      
      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [resumeElement]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-amber-50 border border-amber-300 text-amber-800 px-4 py-2 rounded-lg shadow-md flex items-center gap-2 z-50 animate-fadeIn">
      <HiOutlineExclamation className="text-amber-500 text-xl flex-shrink-0" />
      <div>
        <p className="font-medium">Content may exceed one page</p>
        <p className="text-sm">Your resume may be split across multiple pages in the PDF</p>
      </div>
    </div>
  );
};

export default ContentWarning; 