'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface EditableFieldProps {
  content: string;
  section: string;
  onEdit: (section: string, value: string) => void;
  isMultiline?: boolean;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  isBulletList?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  type?: string;
  textAlign?: string;
  fontSize?: string;
  fontWeight?: string;
  isEditable?: boolean;
  showBorder?: boolean;
  multiline?: boolean;
  maxLength?: number;
  minRows?: number;
  maxRows?: number;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const EditableField: React.FC<EditableFieldProps> = ({ 
  content, 
  section, 
  onEdit, 
  isMultiline = false,
  placeholder = '',
  className = '',
  style = {},
  isBulletList = false,
  value,
  onChange,
  type = "text",
  textAlign = "left",
  fontSize = "base",
  fontWeight = "normal",
  isEditable = true,
  showBorder = true,
  multiline: propMultiline = false,
  maxLength,
  minRows = 1,
  maxRows,
  onBlur,
  onFocus,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(content);

  const handleBlur = () => {
    setIsEditing(false);
    if (localValue !== content) {
      onEdit(section, localValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !propMultiline) {
      e.preventDefault();
      handleBlur();
    }
    if (e.key === 'Escape') {
      setLocalValue(content);
      setIsEditing(false);
    }
  };

  if (type === "photo") {
    return (
      <div className={`relative ${className}`}>
        {value ? (
          <div className="relative group">
            <Image
              src={value}
              alt="Profile photo"
              width={100}
              height={100}
              className="rounded-full object-cover w-24 h-24"
            />
            {isEditable && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*";
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          onChange?.(e.target?.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    };
                    input.click();
                  }}
                  className="text-white text-xs p-1"
                >
                  Change
                </button>
              </div>
            )}
          </div>
        ) : (
          isEditable && (
            <button
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = "image/*";
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      onChange?.(e.target?.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                };
                input.click();
              }}
              className={`w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center ${
                showBorder ? "border-gray-300" : "border-transparent"
              }`}
            >
              <span className="text-gray-400">Add Photo</span>
            </button>
          )
        )}
      </div>
    );
  }

  if (isEditing) {
    return propMultiline ? (
      <textarea
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
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
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
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