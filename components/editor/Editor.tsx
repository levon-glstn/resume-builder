'use client';
/** @jsxImportSource react */

import React, { useState, useCallback, useRef, useEffect, forwardRef } from 'react';
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
  HiTrash,
  HiOutlineX
} from 'react-icons/hi';
import Image from 'next/image';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import EditableField from './EditableField';
import { FaLinkedin } from 'react-icons/fa';
import { HiOutlineGlobeAlt } from 'react-icons/hi';

interface EditorProps {
  content: ResumeContent;
  onContentChange: (content: ResumeContent) => void;
  activeSections: Record<string, boolean>;
  primaryColor: string;
}

interface SectionData {
  id: string;
  title: string;
  type: keyof ResumeContent;
  items: any[];
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

interface EditableTextProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  style?: React.CSSProperties;
}

const EditableText: React.FC<EditableTextProps> = ({
  value,
  onChange,
  className = '',
  placeholder = 'Click to edit',
  style = {}
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    onChange(tempValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (placeholder.includes('Responsibilities and achievements')) {
        // For experience description, add a new bullet point
        setTempValue(prev => {
          const lines = prev.split('\n');
          const lastLine = lines[lines.length - 1];
          if (lastLine.trim() === '•' || lastLine.trim() === '') {
            // Don't add a new bullet if the last line is empty or just a bullet
            return prev;
          }
          return prev + '\n• ';
        });
        return;
      }
      handleBlur();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let newValue = e.target.value;
    if (placeholder.includes('Responsibilities and achievements')) {
      // Only add bullet points for new lines, but allow deletion
      const lines = newValue.split('\n');
      newValue = lines.map((line, index) => {
        line = line.trim();
        // If it's a new empty line (user just pressed Enter), add a bullet point
        if (line === '' && index < lines.length - 1) return '• ';
        // If line doesn't start with bullet point and it's not empty, add one
        if (!line.startsWith('•') && line !== '') return '• ' + line;
        // Otherwise keep the line as is (allows deletion)
        return line;
      }).join('\n');
    }
    setTempValue(newValue);
  };

  if (isEditing) {
    return (
      <textarea
        ref={inputRef}
        value={tempValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`w-full bg-gray-50 p-2 rounded-md outline-none ${className}`}
        placeholder={placeholder}
        rows={placeholder.includes('Responsibilities and achievements') ? 4 : 1}
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={`cursor-text hover:bg-gray-100 rounded px-2 py-1 -mx-2 transition-colors ${className}`}
      style={style}
    >
      {value || <span className="text-gray-400">{placeholder}</span>}
    </div>
  );
};

interface TagProps {
  tag: string;
  onRemove: () => void;
  onEdit: (newValue: string) => void;
  color: string;
  className?: string;
}

const Tag: React.FC<TagProps> = ({ tag, onRemove, onEdit, color, className }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(tag);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (tempValue.trim() !== tag) {
      onEdit(tempValue.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="px-3 py-1 rounded-md text-sm font-medium bg-gray-50 outline-none border border-gray-300"
      />
    );
  }

  return (
    <div 
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-sm font-medium text-white ${className}`}
      style={{ backgroundColor: color }}
    >
      <span onClick={() => setIsEditing(true)} className="cursor-text">
        {tag}
      </span>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }} 
        className="hover:text-red-100 transition-colors"
      >
        <HiX className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

const SectionHeader: React.FC<{ 
  title: string; 
  color: string; 
  onAdd?: () => void;
  onTitleChange?: (value: string) => void;
}> = ({ title, color, onAdd, onTitleChange }) => (
  <div className="flex items-center justify-between border-b-[3px] pb-0.5 mb-0" style={{ borderColor: color }}>
    {onTitleChange ? (
      <EditableText
        value={title.toUpperCase()}
        onChange={(value) => onTitleChange(value.toUpperCase())}
        className="text-lg font-semibold"
        style={{ color: color }}
      />
    ) : (
      <h2 className="text-lg font-semibold" style={{ color: color }}>
        {title.toUpperCase()}
      </h2>
    )}
    {onAdd && (
      <button
        onClick={onAdd}
        className="p-1 hover:bg-gray-100 rounded-md transition-colors"
        style={{ color }}
      >
        <HiPlus className="w-5 h-5" />
      </button>
    )}
  </div>
);

const Editor = forwardRef<HTMLElement, EditorProps>(({
  content,
  onContentChange,
  activeSections,
  primaryColor
}, ref) => {
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
  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const updateContent = (path: string, value: any) => {
    const newContent = { ...content };
    const keys = path.split('.');
    let current: any = newContent;
    
    // Initialize sections object if it doesn't exist
    if (path.startsWith('sections') && !newContent.sections) {
      newContent.sections = {};
    }
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    
    onContentChange(newContent);
  };

  const addSkill = (skill: string) => {
    const trimmedSkill = skill.trim();
    if (trimmedSkill && !content.skills.includes(trimmedSkill)) {
      onContentChange({
        ...content,
        skills: [...content.skills, trimmedSkill]
      });
    }
  };

  const removeSkill = (skill: string) => {
    onContentChange({
      ...content,
      skills: content.skills.filter(s => s !== skill)
    });
  };

  const sections: SectionData[] = [
    { id: 'experience', title: 'EXPERIENCE', type: 'experience' as const, items: content.experience },
    { id: 'education', title: 'EDUCATION', type: 'education' as const, items: content.education },
    { id: 'skills', title: 'SKILLS', type: 'skills' as const, items: content.skills },
    ...(content.projects && activeSections.projects ? [{ id: 'projects', title: 'PROJECTS', type: 'projects' as const, items: content.projects }] : []),
    ...(content.languages && activeSections.languages ? [{ id: 'languages', title: 'LANGUAGES', type: 'languages' as const, items: content.languages }] : []),
    ...(content.certifications && activeSections.certifications ? [{ id: 'certifications', title: 'CERTIFICATIONS', type: 'certifications' as const, items: content.certifications }] : [])
  ];

  const addNewExperience = () => {
    onContentChange({
      ...content,
      experience: [
        ...content.experience,
        {
          title: 'New Position',
          company: 'Company Name',
          location: 'City, Country',
          startDate: 'MM/YYYY',
          endDate: 'Present',
          description: '• Responsibilities and achievements. Use keywords from job description.'
        }
      ]
    });
  };

  const addNewEducation = () => {
    onContentChange({
      ...content,
      education: [
        ...content.education,
        {
          degree: 'Degree Name',
          school: 'Institution Name',
          location: 'City, Country',
          startDate: 'MM/YYYY',
          endDate: 'MM/YYYY',
          details: 'Additional details about your education'
        }
      ]
    });
  };

  const removeExperience = (index: number) => {
    onContentChange({
      ...content,
      experience: content.experience.filter((_, i) => i !== index)
    });
  };

  const addNewProject = () => {
    onContentChange({
      ...content,
      projects: [
        ...(content.projects || []),
        {
          title: 'New Project',
          description: 'Describe your project...',
          period: 'YYYY'
        }
      ]
    });
  };

  const removeProject = (index: number) => {
    onContentChange({
      ...content,
      projects: content.projects?.filter((_, i) => i !== index)
    });
  };

  const addNewLanguage = () => {
    onContentChange({
      ...content,
      languages: [
        ...(content.languages || []),
        {
          name: 'Language Name',
          proficiency: 'Proficiency Level'
        }
      ]
    });
  };

  const removeLanguage = (index: number) => {
    onContentChange({
      ...content,
      languages: content.languages?.filter((_, i) => i !== index)
    });
  };

  const removeEducation = (index: number) => {
    onContentChange({
      ...content,
      education: content.education.filter((_, i) => i !== index)
    });
  };

  // Update the contact section to use type checking
  const allowedContactFields = ['email', 'phone', 'location', 'linkedin', 'url'] as const;
  type ContactField = typeof allowedContactFields[number];

  return (
    <article 
      ref={ref} 
      className="bg-white shadow-lg rounded-lg"
      style={{
        width: '225mm',
        minHeight: '315mm',
        padding: '15mm',
        margin: '0 auto',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-start gap-8 mb-8">
        <div className="flex-1 text-left space-y-2">
          <EditableText
            value={content.name}
            onChange={(value) => updateContent('name', value)}
            className="text-4xl font-bold name"
            placeholder="Your Name"
          />
          <EditableText
            value={content.title}
            onChange={(value) => updateContent('title', value)}
            className="text-xl font-medium title"
            style={{ color: '#7d7d7d' }}
            placeholder="Professional Title"
          />
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-600 mt-2 contact">
            {allowedContactFields.map((key) => {
              if (!activeSections[`contact.${key}`]) return null;
              const value = content.contact[key];
              return (
                <div key={key} className={`flex items-center gap-2 group relative ${key}`}>
                  <div className="w-4 flex-shrink-0 flex justify-center">
                    {key === 'email' && <HiOutlineMail className="w-4 h-4" style={{ color: primaryColor }} />}
                    {key === 'phone' && <HiOutlinePhone className="w-4 h-4" style={{ color: primaryColor }} />}
                    {key === 'location' && <HiOutlineLocationMarker className="w-4 h-4" style={{ color: primaryColor }} />}
                    {key === 'linkedin' && <FaLinkedin className="w-4 h-4" style={{ color: primaryColor }} />}
                    {key === 'url' && <HiOutlineGlobeAlt className="w-4 h-4" style={{ color: primaryColor }} />}
                  </div>
                  <EditableText
                    value={value || ''}
                    onChange={(newValue) => updateContent(`contact.${key}`, newValue)}
                    placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                    className="flex-1"
                  />
                </div>
              );
            })}
          </div>
        </div>
        {activeSections['contact.photo'] && selectedImage && (
          <div className="flex-shrink-0 w-32 h-32">
            <div className="w-full h-full bg-gray-100 rounded-lg overflow-hidden">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="photo-upload"
              />
              <label htmlFor="photo-upload" className="cursor-pointer w-full h-full flex items-center justify-center">
                {selectedImage ? (
                  <div className="relative w-full h-full">
                    <img
                      src={selectedImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedImage(null);
                      }}
                      className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                    >
                      <HiX className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                ) : (
                  <div className="text-gray-400 text-center">
                    <HiPlus className="w-8 h-8 mx-auto mb-1" />
                    <span className="text-sm">Add Photo</span>
                  </div>
                )}
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Summary */}
      {activeSections.summary && (
        <div className="space-y-1 mb-4">
          <SectionHeader 
            title={content.sections?.summary || "Summary"}
            color={primaryColor}
            onTitleChange={(value) => updateContent('sections.summary', value)}
          />
          <EditableText
            value={content.summary}
            onChange={(value) => updateContent('summary', value)}
            className="text-gray-700"
            placeholder="Write a brief summary of your professional background and goals..."
          />
        </div>
      )}

      {/* Experience */}
      {activeSections.experience && (
        <div className="space-y-1 mb-4">
          <SectionHeader 
            title={content.sections?.experience || "Experience"}
            color={primaryColor}
            onAdd={addNewExperience}
            onTitleChange={(value) => updateContent('sections.experience', value)}
          />
          {content.experience.map((exp, index) => (
            <div key={index} className="space-y-1 relative group experience-item mt-2">
              <button
                onClick={() => removeExperience(index)}
                className="absolute -right-2 -top-2 p-1 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
              >
                <HiTrash className="w-4 h-4" />
              </button>
              <div className="grid grid-cols-[1fr,auto] gap-4 items-start">
                <div>
                  <EditableText
                    value={exp.title}
                    onChange={(value) => updateContent(`experience.${index}.title`, value)}
                    className="font-semibold title"
                    placeholder="Job Title"
                  />
                  <EditableText
                    value={exp.company}
                    onChange={(value) => updateContent(`experience.${index}.company`, value)}
                    className="text-gray-600 company"
                    placeholder="Company Name"
                  />
                </div>
                <div className="text-right text-sm text-gray-600 flex flex-col items-end">
                  <div className="flex items-center gap-2">
                    <EditableText
                      value={exp.startDate || ''}
                      onChange={(value) => updateContent(`experience.${index}.startDate`, value)}
                      className="start-date"
                      placeholder="Start Date"
                    />
                    -
                    <EditableText
                      value={exp.endDate || ''}
                      onChange={(value) => updateContent(`experience.${index}.endDate`, value)}
                      className="end-date"
                      placeholder="End Date"
                    />
                  </div>
                  <EditableText
                    value={exp.location}
                    onChange={(value) => updateContent(`experience.${index}.location`, value)}
                    className="text-gray-600 location"
                    placeholder="Location"
                  />
                </div>
              </div>
              <EditableText
                value={exp.description}
                onChange={(value) => updateContent(`experience.${index}.description`, value)}
                className="text-gray-700 whitespace-pre-wrap description"
                placeholder="• Responsibilities and achievements. Use keywords from job description."
              />
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {activeSections.education && (
        <div className="space-y-1 mb-4">
          <SectionHeader 
            title={content.sections?.education || "Education"}
            color={primaryColor}
            onAdd={addNewEducation}
            onTitleChange={(value) => updateContent('sections.education', value)}
          />
          {content.education.map((edu, index) => (
            <div key={index} className="space-y-1 relative group education-item mt-2">
              <button
                onClick={() => removeEducation(index)}
                className="absolute -right-2 -top-2 p-1 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
              >
                <HiTrash className="w-4 h-4" />
              </button>
              <div className="grid grid-cols-[1fr,auto] gap-4 items-start">
                <div>
                  <EditableText
                    value={edu.degree}
                    onChange={(value) => updateContent(`education.${index}.degree`, value)}
                    className="font-semibold degree"
                    placeholder="Degree"
                  />
                  <EditableText
                    value={edu.school}
                    onChange={(value) => updateContent(`education.${index}.school`, value)}
                    className="text-gray-600 school"
                    placeholder="School"
                  />
                </div>
                <div className="text-right text-sm text-gray-600 flex flex-col items-end">
                  <div className="flex items-center gap-2">
                    <EditableText
                      value={edu.startDate || ''}
                      onChange={(value) => updateContent(`education.${index}.startDate`, value)}
                      className="start-date"
                      placeholder="Start Date"
                    />
                    -
                    <EditableText
                      value={edu.endDate || ''}
                      onChange={(value) => updateContent(`education.${index}.endDate`, value)}
                      className="end-date"
                      placeholder="End Date"
                    />
                  </div>
                  <EditableText
                    value={edu.location}
                    onChange={(value) => updateContent(`education.${index}.location`, value)}
                    className="text-gray-600 location"
                    placeholder="Location"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {activeSections.skills && (
        <div className="space-y-2 mb-4">
          <SectionHeader 
            title={content.sections?.skills || "Skills"}
            color={primaryColor}
            onAdd={() => addSkill('New Skill')}
            onTitleChange={(value) => updateContent('sections.skills', value)}
          />
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {content.skills.map((skill) => (
              <Tag
                key={skill}
                tag={skill}
                onRemove={() => removeSkill(skill)}
                onEdit={(newValue) => {
                  removeSkill(skill);
                  addSkill(newValue);
                }}
                color={primaryColor}
                className="skill-tag"
              />
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {activeSections.projects && (
        <div className="space-y-1 mb-4">
          <SectionHeader 
            title={content.sections?.projects || "Projects"}
            color={primaryColor}
            onAdd={addNewProject}
            onTitleChange={(value) => updateContent('sections.projects', value)}
          />
          {content.projects?.map((project, index) => (
            <div key={index} className="space-y-1 relative group mt-2">
              <button
                onClick={() => removeProject(index)}
                className="absolute -right-2 -top-2 p-1 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
              >
                <HiTrash className="w-4 h-4" />
              </button>
              <div className="grid grid-cols-[1fr,auto] gap-4 items-start">
                <div>
                  <EditableText
                    value={project.title}
                    onChange={(value) => updateContent(`projects.${index}.title`, value)}
                    className="font-semibold"
                    placeholder="Project Title"
                  />
                  <EditableText
                    value={project.description}
                    onChange={(value) => updateContent(`projects.${index}.description`, value)}
                    className="text-gray-600"
                    placeholder="Description"
                  />
                </div>
                <div className="text-right text-sm text-gray-600 flex flex-col items-end">
                  <div className="flex items-center gap-2">
                    <EditableText
                      value={project.period}
                      onChange={(value) => updateContent(`projects.${index}.period`, value)}
                      placeholder="Period"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Languages */}
      {activeSections.languages && (
        <div className="space-y-1 mb-4">
          <SectionHeader 
            title={content.sections?.languages || "Languages"}
            color={primaryColor}
            onAdd={addNewLanguage}
            onTitleChange={(value) => updateContent('sections.languages', value)}
          />
          <div className="space-y-1 mt-2">
            {content.languages?.map((lang, index) => (
              <div key={index} className="space-y-1 relative group">
                <button
                  onClick={() => removeLanguage(index)}
                  className="absolute -right-2 -top-2 p-1 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
                >
                  <HiTrash className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-[1fr,auto] gap-4 items-start">
                  <div>
                    <EditableText
                      value={lang.name}
                      onChange={(value) => updateContent(`languages.${index}.name`, value)}
                      className="font-semibold"
                      placeholder="Language"
                    />
                  </div>
                  <div className="text-right text-sm text-gray-600 flex flex-col items-end">
                    <div className="flex items-center gap-2">
                      <EditableText
                        value={lang.proficiency}
                        onChange={(value) => updateContent(`languages.${index}.proficiency`, value)}
                        placeholder="Proficiency"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {activeSections.certifications && (
        <div className="space-y-1 mb-4">
          <SectionHeader 
            title={content.sections?.certifications || "Certifications"}
            color={primaryColor}
            onAdd={() => updateContent('certifications', [...(content.certifications || []), { name: 'New Certification', date: 'MM/YYYY' }])}
            onTitleChange={(value) => updateContent('sections.certifications', value)}
          />
          {(content.certifications || []).map((cert, index) => (
            <div key={index} className="space-y-1 relative group mt-2">
              <button
                onClick={() => {
                  const updatedCerts = [...(content.certifications || [])];
                  updatedCerts.splice(index, 1);
                  updateContent('certifications', updatedCerts);
                }}
                className="absolute -right-2 -top-2 p-1 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
              >
                <HiTrash className="w-4 h-4" />
              </button>
              <div className="grid grid-cols-[1fr,auto] gap-4 items-start">
                <div>
                  <EditableText
                    value={cert.name || ''}
                    onChange={(value) => updateContent(`certifications.${index}.name`, value)}
                    className="font-semibold"
                    placeholder="Certification Name"
                  />
                </div>
                <div className="text-right text-sm text-gray-600 flex flex-col items-end">
                  <div className="flex items-center gap-2">
                    <EditableText
                      value={cert.date || ''}
                      onChange={(value) => updateContent(`certifications.${index}.date`, value)}
                      placeholder="Date"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  );
});

Editor.displayName = 'Editor';

export default Editor;