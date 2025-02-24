'use client';

import React, { useState } from 'react';

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
  const [value, setValue] = useState(content);

  const handleBlur = () => {
    setIsEditing(false);
    if (value !== content) {
      onEdit(section, value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isMultiline) {
      e.preventDefault();
      handleBlur();
    }
    if (e.key === 'Escape') {
      setValue(content);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return isMultiline ? (
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
        style={style}
        rows={3}
        autoFocus
      />
    ) : (
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
        style={style}
        autoFocus
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={`cursor-text p-2 rounded-md hover:bg-gray-50 ${className}`}
      style={style}
    >
      {content || <span className="text-gray-400">{placeholder}</span>}
    </div>
  );
};

export default EditableField; 