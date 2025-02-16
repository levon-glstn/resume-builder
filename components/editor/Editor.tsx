'use client';
/** @jsxImportSource react */

import React, { useState, useCallback, useRef } from 'react';
import type { ResumeContent } from '@/types/resume';
import { 
  HiOutlineLocationMarker, 
  HiOutlineMail, 
  HiOutlinePhone, 
  HiOutlineLink,
  HiCheck,
  HiOutlineCalendar,
  HiOutlineAcademicCap,
  HiOutlineChartBar,
  HiPlus,
  HiX,
  HiTrash
} from 'react-icons/hi';
import Image from 'next/image';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

interface EditorProps {
  content: ResumeContent;
  setContent: React.Dispatch<React.SetStateAction<ResumeContent>>;
  selectedFont: string;
  selectedFontSize: string;
  primaryColor: string;
  activeSections: Record<string, boolean>;
}

interface SectionData {
  id: string;
  title: string;
  type: keyof ResumeContent;
  items: any[];
}

interface EditableFieldProps {
  content: string;
  section: string;
  onEdit: (section: string, value: string) => void;
  isMultiline?: boolean;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  isBulletList?: boolean;
}

interface DateRangeFieldProps {
  startDate: Date | null;
  endDate: Date | null;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
  isPresent?: boolean;
  onPresentChange?: (isPresent: boolean) => void;
}

const DateRangeField: React.FC<DateRangeFieldProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  isPresent = false,
  onPresentChange,
}) => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">
        <DatePicker
          selected={startDate}
          onChange={(date: Date | null) => onStartDateChange(date)}
          className="w-full p-2 border rounded"
          placeholderText="Start Date"
        />
      </div>
      {!isPresent && (
        <div className="flex-1">
          <DatePicker
            selected={endDate}
            onChange={(date: Date | null) => onEndDateChange(date)}
            className="w-full p-2 border rounded"
            placeholderText="End Date"
          />
        </div>
      )}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={isPresent}
          onChange={(e) => onPresentChange?.(e.target.checked)}
          className="form-checkbox h-4 w-4"
        />
        <span className="text-sm text-gray-600">Current</span>
      </div>
    </div>
  );
};

