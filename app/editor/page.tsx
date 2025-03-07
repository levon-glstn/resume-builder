'use client';

import { useState, useRef, useEffect } from 'react';
import Editor from '../../components/editor/Editor';
import Sidebar from '../../components/editor/Sidebar';
import ZoomableEditor from '../../components/editor/ZoomableEditor';
import type { ResumeContent } from '../../types/resume';
import { Poppins, Rubik, Roboto, Open_Sans } from 'next/font/google';
import ContentWarning from '../../components/editor/ContentWarning';

// Storage keys
const STORAGE_KEYS = {
  RESUME_CONTENT: 'resumeContent',
  ACTIVE_SECTIONS: 'activeSections',
  PRIMARY_COLOR: 'primaryColor',
  FONT_FAMILY: 'fontFamily',
  FONT_SIZE: 'fontSize'
} as const;

// Default content for the resume
const defaultContent: ResumeContent = {
  name: 'Jonathan Smith',
  title: 'Senior Web Developer',
  contact: {
    email: 'jonathansmith@gmail.com',
    phone: '(555) 123-4567',
    location: 'City, Country',
    linkedin: 'linkedin.com/in/jonathan-smith'
  },
  summary: 'Experienced web developer with a strong background in full-stack development and a passion for creating efficient, scalable applications. Proven track record of delivering high-quality solutions and leading development teams.',
  experience: [
    {
      title: 'Senior Web Developer',
      company: 'TechCorp Inc.',
      location: 'City, Country',
      startDate: 'MM/YY',
      endDate: 'Present',
      description: '• Responsibilities and achievements. Use keywords from job description.\n• Responsibilities and achievements. Use keywords from job description.'
    }
  ],
  education: [
    {
      degree: 'BSc Computer Science',
      school: 'University of California',
      location: 'City, Country',
      startDate: 'MM/YY',
      endDate: 'MM/YY',
      details: 'Major in Software Engineering, Minor in AI'
    }
  ],
  skills: ['React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker'],
  projects: [
    {
      title: 'E-commerce Platform',
      description: 'Built a scalable e-commerce platform using React and Node.js',
      period: 'MM/YY'
    }
  ],
  languages: [
    { name: 'English', proficiency: 'Native' },
    { name: 'Spanish', proficiency: 'Fluent' },
    { name: 'French', proficiency: 'Intermediate' }
  ]
};

export default function EditorPage() {
  const [content, setContent] = useState<ResumeContent>(defaultContent);
  const [primaryColor, setPrimaryColor] = useState('#7c3aed');
  const [fontFamily, setFontFamily] = useState('Poppins');
  const [fontSize, setFontSize] = useState('medium');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeSections, setActiveSections] = useState<Record<string, boolean>>({
    experience: true,
    education: true,
    projects: false,
    skills: true,
    languages: true,
    'contact.photo': true,
    'contact.email': true,
    'contact.phone': true,
    'contact.location': true,
    'contact.linkedin': false,
    'contact.url': false,
  });

  const resumeRef = useRef<HTMLElement>(null);

  // Check if we're on a mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Generate gradient background colors based on the primary color
  const getGradientBackground = (color: string) => {
    // Convert hex to RGB
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 0, g: 0, b: 0 };
    };

    const rgb = hexToRgb(color);
    
    // Create a more dynamic gradient with multiple components for depth
    return {
      background: `
        radial-gradient(circle at 30% 20%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.12) 0%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.03) 50%),
        linear-gradient(135deg, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08) 0%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.18) 100%),
        repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.05) 0px, rgba(255, 255, 255, 0.05) 2px, transparent 2px, transparent 4px)
      `,
      backgroundAttachment: 'fixed'
    };
  };

  // Load saved data after component mounts
  useEffect(() => {
    const savedContent = localStorage.getItem(STORAGE_KEYS.RESUME_CONTENT);
    const savedColor = localStorage.getItem(STORAGE_KEYS.PRIMARY_COLOR);
    const savedSections = localStorage.getItem(STORAGE_KEYS.ACTIVE_SECTIONS);
    const savedFont = localStorage.getItem(STORAGE_KEYS.FONT_FAMILY);
    const savedFontSize = localStorage.getItem(STORAGE_KEYS.FONT_SIZE);

    if (savedContent) {
      setContent(JSON.parse(savedContent));
    }
    if (savedColor) {
      setPrimaryColor(savedColor);
    }
    if (savedSections) {
      setActiveSections(JSON.parse(savedSections));
    }
    if (savedFont) {
      setFontFamily(savedFont);
    }
    if (savedFontSize) {
      setFontSize(savedFontSize);
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      localStorage.setItem(STORAGE_KEYS.RESUME_CONTENT, JSON.stringify(content));
    }, 500);
    return () => clearTimeout(saveTimeout);
  }, [content]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_SECTIONS, JSON.stringify(activeSections));
  }, [activeSections]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRIMARY_COLOR, primaryColor);
  }, [primaryColor]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FONT_FAMILY, fontFamily);
  }, [fontFamily]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FONT_SIZE, fontSize);
  }, [fontSize]);

  const handleSectionToggle = (sectionId: string, isActive: boolean) => {
    setActiveSections(prev => ({
      ...prev,
      [sectionId]: isActive
    }));
  };

  const handleSidebarCollapsedChange = (isCollapsed: boolean) => {
    setIsSidebarCollapsed(isCollapsed);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar
        primaryColor={primaryColor}
        activeSections={activeSections}
        onColorChange={setPrimaryColor}
        onSectionToggle={handleSectionToggle}
        defaultContent={defaultContent}
        resumeRef={resumeRef}
        fontFamily={fontFamily}
        onFontChange={setFontFamily}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        onCollapsedChange={handleSidebarCollapsedChange}
      />
      <main 
        className={`flex-1 overflow-auto py-8 animate-gradient ${isMobile ? 'touch-auto pb-20' : ''}`}
        style={{
          ...getGradientBackground(primaryColor),
          minHeight: '100vh',
          position: 'relative',
          marginLeft: isSidebarCollapsed ? '0' : '0',
          paddingLeft: isSidebarCollapsed ? '1rem' : '1rem'
        }}
      >
        <ZoomableEditor className="mx-auto">
          <div 
            style={{ 
              maxWidth: 'calc(210mm + 2rem)',
              transform: isSidebarCollapsed ? 'scale(1.02)' : 'scale(1)',
              transformOrigin: 'center top',
              opacity: 1,
              filter: `brightness(${isSidebarCollapsed ? 1.02 : 1})`,
              boxShadow: isSidebarCollapsed 
                ? '0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.12)' 
                : '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
            }}
          >
            <Editor
              ref={resumeRef}
              content={content}
              onContentChange={setContent}
              activeSections={activeSections}
              primaryColor={primaryColor}
              fontFamily={fontFamily}
              fontSize={fontSize}
            />
          </div>
        </ZoomableEditor>
        <ContentWarning resumeElement={resumeRef.current} />
      </main>
    </div>
  );
} 