import React, { useState, useEffect, useRef } from 'react';
import { 
  HiPlus,
  HiAcademicCap,
  HiOfficeBuilding,
  HiTag,
  HiTemplate,
  HiColorSwatch,
  HiRefresh,
  HiChevronLeft,
  HiChevronRight,
  HiX,
  HiDocumentText,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineLocationMarker,
  HiOutlineUser,
  HiOutlineLink,
  HiOutlineGlobeAlt,
  HiDownload,
  HiPlusCircle,
  HiCamera
} from 'react-icons/hi';
import { HiOutlineDocumentText } from 'react-icons/hi';
import { FaLinkedin, FaGithub } from 'react-icons/fa';
import { generatePDF } from '@/utils/pdfGenerator';
import { ChevronDown } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const colors = [
  '#000000', // Black (replacing Indigo)
  '#7c3aed', // Purple
  '#059669', // Green
  '#dc2626', // Red
  '#ea580c', // Orange
  '#0891b2', // Cyan
  '#be185d', // Pink
  '#1e40af', // Blue
];

// Define available fonts
const fonts = [
  { name: 'Poppins', value: 'Poppins, sans-serif' },
  { name: 'Rubik', value: 'Rubik, sans-serif' },
  { name: 'Roboto', value: 'Roboto, sans-serif' },
  { name: 'Open Sans', value: 'Open Sans, sans-serif' },
];

// Define font sizes
const fontSizes = [
  { name: 'Small', value: 'small' },
  { name: 'Medium', value: 'medium' },
  { name: 'Large', value: 'large' },
];

interface SidebarProps {
  primaryColor: string;
  activeSections: Record<string, boolean>;
  onColorChange: (color: string) => void;
  onSectionToggle: (sectionId: string, isActive: boolean) => void;
  defaultContent: any;
  resumeRef: React.RefObject<HTMLElement>;
  fontFamily: string;
  onFontChange: (font: string) => void;
  fontSize?: string;
  onFontSizeChange?: (size: string) => void;
  onCollapsedChange?: (isCollapsed: boolean) => void;
}

// Add a function to detect mobile devices
function isMobileDevice(): boolean {
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
    navigator.userAgent.toLowerCase()
  );
}