const EditableField: React.FC<EditableFieldProps> = ({ 
  content, 
  section, 
  onEdit, 
  isMultiline = false,
  placeholder = '',
  className = '',
  style = {},
  isBulletList = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(content || (isBulletList ? '• ' : ''));

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    if (value !== content) {
      onEdit(section, value);
    }
  }, [value, content, section, onEdit]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && isBulletList) {
      e.preventDefault();
      const cursorPosition = e.currentTarget.selectionStart;
      const currentValue = e.currentTarget.value;
      const beforeCursor = currentValue.slice(0, cursorPosition);
      const afterCursor = currentValue.slice(cursorPosition);
      const newValue = beforeCursor + '\n• ' + afterCursor;
      setValue(newValue);
      setTimeout(() => {
        e.currentTarget.selectionStart = cursorPosition + 3;
        e.currentTarget.selectionEnd = cursorPosition + 3;
      }, 0);
    }
  }, [isBulletList]);

  const formatBulletPoints = useCallback((text: string) => {
    if (!isBulletList) return text;
    return text.split('\n')
      .map(line => line.trim())
      .filter(line => line)
      .map(line => line.startsWith('• ') ? line : `• ${line}`)
      .join('\n');
  }, [isBulletList]);

  if (isEditing) {
    if (isMultiline) {
      return (
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => {
            const formattedValue = formatBulletPoints(value);
            setValue(formattedValue);
            handleBlur();
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full p-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-pre-wrap ${className}`}
          style={{ ...style, lineHeight: '1.5' }}
          rows={5}
        />
      );
    }
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`w-full p-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
        style={style}
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={`cursor-text p-1 rounded hover:bg-gray-50 ${className}`}
      style={{ ...style, whiteSpace: 'pre-wrap' }}
    >
      {value || placeholder}
    </div>
  );
};

const Editor: React.FC<EditorProps> = ({ content, setContent, selectedFont, selectedFontSize, primaryColor, activeSections }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imagePosition, setImagePosition] = useState({ y: 0 });
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startImageY = useRef(0);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setImagePosition({ y: 0 }); // Reset position when new image is uploaded
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startY.current = e.clientY;
    startImageY.current = imagePosition.y;
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    
    const deltaY = e.clientY - startY.current;
    const newY = startImageY.current + deltaY;
    
    // Limit the dragging range to prevent the image from being dragged too far
    const maxDrag = 100; // Adjust this value to control how far the image can be dragged
    const limitedY = Math.max(Math.min(newY, maxDrag), -maxDrag);
    
    setImagePosition({ y: limitedY });
    e.preventDefault();
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  // Add mouseup event listener to window to handle cases where mouse is released outside the image
  React.useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const handleContentEdit = useCallback((section: string, value: string) => {
    setContent((prev: ResumeContent): ResumeContent => {
      const newContent: ResumeContent = { ...prev };
      const path = section.split('.');
      let current: any = newContent;
      
      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) {
          current[path[i]] = isNaN(Number(path[i + 1])) ? {} : [];
        }
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      
      return newContent;
    });
  }, [setContent]);

  const sections: SectionData[] = [
    { id: 'experience', title: 'EXPERIENCE', type: 'experience' as const, items: content.experience },
    { id: 'education', title: 'EDUCATION', type: 'education' as const, items: content.education },
    { id: 'skills', title: 'SKILLS', type: 'skills' as const, items: content.skills },
    ...(content.projects && activeSections.projects ? [{ id: 'projects', title: 'PROJECTS', type: 'projects' as const, items: content.projects }] : []),
    ...(content.languages && activeSections.languages ? [{ id: 'languages', title: 'LANGUAGES', type: 'languages' as const, items: content.languages }] : []),
    ...(content.certifications && activeSections.certifications ? [{ id: 'certifications', title: 'CERTIFICATIONS', type: 'certifications' as const, items: content.certifications }] : [])
  ];

  const getFontSize = (baseSize: string) => {
    const sizes = {
      small: {
        'text-4xl': 'text-3xl',
        'text-3xl': 'text-2xl',
        'text-2xl': 'text-xl',
        'text-xl': 'text-lg',
        'text-lg': 'text-base',
        'text-base': 'text-sm',
        'text-sm': 'text-xs',
        'text-[1.3rem]': 'text-lg',
        'text-[15px]': 'text-sm',
        // Contact info and details
        'text-gray-600': 'text-sm',
        // Description text
        'text-gray-500': 'text-xs',
        // Skills and tags
        'px-3 py-1.5': 'px-2 py-1',
        // Dates and locations
        'gap-4': 'gap-3',
        // Icons
        'w-3.5 h-3.5': 'w-3 h-3',
        'w-4 h-4': 'w-3.5 h-3.5',
        'w-6 h-6': 'w-5 h-5',
        'w-8 h-8': 'w-7 h-7'
      },
      large: {
        'text-4xl': 'text-5xl',
        'text-3xl': 'text-4xl',
        'text-2xl': 'text-3xl',
        'text-xl': 'text-2xl',
        'text-lg': 'text-xl',
        'text-base': 'text-lg',
        'text-sm': 'text-base',
        'text-[1.3rem]': 'text-2xl',
        'text-[15px]': 'text-base',
        // Contact info and details
        'text-gray-600': 'text-base',
        // Description text
        'text-gray-500': 'text-sm',
        // Skills and tags
        'px-3 py-1.5': 'px-4 py-2',
        // Dates and locations
        'gap-4': 'gap-5',
        // Icons
        'w-3.5 h-3.5': 'w-4 h-4',
        'w-4 h-4': 'w-4.5 h-4.5',
        'w-6 h-6': 'w-7 h-7',
        'w-8 h-8': 'w-9 h-9'
      }
    };

    return selectedFontSize === 'medium' ? baseSize : sizes[selectedFontSize as keyof typeof sizes][baseSize as keyof typeof sizes[keyof typeof sizes]] || baseSize;
  };

  const addNewExperience = () => {
    setContent(prev => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          title: 'New Position',
          company: 'Company Name',
          location: 'City, Country',
          startDate: 'MM/YYYY',
          endDate: 'Present',
          description: '• Describe your responsibilities and achievements'
        }
      ]
    }));
  };

  const addNewEducation = () => {
    setContent(prev => ({
      ...prev,
      education: [
        ...prev.education,
        {
          degree: 'Degree Name',
          school: 'Institution Name',
          location: 'City, Country',
          startDate: 'MM/YYYY',
          endDate: 'MM/YYYY',
          details: 'Additional details about your education'
        }
      ]
    }));
  };

  const removeExperience = (index: number) => {
    setContent(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="flex flex-col gap-4 p-6 max-w-[1100px] mx-auto bg-white rounded-lg" style={{ fontFamily: selectedFont }}>
      {/* Header Section */}
      <div className="flex justify-between items-start mb-4">
        {/* Left side - Name and Contact */}
        <div className="text-left flex-1">
          <h1 className={`${getFontSize('text-4xl')} font-bold mb-2`} style={{ color: primaryColor }}>
            <EditableField
              content={content.name}
              section="name"
              onEdit={handleContentEdit}
              placeholder="ALEXANDER TAYLOR"
              className={`${getFontSize('text-4xl')} hover:bg-gray-100 transition-colors duration-200`}
            />
          </h1>
          <h2 className={`${getFontSize('text-xl')} text-gray-600 mb-4`}>
            <EditableField
              content={content.title}
              section="title"
              onEdit={handleContentEdit}
              placeholder="Senior Product Manager | SaaS | UX Optimization"
              className={`${getFontSize('text-xl')} hover:bg-gray-100 transition-colors duration-200`}
            />
          </h2>
          <div className="flex items-center flex-wrap gap-4 text-gray-600">
            {activeSections.phone && (
              <div className="flex items-center gap-1 min-w-[140px]">
                <HiOutlinePhone className={getFontSize('w-3.5 h-3.5')} style={{ color: primaryColor }} />
                <EditableField
                  content={content.contact.phone}
                  section="contact.phone"
                  onEdit={handleContentEdit}
                  placeholder="+1 (234) 555-1234"
                  className={`hover:bg-gray-100 ${getFontSize('text-gray-600')}`}
                />
              </div>
            )}
            {activeSections.email && (
              <div className="flex items-center gap-1 min-w-[180px]">
                <HiOutlineMail className={getFontSize('w-3.5 h-3.5')} style={{ color: primaryColor }} />
                <EditableField
                  content={content.contact.email}
                  section="contact.email"
                  onEdit={handleContentEdit}
                  placeholder="help@enhancv.com"
                  className={`hover:bg-gray-100 ${getFontSize('text-gray-600')}`}
                />
              </div>
            )}
            {activeSections.location && (
              <div className="flex items-center gap-1 min-w-[120px]">
                <HiOutlineLocationMarker className={getFontSize('w-3.5 h-3.5')} style={{ color: primaryColor }} />
                <EditableField
                  content={content.contact.location}
                  section="contact.location"
                  onEdit={handleContentEdit}
                  placeholder="Dallas, Texas"
                  className={`hover:bg-gray-100 ${getFontSize('text-gray-600')}`}
                />
              </div>
            )}
            {activeSections.url && (
              <div className="flex items-center gap-1 min-w-[120px]">
                <HiOutlineLink className={getFontSize('w-3.5 h-3.5')} style={{ color: primaryColor }} />
                <EditableField
                  content={content.contact.url || ''}
                  section="contact.url"
                  onEdit={handleContentEdit}
                  placeholder="linkedin.com"
                  className={`hover:bg-gray-100 ${getFontSize('text-gray-600')}`}
                />
              </div>
            )}
          </div>
        </div>
        
        {/* Right side - Photo */}
        <div className="ml-8">
          <div className="relative w-44 h-36 rounded-md overflow-hidden border-2 border-gray-200">
            {selectedImage ? (
              <div 
                className="absolute inset-0 cursor-move overflow-hidden"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
              >
                <div className="absolute inset-0" style={{ transform: `translateY(${imagePosition.y}px)` }}>
                  <Image
                    src={selectedImage}
                    alt="Profile"
                    fill
                    className="object-cover min-h-[150%]"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-colors">
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button
                      onClick={() => setSelectedImage(null)}
                      className="p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
                    >
                      <HiX className={getFontSize('w-4 h-4')} />
                    </button>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                      Drag to adjust
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-50">
                <label className="cursor-pointer text-center p-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <HiPlus className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <span className="text-sm text-gray-500 block">Add Photo</span>
                </label>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Main Content - Left Column (70%) */}
        <div className="col-span-8 space-y-6">
          {/* Summary Section */}
          <section>
            <div className="flex justify-between items-center mb-0">
              <h3 className={`${getFontSize('text-[1.3rem]')} font-semibold uppercase tracking-wide`} style={{ color: primaryColor }}>
                <EditableField
                  content="SUMMARY"
                  section="sections.summary"
                  onEdit={handleContentEdit}
                  className="uppercase"
                />
              </h3>
            </div>
            <div className="border-b-[3.5px] mb-2" style={{ borderColor: primaryColor }}></div>
            <div className="mt-2">
              <EditableField
                content={content.summary}
                section="summary"
                onEdit={handleContentEdit}
                isMultiline
                placeholder="Seasoned Product Manager with over 5 years of experience, specialized in SaaS products and obsessed with customer experience. Biggest career achievement includes leading a product feature that increased user retention by 30%."
                className={`text-gray-600 leading-relaxed ${getFontSize('text-gray-600')}`}
              />
            </div>
          </section>

          {/* Experience Section */}
          <section>
            <div className="flex justify-between items-center mb-0">
              <h3 className={`${getFontSize('text-[1.3rem]')} font-semibold uppercase tracking-wide`} style={{ color: primaryColor }}>
                <EditableField
                  content="EXPERIENCE"
                  section="sections.experience"
                  onEdit={handleContentEdit}
                  className="uppercase"
                />
              </h3>
              <button
                onClick={addNewExperience}
                className={`p-1 rounded-full hover:bg-gray-100 transition-colors ${getFontSize('w-6 h-6')}`}
              >
                <HiPlus className={getFontSize('w-6 h-6')} />
              </button>
            </div>
            <div className="border-b-[3.5px] mb-2" style={{ borderColor: primaryColor }}></div>
            <div className="mt-2 space-y-4 pl-6 relative">
              {content.experience.map((exp, index) => (
                <div key={index} className="mb-6 relative group">
                  {/* Timeline dot and line */}
                  <div className="absolute left-[-20px] top-0 bottom-0 flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full mt-[12px]" style={{ backgroundColor: primaryColor }}></div>
                    {index < content.experience.length - 1 && (
                      <div className="w-0.5 flex-grow mt-1" style={{ backgroundColor: primaryColor, opacity: 0.3 }}></div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <EditableField
                          content={exp.title}
                          section={`experience.${index}.title`}
                          onEdit={handleContentEdit}
                          className={`${getFontSize('text-lg')} font-medium text-gray-900 mb-0.5`}
                          placeholder="Job Title"
                        />
                        <EditableField
                          content={exp.company}
                          section={`experience.${index}.company`}
                          onEdit={handleContentEdit}
                          className={`${getFontSize('text-base')} font-bold mb-0.5`}
                          style={{ color: primaryColor }}
                          placeholder="Company Name"
                        />
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <div className="flex items-center gap-1">
                            <HiOutlineCalendar className={getFontSize('w-3.5 h-3.5')} style={{ color: primaryColor }} />
                            <EditableField
                              content={exp.startDate || 'MM/YYYY'}
                              section={`experience.${index}.startDate`}
                              onEdit={handleContentEdit}
                              placeholder="MM/YYYY"
                              className={`hover:bg-gray-100 ${getFontSize('text-gray-500')}`}
                            />
                            <span>-</span>
                            <EditableField
                              content={exp.endDate || 'Present'}
                              section={`experience.${index}.endDate`}
                              onEdit={handleContentEdit}
                              placeholder="Present"
                              className={`hover:bg-gray-100 ${getFontSize('text-gray-500')}`}
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <HiOutlineLocationMarker className={getFontSize('w-3.5 h-3.5')} style={{ color: primaryColor }} />
                            <EditableField
                              content={exp.location || 'City, Country'}
                              section={`experience.${index}.location`}
                              onEdit={handleContentEdit}
                              placeholder="City, Country"
                              className={`hover:bg-gray-100 ${getFontSize('text-gray-500')}`}
                            />
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeExperience(index)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded-full transition-all"
                      >
                        <HiTrash className={getFontSize('w-4 h-4')} />
                      </button>
                    </div>
                    <EditableField
                      content={exp.description}
                      section={`experience.${index}.description`}
                      onEdit={handleContentEdit}
                      isMultiline
                      isBulletList
                      className={`text-gray-600 ${getFontSize('text-gray-600')}`}
                      placeholder="• Describe your responsibilities and achievements..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Education Section */}
          <section>
            <div className="flex justify-between items-center mb-0">
              <h3 className={`${getFontSize('text-[1.3rem]')} font-semibold uppercase tracking-wide`} style={{ color: primaryColor }}>
                <EditableField
                  content="EDUCATION"
                  section="sections.education"
                  onEdit={handleContentEdit}
                  className="uppercase"
                />
              </h3>
              <button
                onClick={addNewEducation}
                className={`p-1 rounded-full hover:bg-gray-100 transition-colors ${getFontSize('w-6 h-6')}`}
              >
                <HiPlus className={getFontSize('w-6 h-6')} />
              </button>
            </div>
            <div className="border-b-[3.5px] mb-2" style={{ borderColor: primaryColor }}></div>
            <div className="mt-2 space-y-4 pl-6 relative">
              {content.education.map((edu, index) => (
                <div key={index} className="mb-6 relative group">
                  {/* Timeline dot and line */}
                  <div className="absolute left-[-20px] top-0 bottom-0 flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full mt-[12px]" style={{ backgroundColor: primaryColor }}></div>
                    {index < content.education.length - 1 && (
                      <div className="w-0.5 flex-grow mt-1" style={{ backgroundColor: primaryColor, opacity: 0.3 }}></div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <EditableField
                          content={edu.degree}
                          section={`education.${index}.degree`}
                          onEdit={handleContentEdit}
                          className={`${getFontSize('text-lg')} font-medium text-gray-900 mb-0.5`}
                          placeholder="Degree Name"
                        />
                        <EditableField
                          content={edu.school}
                          section={`education.${index}.school`}
                          onEdit={handleContentEdit}
                          className={`${getFontSize('text-base')} font-bold mb-0.5`}
                          style={{ color: primaryColor }}
                          placeholder="School Name"
                        />
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <div className="flex items-center gap-1">
                            <HiOutlineCalendar className={getFontSize('w-3.5 h-3.5')} style={{ color: primaryColor }} />
                            <EditableField
                              content={edu.startDate || 'MM/YYYY'}
                              section={`education.${index}.startDate`}
                              onEdit={handleContentEdit}
                              placeholder="MM/YYYY"
                              className={`hover:bg-gray-100 ${getFontSize('text-gray-500')}`}
                            />
                            <span>-</span>
                            <EditableField
                              content={edu.endDate || 'MM/YYYY'}
                              section={`education.${index}.endDate`}
                              onEdit={handleContentEdit}
                              placeholder="MM/YYYY"
                              className={`hover:bg-gray-100 ${getFontSize('text-gray-500')}`}
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <HiOutlineLocationMarker className={getFontSize('w-3.5 h-3.5')} style={{ color: primaryColor }} />
                            <EditableField
                              content={edu.location || 'City, Country'}
                              section={`education.${index}.location`}
                              onEdit={handleContentEdit}
                              placeholder="City, Country"
                              className={`hover:bg-gray-100 ${getFontSize('text-gray-500')}`}
                            />
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setContent(prev => ({
                            ...prev,
                            education: prev.education.filter((_, i) => i !== index)
                          }));
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded-full transition-all"
                      >
                        <HiTrash className={getFontSize('w-4 h-4')} />
                      </button>
                    </div>
                    {edu.details && (
                      <EditableField
                        content={edu.details}
                        section={`education.${index}.details`}
                        onEdit={handleContentEdit}
                        isMultiline
                        className={`text-gray-600 ${getFontSize('text-gray-600')}`}
                        placeholder="Additional details about your education..."
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column (30%) */}
        <div className="col-span-4 space-y-6">
          {/* Projects Section */}
          {activeSections.projects && (
            <section>
              <div className="flex justify-between items-center mb-0">
                <h3 className={`${getFontSize('text-[1.3rem]')} font-semibold uppercase tracking-wide`} style={{ color: primaryColor }}>
                  <EditableField
                    content="PROJECTS"
                    section="sections.projects"
                    onEdit={handleContentEdit}
                    className="uppercase"
                  />
                </h3>
                <button
                  onClick={() => {
                    setContent(prev => ({
                      ...prev,
                      projects: [...(prev.projects || []), { 
                        title: 'New Project', 
                        description: 'Project description',
                        period: 'Duration',
                        link: ''
                      }]
                    }));
                  }}
                  className={`p-1 rounded-full hover:bg-gray-100 transition-colors ${getFontSize('w-6 h-6')}`}
                >
                  <HiPlus className={getFontSize('w-6 h-6')} />
                </button>
              </div>
              <div className="border-b-[3.5px] mb-2" style={{ borderColor: primaryColor }}></div>
              <div className="mt-2 space-y-3">
                {content.projects?.map((project, index) => (
                  <div key={index} className="group relative">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <EditableField
                          content={project.title}
                          section={`projects.${index}.title`}
                          onEdit={handleContentEdit}
                          className={`${getFontSize('text-base')} font-semibold text-gray-900 mb-0.5`}
                          placeholder="Project Title"
                        />
                        <EditableField
                          content={project.description}
                          section={`projects.${index}.description`}
                          onEdit={handleContentEdit}
                          isMultiline
                          className={`${getFontSize('text-sm')} text-gray-600 mt-0.5`}
                          placeholder="Describe your project and its impact"
                        />
                      </div>
                      <button
                        onClick={() => {
                          setContent(prev => ({
                            ...prev,
                            projects: prev.projects?.filter((_, i) => i !== index)
                          }));
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded-full transition-all ml-2"
                      >
                        <HiTrash className={getFontSize('w-4 h-4')} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Skills Section */}
          <section>
            <div className="flex justify-between items-center mb-0">
              <h3 className={`${getFontSize('text-[1.3rem]')} font-semibold uppercase tracking-wide`} style={{ color: primaryColor }}>
                <EditableField
                  content="SKILLS"
                  section="sections.skills"
                  onEdit={handleContentEdit}
                  className="uppercase"
                />
              </h3>
            </div>
            <div className="border-b-[3.5px] mb-2" style={{ borderColor: primaryColor }}></div>
            <div className="mt-2 flex flex-wrap gap-2">
              {content.skills.map((skill, index) => (
                <div
                  key={skill + index}
                  className={`group ${getFontSize('px-3 py-1.5')} bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center gap-2`}
                >
                  <EditableField
                    content={skill}
                    section={`skills.${index}`}
                    onEdit={handleContentEdit}
                    className={`inline-block text-center w-full ${getFontSize('text-gray-600')}`}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const newSkills = [...content.skills];
                      newSkills.splice(index, 1);
                      setContent(prev => ({
                        ...prev,
                        skills: newSkills
                      }));
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded-full transition-all"
                  >
                    <HiTrash className={getFontSize('w-4 h-4')} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  setContent(prev => ({
                    ...prev,
                    skills: [...prev.skills, 'New Skill']
                  }));
                }}
                className={`${getFontSize('px-3 py-1.5')} bg-gray-100 rounded-md text-sm hover:bg-gray-200 transition-colors duration-200`}
              >
                + Add Skill
              </button>
            </div>
          </section>

          {/* Languages Section */}
          {activeSections.languages && (
            <section>
              <div className="flex justify-between items-center mb-0">
                <h3 className={`${getFontSize('text-[1.3rem]')} font-semibold uppercase tracking-wide`} style={{ color: primaryColor }}>
                  <EditableField
                    content="LANGUAGES"
                    section="sections.languages"
                    onEdit={handleContentEdit}
                    className="uppercase"
                  />
                </h3>
              </div>
              <div className="border-b-[3.5px] mb-2" style={{ borderColor: primaryColor }}></div>
              <div className="mt-2 space-y-2">
                {content.languages?.map((lang, index) => (
                  <div key={index} className="flex justify-between items-center group relative">
                    <EditableField
                      content={lang.name}
                      section={`languages.${index}.name`}
                      onEdit={handleContentEdit}
                      className={`${getFontSize('text-base')} font-medium`}
                      placeholder="Language"
                    />
                    <div className="flex items-center gap-4">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((dot) => (
                          <div
                            key={dot}
                            className="w-3 h-3 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
                            style={{
                              backgroundColor: dot <= (Number(lang.proficiency) || 0) ? primaryColor : '#E5E7EB'
                            }}
                            onClick={() => handleContentEdit(`languages.${index}.proficiency`, dot.toString())}
                          />
                        ))}
                      </div>
                      <button
                        onClick={() => {
                          setContent(prev => ({
                            ...prev,
                            languages: prev.languages?.filter((_, i) => i !== index)
                          }));
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded-full transition-all"
                      >
                        <HiTrash className={getFontSize('w-4 h-4')} />
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => {
                    setContent(prev => ({
                      ...prev,
                      languages: [...(prev.languages || []), { name: 'New Language', proficiency: '0' }]
                    }));
                  }}
                  className={`${getFontSize('text-sm')} text-gray-600 hover:text-gray-800 flex items-center gap-1`}
                >
                  <HiPlus className={getFontSize('w-4 h-4')} /> Add Language
                </button>
              </div>
            </section>
          )}

          {/* Certifications Section */}
          {activeSections.certifications && (
            <section>
              <div className="flex justify-between items-center mb-0">
                <h3 className={`${getFontSize('text-[1.3rem]')} font-semibold uppercase tracking-wide`} style={{ color: primaryColor }}>
                  <EditableField
                    content="CERTIFICATIONS"
                    section="sections.certifications"
                    onEdit={handleContentEdit}
                    className="uppercase"
                  />
                </h3>
                <button
                  onClick={() => {
                    setContent(prev => ({
                      ...prev,
                      certifications: [...(prev.certifications || []), { 
                        name: 'New Certification',
                        issuer: 'Issuing Organization'
                      }]
                    }));
                  }}
                  className={`p-1 rounded-full hover:bg-gray-100 transition-colors ${getFontSize('w-6 h-6')}`}
                >
                  <HiPlus className={getFontSize('w-6 h-6')} />
                </button>
              </div>
              <div className="border-b-[3.5px] mb-2" style={{ borderColor: primaryColor }}></div>
              <div className="mt-2 space-y-3">
                {content.certifications?.map((cert, index) => (
                  <div key={index} className="group relative">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <EditableField
                          content={cert.name}
                          section={`certifications.${index}.name`}
                          onEdit={handleContentEdit}
                          className={`${getFontSize('text-base')} font-semibold text-gray-900 mb-0.5`}
                          placeholder="Certification Name"
                        />
                        <EditableField
                          content={cert.issuer}
                          section={`certifications.${index}.issuer`}
                          onEdit={handleContentEdit}
                          className={`${getFontSize('text-sm')} text-gray-600 mt-0.5`}
                          placeholder="Issuing Organization"
                        />
                      </div>
                      <button
                        onClick={() => {
                          setContent(prev => ({
                            ...prev,
                            certifications: prev.certifications?.filter((_, i) => i !== index)
                          }));
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded-full transition-all ml-2"
                      >
                        <HiTrash className={getFontSize('w-4 h-4')} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default Editor; 