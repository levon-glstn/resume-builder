'use client';

import { Fragment, useState, useCallback, useMemo, createElement } from 'react';
import { Menu, Transition, Switch } from '@headlessui/react';
import { 
  HiChevronDown, 
  HiPlus, 
  HiMinus,
  HiOutlineDocumentText,
  HiOutlineColorSwatch,
  HiOutlineTemplate,
  HiDownload
} from 'react-icons/hi';
import Image from 'next/image';
import type { ResumeContent } from '@/types/resume';
import React from 'react';

// Move these outside component to prevent recreation
const fontSizes = [
  { name: 'Small', value: 'small', displayText: 'Small', icon: '🔽' },
  { name: 'Medium', value: 'medium', displayText: 'Medium', icon: '➡️' },
  { name: 'Large', value: 'large', displayText: 'Large', icon: '🔼' }
];

const colors = [
  { name: 'Royal Purple', value: '#4338ca', bgGradient: 'bg-gradient-to-br from-[#4338ca]/5 to-[#4338ca]/10' },
  { name: 'Navy Blue', value: '#1e40af', bgGradient: 'bg-gradient-to-br from-[#1e40af]/5 to-[#1e40af]/10' },
  { name: 'Forest Green', value: '#166534', bgGradient: 'bg-gradient-to-br from-[#166534]/5 to-[#166534]/10' },
  { name: 'Dark Red', value: '#991b1b', bgGradient: 'bg-gradient-to-br from-[#991b1b]/5 to-[#991b1b]/10' },
  { name: 'Classic Black', value: '#111827', bgGradient: 'bg-gradient-to-br from-[#111827]/5 to-[#111827]/10' }
];

const sections = [
  { name: 'Phone', id: 'phone', icon: '📱' },
  { name: 'Email', id: 'email', icon: '📧' },
  { name: 'Location', id: 'location', icon: '📍' },
  { name: 'Website', id: 'url', icon: '🔗' },
  { name: 'Projects', id: 'projects', icon: '🚀' },
  { name: 'Languages', id: 'languages', icon: '🌐' },
  { name: 'Certifications', id: 'certifications', icon: '📜' }
];

interface StyleToolbarProps {
  selectedFont: string;
  selectedFontSize: string;
  primaryColor: string;
  activeSections: Record<string, boolean>;
  content: ResumeContent;
  onFontChange: (font: string) => Promise<void>;
  onFontSizeChange: (size: string) => void;
  onColorChange: (color: string, bgGradient: string) => void;
  onSectionToggle: (sectionId: string, isActive: boolean) => void;
}

// Create a single menu state manager
interface MenuState {
  size: boolean;
  color: boolean;
  sections: boolean;
}

// Memoized dropdown components
const DropdownButton = React.memo(({ 
  icon, 
  text, 
  color,
  onClick 
}: { 
  icon: React.ReactNode;
  text?: string;
  color?: string;
  onClick?: () => void;
}) => (
  <Menu.Button
    onClick={onClick}
    className="flex items-center gap-1.5 px-2 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200"
  >
    {icon}
    {text && <span className="max-w-[80px] truncate">{text}</span>}
    {color && (
      <div 
        className="w-3.5 h-3.5 rounded-full border border-gray-300" 
        style={{ backgroundColor: color }}
      />
    )}
    <HiChevronDown className="w-3.5 h-3.5" />
  </Menu.Button>
));

DropdownButton.displayName = 'DropdownButton';

const DropdownItem = React.memo(({ 
  active,
  selected,
  onClick,
  icon,
  text,
  style,
  color
}: {
  active: boolean;
  selected: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  text: string;
  style?: React.CSSProperties;
  color?: string;
}) => (
  <button
    onClick={onClick}
    className={`${
      active ? 'bg-gray-50' : ''
    } ${
      selected ? 'text-primary-600' : 'text-gray-700'
    } flex items-center gap-2 px-3 py-1.5 text-sm w-full transition-colors`}
    style={style}
  >
    {icon && <span>{icon}</span>}
    {color && (
      <div 
        className="w-3.5 h-3.5 rounded-full border border-gray-300" 
        style={{ backgroundColor: color }}
      />
    )}
    {text}
  </button>
));

