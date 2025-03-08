'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useDrag, useGesture } from '@use-gesture/react';
import type { ResumeContent } from '@/types/resume';
import MobileGestureGuide from './MobileGestureGuide';

interface ZoomableEditorProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const ZoomableEditor: React.FC<ZoomableEditorProps> = ({ 
  children, 
  className = '',
  style = {}
}) => {
  // State for transform values - only used on mobile
  const [{ x, y, scale }, api] = useSpring(() => ({ 
    x: 0, 
    y: 0, 
    scale: 1,
    // Smoother animation with slightly slower speed
    config: { mass: 1, tension: 280, friction: 30 },
    onChange: () => {
      // Only show zoom indicator on mobile
      if (isMobile) {
        setShowZoomIndicator(true);
        
        if (zoomIndicatorTimeoutRef.current) {
          clearTimeout(zoomIndicatorTimeoutRef.current);
        }
        
        zoomIndicatorTimeoutRef.current = setTimeout(() => {
          setShowZoomIndicator(false);
        }, 1500);
      }
    }
  }));

  // Reference to the container element
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track if we're on a mobile device
  const [isMobile, setIsMobile] = useState(false);
  
  // State for showing the gesture guide
  const [showGuide, setShowGuide] = useState(false);
  
  // State for showing zoom indicator
  const [showZoomIndicator, setShowZoomIndicator] = useState(false);
  const zoomIndicatorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Check if we're on a mobile device
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth <= 768;
      setIsMobile(isMobileDevice);
      
      // Show guide on first mobile visit
      if (isMobileDevice) {
        const hasSeenGuide = localStorage.getItem('hasSeenMobileGestureGuide');
        if (!hasSeenGuide) {
          setShowGuide(true);
          localStorage.setItem('hasSeenMobileGestureGuide', 'true');
        }
      } else {
        // Reset transform values when switching to desktop
        api.start({ x: 0, y: 0, scale: 1 });
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, [api]);

  // Reset transform when orientation changes (mobile only)
  useEffect(() => {
    const handleOrientationChange = () => {
      if (isMobile) {
        api.start({ x: 0, y: 0, scale: 1 });
      }
    };
    
    window.addEventListener('orientationchange', handleOrientationChange);
    
    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [api, isMobile]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (zoomIndicatorTimeoutRef.current) {
        clearTimeout(zoomIndicatorTimeoutRef.current);
      }
    };
  }, []);

  // Bind gestures - only enabled on mobile
  const bind = useGesture(
    {
      onDrag: ({ offset: [ox, oy], event }) => {
        if (isMobile) {
          event?.preventDefault();
          // Use animation for drag instead of immediate update
          api.start({ x: ox, y: oy });
        }
      },
      onPinch: ({ offset: [d], event }) => {
        if (isMobile) {
          event?.preventDefault();
          const newScale = 1 + d / 200;
          // Allow much more zooming out (down to 0.1) but limit zooming in to 3x
          const clampedScale = Math.min(Math.max(newScale, 0.1), 3);
          // Use animation for pinch instead of immediate update
          api.start({ scale: clampedScale });
        }
      },
      onDoubleClick: () => {
        // Reset transform on double click (mobile only)
        if (isMobile) {
          api.start({ x: 0, y: 0, scale: 1 });
        }
      }
    },
    {
      // Only enable gestures on mobile
      enabled: isMobile,
      drag: { from: () => [x.get(), y.get()] },
      pinch: { from: () => [(scale.get() - 1), 0] }
    }
  );

  // Function to handle zoom buttons (mobile only)
  const handleZoom = (zoomFactor: number) => {
    if (isMobile) {
      const currentScale = scale.get();
      const newScale = currentScale * zoomFactor;
      // Allow zooming out to 0.1 (10% of original size)
      const clampedScale = Math.min(Math.max(newScale, 0.1), 3);
      api.start({ scale: clampedScale });
    }
  };

  // Format zoom percentage
  const getZoomPercentage = () => {
    return `${Math.round(scale.get() * 100)}%`;
  };

  // If on desktop, just render the children without any gesture functionality
  // but maintain the same centering and layout as before
  if (!isMobile) {
    return (
      <div 
        className={`flex justify-center items-start ${className}`} 
        style={{
          ...style,
          width: '100%',
          height: '100%'
        }}
      >
        {children}
      </div>
    );
  }

  // Mobile-specific rendering with gesture support
  return (
    <>
      <div 
        ref={containerRef}
        className={`relative overflow-hidden touch-none editor-container mobile-gesture-container ${className}`}
        style={{
          ...style,
          height: '100%',
          width: '100%',
          touchAction: 'none' // Explicitly disable browser touch actions
        }}
      >
        <animated.div
          {...bind()}
          style={{
            x,
            y,
            scale,
            height: '100%',
            width: '100%',
            touchAction: 'none',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            WebkitTouchCallout: 'none',
            WebkitUserSelect: 'none'
          }}
          className="prevent-select zoom-container"
        >
          {children}
        </animated.div>
        
        {showZoomIndicator && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] bg-black/70 text-white px-3 py-1.5 rounded-full text-sm font-medium animate-fadeIn">
            {getZoomPercentage()}
          </div>
        )}
        
        {/* Control buttons with improved visibility */}
        <div className="fixed bottom-24 right-4 z-[9999] flex flex-col gap-2">
          {/* Container with semi-transparent background for better visibility */}
          <div className="bg-white/90 backdrop-blur-sm p-2 rounded-xl shadow-xl border border-gray-200">
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => handleZoom(1.2)}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-md text-gray-700 hover:bg-gray-100 active:bg-gray-200 border border-gray-300"
                aria-label="Zoom in"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </button>
              
              <button 
                onClick={() => handleZoom(0.8)}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-md text-gray-700 hover:bg-gray-100 active:bg-gray-200 border border-gray-300"
                aria-label="Zoom out"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
              
              <button 
                onClick={() => setShowGuide(true)}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-md text-gray-700 hover:bg-gray-100 active:bg-gray-200 border border-gray-300"
                aria-label="Show gesture guide"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1a1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {showGuide && <MobileGestureGuide onClose={() => setShowGuide(false)} />}
    </>
  );
};

export default ZoomableEditor; 