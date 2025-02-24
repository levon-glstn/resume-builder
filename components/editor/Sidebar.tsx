import React, { useState, useEffect } from 'react';
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
  HiDownload
} from 'react-icons/hi';
import { HiOutlineDocumentText } from 'react-icons/hi';
import { FaLinkedin } from 'react-icons/fa';
import { generatePDF } from '@/utils/pdfGenerator';

const colors = [
  '#4338ca', // Indigo
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

interface SidebarProps {
  primaryColor: string;
  activeSections: Record<string, boolean>;
  onColorChange: (color: string) => void;
  onSectionToggle: (sectionId: string, isActive: boolean) => void;
  onNewResume: () => void;
  defaultContent: any;
  resumeRef: React.RefObject<HTMLElement>;
  fontFamily: string;
  onFontChange: (font: string) => void;
}

export default function Sidebar({
  primaryColor,
  activeSections,
  onColorChange,
  onSectionToggle,
  onNewResume,
  defaultContent,
  resumeRef,
  fontFamily,
  onFontChange
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  useEffect(() => {
    // Set the selected color after component mounts
    setSelectedColor(primaryColor);
  }, [primaryColor]);

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

  const sidebarClasses = isCollapsed 
    ? "w-0 opacity-0 transform -translate-x-full"
    : "w-64 opacity-100 transform translate-x-0";

  const contactFields = [
    { id: 'photo', icon: <HiOutlineUser className="w-4 h-4" />, label: 'Photo' },
    { id: 'email', icon: <HiOutlineMail className="w-4 h-4" />, label: 'Email' },
    { id: 'phone', icon: <HiOutlinePhone className="w-4 h-4" />, label: 'Phone' },
    { id: 'location', icon: <HiOutlineLocationMarker className="w-4 h-4" />, label: 'Location' },
    { id: 'linkedin', icon: <FaLinkedin className="w-4 h-4" />, label: 'LinkedIn' },
    { id: 'url', icon: <HiOutlineGlobeAlt className="w-4 h-4" />, label: 'Website' },
  ];

  return (
    <div className="relative">
      {/* Collapse Button - Always visible */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute right-0 top-4 z-50 p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow border border-gray-200"
        style={{ transform: isCollapsed ? 'translateX(100%)' : 'translateX(50%)' }}
      >
        {isCollapsed ? (
          <HiChevronRight className="w-5 h-5 text-gray-600" />
        ) : (
          <HiChevronLeft className="w-5 h-5 text-gray-600" />
        )}
      </button>

      <aside className={`${sidebarClasses} h-screen flex-shrink-0 bg-white border-r border-gray-200 text-gray-900 transition-all duration-300 ease-in-out`}>
        {/* Content */}
        <div className="h-full flex flex-col">
          {/* Brand */}
          <div className="flex items-center p-4 border-b border-gray-200 flex-shrink-0">
            <h1 className="text-xl font-bold whitespace-nowrap">
              Resume<span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">Craft</span>
            </h1>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-8">
              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  className="w-full flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors text-gray-700"
                  onClick={onNewResume}
                >
                  <HiRefresh className="w-5 h-5" />
                  <span>Start Over</span>
                </button>
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
                  <span>{isGeneratingPDF ? 'Generating PDF...' : 'Download PDF'}</span>
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
                  <HiOutlineDocumentText className="w-5 h-5" />
                  Font Family
                </label>
                <div className="space-y-2">
                  {fonts.map((font) => (
                    <button
                      key={font.name}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        fontFamily === font.value 
                          ? 'bg-primary-100 text-primary-700' 
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                      onClick={() => onFontChange(font.value)}
                      style={{ fontFamily: font.value }}
                    >
                      {font.name}
                    </button>
                  ))}
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