export default function Sidebar({
  primaryColor,
  activeSections,
  onColorChange,
  onSectionToggle,
  defaultContent,
  resumeRef,
  fontFamily,
  onFontChange,
  fontSize = 'medium',
  onFontSizeChange,
  onCollapsedChange
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [fontDropdownOpen, setFontDropdownOpen] = useState(false);
  const [sizeDropdownOpen, setSizeDropdownOpen] = useState(false);
  const [selectedFontSize, setSelectedFontSize] = useState(fontSize);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Set the selected color after component mounts
    setSelectedColor(primaryColor);
    // Check if we're on a mobile device
    setIsMobile(isMobileDevice());
  }, [primaryColor]);

  // Notify parent component when collapsed state changes
  useEffect(() => {
    if (onCollapsedChange) {
      onCollapsedChange(isCollapsed);
    }
  }, [isCollapsed, onCollapsedChange]);

  const handleDownloadPDF = async () => {
    if (!resumeRef.current || isGeneratingPDF) return;
    
    setIsGeneratingPDF(true);
    try {
      await generatePDF(resumeRef.current);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      // You might want to show an error toast here
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Remove animation classes and use display property instead
  const sidebarClasses = isCollapsed 
    ? "w-0 hidden"
    : "w-64";

  const contactFields = [
    { id: 'photo', icon: <HiCamera className="w-4 h-4" />, label: 'Photo' },
    { id: 'email', icon: <HiOutlineMail className="w-4 h-4" />, label: 'Email' },
    { id: 'phone', icon: <HiOutlinePhone className="w-4 h-4" />, label: 'Phone' },
    { id: 'location', icon: <HiOutlineLocationMarker className="w-4 h-4" />, label: 'Location' },
    { id: 'linkedin', icon: <FaLinkedin className="w-4 h-4" />, label: 'LinkedIn' },
    { id: 'github', icon: <FaGithub className="w-4 h-4" />, label: 'GitHub' },
    { id: 'url', icon: <HiOutlineGlobeAlt className="w-4 h-4" />, label: 'Website' },
  ];

  const handleFontSizeChange = (size: string) => {
    setSelectedFontSize(size);
    if (onFontSizeChange) {
      onFontSizeChange(size);
    }
  };

  const handleToggleCollapse = () => {
    setIsCollapsed(prev => !prev);
  };

  return (
    <div className="relative">
      {/* Collapse Button - Always visible */}
      <button
        onClick={handleToggleCollapse}
        className="absolute right-0 top-4 z-50 p-2 bg-white rounded-full shadow-lg hover:shadow-xl border border-gray-200 overflow-hidden group"
        style={{ 
          transform: isCollapsed ? 'translateX(100%)' : 'translateX(50%)',
        }}
      >
        <div className="absolute inset-0 bg-gray-100 opacity-0 group-hover:opacity-100"></div>
        <div className="absolute inset-0 bg-primary-50 opacity-0 group-active:opacity-100 scale-90 group-active:scale-100 rounded-full"></div>
        <div>
          {isCollapsed ? (
            <HiChevronRight className="w-5 h-5 text-gray-600 relative z-10" />
          ) : (
            <HiChevronLeft className="w-5 h-5 text-gray-600 relative z-10" />
          )}
        </div>
      </button>

      <aside 
        className={`${sidebarClasses} h-screen flex-shrink-0 bg-white border-r border-gray-200 text-gray-900 overflow-hidden`}
        style={{
          boxShadow: isCollapsed ? 'none' : '4px 0 16px -8px rgba(0, 0, 0, 0.1)'
        }}
      >
        {/* Content */}
        <div className="h-full flex flex-col">
          {/* Brand */}
          <div className="flex items-center justify-start p-2 border-b border-gray-200 flex-shrink-0">
            <div className="-ml-4">
              <Link href="/" className="block cursor-pointer">
                <Image 
                  src="/images/logo.svg" 
                  alt="ResumeCool Logo" 
                  width={250} 
                  height={100} 
                  className="h-20 w-auto"
                />
              </Link>
            </div>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-8">
              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  className={`w-full flex items-center gap-2 px-4 py-2 ${
                    isGeneratingPDF 
                      ? 'bg-gray-100 cursor-not-allowed' 
                      : 'bg-primary-100 hover:bg-primary-200'
                  } rounded-md transition-colors text-primary-700`}
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPDF}
                >
                  <HiDownload className={`w-5 h-5 ${isGeneratingPDF ? 'animate-bounce' : ''}`} />
                  <span>
                    {isGeneratingPDF 
                      ? isMobile
                        ? 'Opening in a new tab...'
                        : 'Generating PDF...' 
                      : 'Download PDF'
                    }
                  </span>
                </button>
              </div>

              {/* Color Picker */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <HiColorSwatch className="w-5 h-5" />
                  Theme Color
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-full border-2 ${
                        selectedColor === color ? 'border-gray-900' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        onColorChange(color);
                        setSelectedColor(color);
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Font Selector */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <HiDocumentText className="w-5 h-5" />
                  Font
                </label>
                <div className="relative">
                  <button 
                    className="w-full flex items-center justify-between border rounded-md p-2 bg-white"
                    onClick={() => setFontDropdownOpen(!fontDropdownOpen)}
                  >
                    <span style={{ fontFamily: fontFamily }}>
                      {fonts.find(f => f.value === fontFamily)?.name || fontFamily}
                    </span>
                    <ChevronDown size={16} />
                  </button>
                  
                  {fontDropdownOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg">
                      {fonts.map((font) => (
                        <button
                          key={font.value}
                          className={`w-full text-left p-2 hover:bg-gray-100 ${fontFamily === font.value ? 'bg-gray-100' : ''}`}
                          style={{ fontFamily: font.value }}
                          onClick={() => {
                            onFontChange(font.value);
                            setFontDropdownOpen(false);
                          }}
                        >
                          {font.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Font Size Selector */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <HiPlusCircle className="w-5 h-5" />
                  Font Size
                </label>
                <div className="relative">
                  <button 
                    className="w-full flex items-center justify-between border rounded-md p-2 bg-white"
                    onClick={() => setSizeDropdownOpen(!sizeDropdownOpen)}
                  >
                    <span>
                      {fontSizes.find(s => s.value === selectedFontSize)?.name || 'Medium'}
                    </span>
                    <ChevronDown size={16} />
                  </button>
                  
                  {sizeDropdownOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg">
                      {fontSizes.map((size) => (
                        <button
                          key={size.value}
                          className={`w-full text-left p-2 hover:bg-gray-100 ${selectedFontSize === size.value ? 'bg-gray-100' : ''}`}
                          onClick={() => {
                            handleFontSizeChange(size.value);
                            setSizeDropdownOpen(false);
                          }}
                        >
                          {size.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="h-px bg-gray-200" />

              {/* Personal Details */}
              <div className="space-y-2">
                <h3 className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <HiOutlineUser className="w-5 h-5" />
                  Personal Details
                </h3>
                <div className="space-y-2">
                  {contactFields.map(({ id, icon, label }) => (
                    <div
                      key={id}
                      className="flex items-center justify-between px-3 py-2 text-sm bg-gray-50 rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        {icon}
                        <span>{label}</span>
                      </div>
                      <div className="relative inline-block w-8 h-4 rounded-full bg-gray-200 cursor-pointer transition-colors duration-200 ease-in-out"
                           onClick={() => onSectionToggle(`contact.${id}`, !activeSections[`contact.${id}`])}
                           style={{ backgroundColor: activeSections[`contact.${id}`] ? '#6B7280' : undefined }}>
                        <div className={`absolute left-0 top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform duration-200 ease-in-out ${
                          activeSections[`contact.${id}`] ? 'translate-x-4' : 'translate-x-1'
                        }`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-px bg-gray-200" />

              {/* Section Management */}
              <div className="space-y-2">
                <h3 className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <HiTemplate className="w-5 h-5" />
                  Sections
                </h3>
                <div className="space-y-2">
                  {Object.entries(defaultContent).map(([key, value]) => {
                    if ((Array.isArray(value) || key === 'summary') && key !== 'contact') {
                      return (
                        <div
                          key={key}
                          className="flex items-center justify-between px-3 py-2 text-sm bg-gray-50 rounded-md"
                        >
                          <div className="flex items-center gap-2">
                            {key === 'summary' && <HiDocumentText className="w-4 h-4" />}
                            {key === 'experience' && <HiOfficeBuilding className="w-4 h-4" />}
                            {key === 'education' && <HiAcademicCap className="w-4 h-4" />}
                            {key === 'projects' && <HiTemplate className="w-4 h-4" />}
                            {key === 'languages' && <HiTag className="w-4 h-4" />}
                            {key === 'skills' && <HiTag className="w-4 h-4" />}
                            <span className="capitalize">{key}</span>
                          </div>
                          <div className="relative inline-block w-8 h-4 rounded-full bg-gray-200 cursor-pointer transition-colors duration-200 ease-in-out"
                               onClick={() => onSectionToggle(key, !activeSections[key])}
                               style={{ backgroundColor: activeSections[key] ? '#6B7280' : undefined }}>
                            <div className={`absolute left-0 top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform duration-200 ease-in-out ${
                              activeSections[key] ? 'translate-x-4' : 'translate-x-1'
                            }`} />
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
} 