DropdownItem.displayName = 'DropdownItem';

const DropdownMenu = React.memo(({ 
  isOpen, 
  onClose, 
  button, 
  items,
  width = "w-48"
}: { 
  isOpen: boolean;
  onClose: () => void;
  button: React.ReactNode;
  items: React.ReactNode;
  width?: string;
}) => (
  <Menu as="div" className="relative">
    {button}
    {isOpen && (
      <div className="fixed inset-0 z-10" onClick={onClose} />
    )}
    <div
      className={`absolute right-0 mt-1 ${width} origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-20 ${
        isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
      } transition-all duration-100 ease-out`}
    >
      <div className="py-1">
        {items}
      </div>
    </div>
  </Menu>
));

DropdownMenu.displayName = 'DropdownMenu';

// Memoize section templates
const sectionTemplates = {
  projects: [{ title: 'Project Name', description: 'Project Description', period: 'Duration' }],
  awards: [{ title: 'Award Name', issuer: 'Issuer', date: 'Date', description: 'Description' }],
  volunteer: [{ role: 'Role', organization: 'Organization', period: 'Duration', description: 'Description' }],
  languages: [{ name: 'Language', proficiency: 'Proficiency Level' }],
  certifications: [{ name: 'Certification Name', issuer: 'Issuer' }],
  publications: [{ title: 'Publication Title', publisher: 'Publisher', date: 'Date' }]
} as const;

