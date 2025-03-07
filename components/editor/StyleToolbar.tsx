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
  HiMenu,
  HiX
} from 'react-icons/hi';
import Image from 'next/image';
import Link from 'next/link';
import type { ResumeContent } from '@/types/resume';
import React from 'react';

// Move these outside component to prevent recreation
const fontSizes = [
  { name: 'Small', value: '14px' },
  { name: 'Medium', value: '16px' },
  { name: 'Large', value: '18px' }
];

const colors = [
  { name: 'Royal Purple', value: '#4338ca', bgGradient: 'bg-gradient-to-br from-[#4338ca]/5 to-[#4338ca]/10' },
  { name: 'Navy Blue', value: '#1e40af', bgGradient: 'bg-gradient-to-br from-[#1e40af]/5 to-[#1e40af]/10' },
  { name: 'Forest Green', value: '#166534', bgGradient: 'bg-gradient-to-br from-[#166534]/5 to-[#166534]/10' },
  { name: 'Dark Red', value: '#991b1b', bgGradient: 'bg-gradient-to-br from-[#991b1b]/5 to-[#991b1b]/10' },
  { name: 'Classic Black', value: '#111827', bgGradient: 'bg-gradient-to-br from-[#111827]/5 to-[#111827]/10' }
];

const sections = [
  { name: 'Summary', id: 'summary', icon: '📝' },
  { name: 'Experience', id: 'experience', icon: '💼' },
  { name: 'Education', id: 'education', icon: '🎓' },
  { name: 'Skills', id: 'skills', icon: '🛠️' },
  { name: 'Projects', id: 'projects', icon: '🚀' },
  { name: 'Languages', id: 'languages', icon: '🌐' }
];

interface StyleToolbarProps {
  font: string;
  fontSize: string;
  activeSections: Record<string, boolean>;
  onFontChange: (font: string) => Promise<void>;
  onFontSizeChange: (size: string) => void;
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
  languages: [{ name: 'Language', proficiency: 'Proficiency' }],
  certifications: [{ name: 'Certification Name', issuer: 'Issuer' }],
  publications: [{ title: 'Publication Title', publisher: 'Publisher', date: 'Date' }]
} as const;

export default React.memo(function StyleToolbar({
  font,
  fontSize,
  activeSections,
  onFontChange,
  onFontSizeChange,
  onSectionToggle
}: StyleToolbarProps) {
  const [menuState, setMenuState] = useState<MenuState>({
    size: false,
    color: false,
    sections: false
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    onSectionToggle(sectionId, isActive);
  }, [onSectionToggle]);

  // Memoized render functions for each dropdown
  const renderFontSizeItems = useMemo(() => (
    fontSizes.map((size) => (
      <Menu.Item key={size.value}>
        {({ active }) => (
          <DropdownItem
            active={active}
            selected={fontSize === size.value}
            onClick={() => {
              onFontSizeChange(size.value);
              closeAllMenus();
            }}
            icon={size.name}
            text={size.name}
          />
        )}
      </Menu.Item>
    ))
  ), [fontSize, onFontSizeChange, closeAllMenus]);

  const renderColorItems = useMemo(() => (
    colors.map((color) => (
      <Menu.Item key={color.value}>
        {({ active }) => (
          <DropdownItem
            active={active}
            selected={font === color.value}
            onClick={() => {
              onFontChange(color.value);
              closeAllMenus();
            }}
            color={color.value}
            text={color.name}
          />
        )}
      </Menu.Item>
    ))
  ), [font, onFontChange, closeAllMenus]);

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
    <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-2">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          {/* Font Size Dropdown */}
          <DropdownMenu
            isOpen={menuState.size}
            onClose={closeAllMenus}
            button={
              <DropdownButton
                icon={<HiOutlineDocumentText className="w-4 h-4" />}
                text={fontSize}
                onClick={() => toggleMenu('size')}
              />
            }
            items={renderFontSizeItems}
          />

          {/* Color Picker Dropdown */}
          <DropdownMenu
            isOpen={menuState.color}
            onClose={closeAllMenus}
            button={
              <DropdownButton
                icon={<HiOutlineColorSwatch className="w-4 h-4" />}
                color={font}
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
                icon={<HiOutlineTemplate className="w-4 h-4" />}
                text="Sections"
                onClick={() => toggleMenu('sections')}
              />
            }
            items={renderSectionItems}
            width="w-64"
          />
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        >
          {isMobileMenuOpen ? (
            <HiX className="w-6 h-6" />
          ) : (
            <HiMenu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-2 space-y-2 p-2">
          <div className="flex flex-wrap gap-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => onSectionToggle(section.id, !activeSections[section.id])}
                className={`flex items-center space-x-1 rounded-md px-2 py-1 text-sm ${
                  activeSections[section.id]
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                <span>{section.icon}</span>
                <span>{section.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}); 