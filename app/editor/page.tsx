'use client';

import { useState, useRef, useEffect } from 'react';
import Editor from '../../components/editor/Editor';
import Sidebar from '../../components/editor/Sidebar';
import type { ResumeContent } from '../../types/resume';
import { Poppins, Rubik, Roboto, Open_Sans } from 'next/font/google';

// Storage keys
const STORAGE_KEYS = {
  RESUME_CONTENT: 'resumeContent',
  ACTIVE_SECTIONS: 'activeSections',
  PRIMARY_COLOR: 'primaryColor',
  FONT_FAMILY: 'fontFamily'
} as const;

// Default content for the resume
const defaultContent: ResumeContent = {
  name: 'Jonathan Smith',
  title: 'Senior Web Developer',
  contact: {
    email: 'jonathansmith@gmail.com',
    phone: '(555) 123-4567',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/jonathan-smith'
  },
  summary: 'Experienced web developer with a strong background in full-stack development and a passion for creating efficient, scalable applications. Proven track record of delivering high-quality solutions and leading development teams.',
  experience: [
    {
      title: 'Senior Web Developer',
      company: 'TechCorp Inc.',
      location: 'San Francisco, CA',
      startDate: '2021',
      endDate: 'Present',
      description: '• Responsibilities and achievements.\n• Responsibilities and achievements.'
    }
  ],
  education: [
    {
      degree: 'BSc Computer Science',
      school: 'University of California',
      location: 'Berkeley, CA',
      startDate: '2016',
      endDate: '2020',
      details: 'Major in Software Engineering, Minor in AI'
    }
  ],
  skills: ['React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker'],
  projects: [
    {
      title: 'E-commerce Platform',
      description: 'Built a scalable e-commerce platform using React and Node.js',
      period: '2022'
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
  const [primaryColor, setPrimaryColor] = useState('#4338ca');
  const [fontFamily, setFontFamily] = useState('Poppins');
  const [activeSections, setActiveSections] = useState<Record<string, boolean>>({
    experience: true,
    education: true,
    projects: true,
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

  // Load saved data after component mounts
  useEffect(() => {
    const savedContent = localStorage.getItem(STORAGE_KEYS.RESUME_CONTENT);
    const savedColor = localStorage.getItem(STORAGE_KEYS.PRIMARY_COLOR);
    const savedSections = localStorage.getItem(STORAGE_KEYS.ACTIVE_SECTIONS);
    const savedFont = localStorage.getItem(STORAGE_KEYS.FONT_FAMILY);

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

  const handleNewResume = () => {
    if (window.confirm('Are you sure you want to start a new resume? This will clear all current data.')) {
      setContent(defaultContent);
      setActiveSections({
        experience: true,
        education: true,
        projects: true,
        skills: true,
        languages: true,
        'contact.photo': true,
        'contact.email': true,
        'contact.phone': true,
        'contact.location': true,
        'contact.linkedin': false,
        'contact.url': false,
      });
      setPrimaryColor('#4338ca');
      setFontFamily('Poppins');
    }
  };

  const handleSectionToggle = (sectionId: string, isActive: boolean) => {
    setActiveSections(prev => ({
      ...prev,
      [sectionId]: isActive
    }));
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        primaryColor={primaryColor}
        activeSections={activeSections}
        onColorChange={setPrimaryColor}
        onSectionToggle={handleSectionToggle}
        onNewResume={handleNewResume}
        defaultContent={defaultContent}
        resumeRef={resumeRef}
        fontFamily={fontFamily}
        onFontChange={setFontFamily}
      />
      <main className="flex-1 overflow-auto py-8">
        <div className="mx-auto" style={{ maxWidth: 'calc(210mm + 2rem)' }}>
          <Editor
            ref={resumeRef}
            content={content}
            onContentChange={setContent}
            activeSections={activeSections}
            primaryColor={primaryColor}
            fontFamily={fontFamily}
          />
        </div>
      </main>
    </div>
  );
} 