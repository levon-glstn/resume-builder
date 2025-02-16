'use client';

import { useState } from 'react';
import Editor from '@/components/editor/Editor';
import StyleToolbar from '@/components/editor/StyleToolbar';
import type { ResumeContent } from '@/types/resume';

// Default content for the resume
const defaultContent: ResumeContent = {
  name: 'Your Name',
  title: 'Professional Title',
  contact: {
    email: 'email@example.com',
    phone: '(555) 123-4567',
    location: 'City, State'
  },
  summary: 'Click to add a professional summary that highlights your key achievements and career objectives.',
  experience: [
    {
      title: 'Job Title',
      company: 'Company Name',
      location: 'City, State',
      startDate: 'MM/YYYY',
      endDate: 'Present',
      description: '• Click to describe your role, responsibilities, and key achievements.'
    }
  ],
  education: [
    {
      degree: 'Degree Name',
      school: 'School Name',
      location: 'City, State',
      startDate: 'MM/YYYY',
      endDate: 'MM/YYYY',
      details: 'Additional details about your education'
    }
  ],
  skills: ['Skill 1', 'Skill 2', 'Skill 3'],
  projects: [{ 
    title: 'Project Name', 
    description: 'Project Description', 
    period: 'Duration' 
  }],
  languages: [{ 
    name: 'Language', 
    proficiency: 'Proficiency Level' 
  }]
};

export default function EditorPage() {
  const [content, setContent] = useState<ResumeContent>(defaultContent);
  const [selectedFont, setSelectedFont] = useState('Rubik');
  const [selectedFontSize, setSelectedFontSize] = useState('medium');
  const [primaryColor, setPrimaryColor] = useState('#4338ca');
  const [activeSections, setActiveSections] = useState<Record<string, boolean>>({
    phone: true,
    email: true,
    location: true,
    url: true,
    projects: true,
    languages: true,
    certifications: true
  });

  const handleFontChange = async (font: string) => {
    setSelectedFont(font);
  };

  const handleFontSizeChange = (size: string) => {
    setSelectedFontSize(size);
  };

  const handleSectionToggle = (sectionId: string, isActive: boolean) => {
    setActiveSections(prev => ({ ...prev, [sectionId]: isActive }));
  };

  return (
    <main className="min-h-screen" style={{ 
      background: `linear-gradient(135deg, ${primaryColor}25, ${primaryColor}35)` 
    }}>
      <StyleToolbar
        selectedFont={selectedFont}
        selectedFontSize={selectedFontSize}
        primaryColor={primaryColor}
        activeSections={activeSections}
        content={content}
        onFontChange={handleFontChange}
        onFontSizeChange={handleFontSizeChange}
        onColorChange={(color) => setPrimaryColor(color)}
        onSectionToggle={handleSectionToggle}
      />
      <div className="p-8">
        <div className="max-w-[1100px] mx-auto bg-white rounded-lg shadow-xl">
          <Editor 
            content={content} 
            setContent={setContent}
            selectedFont={selectedFont}
            selectedFontSize={selectedFontSize}
            primaryColor={primaryColor}
            activeSections={activeSections}
          />
        </div>
      </div>
    </main>
  );
} 