export default React.memo(function StyleToolbar({
  selectedFont,
  selectedFontSize,
  primaryColor,
  activeSections,
  content,
  onFontChange,
  onFontSizeChange,
  onColorChange,
  onSectionToggle
}: StyleToolbarProps) {
  const [menuState, setMenuState] = useState<MenuState>({
    size: false,
    color: false,
    sections: false
  });

  const closeAllMenus = useCallback(() => {
    setMenuState({
      size: false,
      color: false,
      sections: false
    });
  }, []);

  const toggleMenu = useCallback((menu: keyof MenuState) => {
    setMenuState(prev => ({
      size: false,
      color: false,
      sections: false,
      [menu]: !prev[menu]
    }));
  }, []);

  const handleSectionToggleInternal = useCallback((sectionId: string, isActive: boolean) => {
    // First, call the parent's onSectionToggle to update the UI state
    onSectionToggle(sectionId, isActive);
    
    // Create a new content object with the updated section
    const updatedContent = { ...content };
    
    if (isActive) {
      // Add section with template data
      switch(sectionId) {
        case 'projects':
          updatedContent.projects = [{ title: 'Project Name', description: 'Project Description', period: 'Duration' }];
          break;
        case 'awards':
          updatedContent.awards = [{ title: 'Award Name', issuer: 'Issuer', date: 'Date', description: 'Description' }];
          break;
        case 'volunteer':
          updatedContent.volunteer = [{ role: 'Role', organization: 'Organization', period: 'Duration', description: 'Description' }];
          break;
        case 'languages':
          updatedContent.languages = [{ name: 'Language', proficiency: 'Proficiency Level' }];
          break;
        case 'certifications':
          updatedContent.certifications = [{ name: 'Certification Name', issuer: 'Issuer' }];
          break;
        case 'publications':
          updatedContent.publications = [{ title: 'Publication Title', publisher: 'Publisher', date: 'Date' }];
          break;
      }
    } else {
      // Remove section data
      switch(sectionId) {
        case 'projects':
          delete updatedContent.projects;
          break;
        case 'awards':
          delete updatedContent.awards;
          break;
        case 'volunteer':
          delete updatedContent.volunteer;
          break;
        case 'languages':
          delete updatedContent.languages;
          break;
        case 'certifications':
          delete updatedContent.certifications;
          break;
        case 'publications':
          delete updatedContent.publications;
          break;
      }
    }

    // Update the content reference
    Object.assign(content, updatedContent);
  }, [content, onSectionToggle]);

  // Memoized render functions for each dropdown
  const renderFontSizeItems = useMemo(() => (
    fontSizes.map((size) => (
      <Menu.Item key={size.value}>
        {({ active }) => (
          <DropdownItem
            active={active}
            selected={selectedFontSize === size.value}
            onClick={() => {
              onFontSizeChange(size.value);
              closeAllMenus();
            }}
            icon={size.icon}
            text={size.name}
          />
        )}
      </Menu.Item>
    ))
  ), [selectedFontSize, onFontSizeChange, closeAllMenus]);

  const renderColorItems = useMemo(() => (
    colors.map((color) => (
      <Menu.Item key={color.value}>
        {({ active }) => (
          <DropdownItem
            active={active}
            selected={primaryColor === color.value}
            onClick={() => {
              onColorChange(color.value, color.bgGradient);
              closeAllMenus();
            }}
            color={color.value}
            text={color.name}
          />
        )}
      </Menu.Item>
    ))
  ), [primaryColor, onColorChange, closeAllMenus]);

  const renderSectionItems = useMemo(() => (
    sections.map((section) => (
      <Menu.Item key={section.id}>
        {({ active }) => (
          <div className={`${
            active ? 'bg-gray-50' : ''
          } flex items-center justify-between gap-2 px-3 py-2 text-sm w-full transition-colors`}>
            <div className="flex items-center gap-2">
              <span>{section.icon}</span>
              <span className="text-gray-700">{section.name}</span>
            </div>
            <Switch
              checked={!!activeSections[section.id]}
              onChange={(checked) => handleSectionToggleInternal(section.id, checked)}
              className={`${
                activeSections[section.id] ? 'bg-primary-600' : 'bg-gray-200'
              } relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
            >
              <span className={`${
                activeSections[section.id] ? 'translate-x-5' : 'translate-x-1'
              } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
              />
            </Switch>
          </div>
        )}
      </Menu.Item>
    ))
  ), [activeSections, handleSectionToggleInternal]);

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-md backdrop-blur-sm bg-white/90">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between h-14">
          {/* Logo section simplified */}
          <div className="flex items-center">
            <span className="text-[1.5rem] font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              ResumeCraft
            </span>
          </div>

          {/* Toolbar Items */}
          <div className="flex items-center space-x-1.5">
            {/* Font Size Dropdown */}
            <DropdownMenu
              isOpen={menuState.size}
              onClose={closeAllMenus}
              button={
                <DropdownButton
                  icon={<HiOutlineTemplate className="w-3.5 h-3.5" />}
                  text={fontSizes.find(size => size.value === selectedFontSize)?.displayText || 'Medium'}
                  onClick={() => toggleMenu('size')}
                />
              }
              items={renderFontSizeItems}
            />

            {/* Color Picker */}
            <DropdownMenu
              isOpen={menuState.color}
              onClose={closeAllMenus}
              button={
                <DropdownButton
                  icon={<HiOutlineColorSwatch className="w-3.5 h-3.5" />}
                  color={primaryColor}
                  onClick={() => toggleMenu('color')}
                />
              }
              items={renderColorItems}
            />

            {/* Sections Dropdown */}
            <DropdownMenu
              isOpen={menuState.sections}
              onClose={closeAllMenus}
              button={
                <DropdownButton
                  icon={<HiOutlineTemplate className="w-3.5 h-3.5" />}
                  text="Sections"
                  onClick={() => toggleMenu('sections')}
                />
              }
              items={renderSectionItems}
              width="w-64"
            />
          </div>
        </div>
      </div>
    </div>
  );
}); 