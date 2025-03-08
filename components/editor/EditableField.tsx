'use client';

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';

// Update the auto-expand styles to ensure tighter fit and completely remove resize handles
const autoExpandStyles = `
  .auto-expand-textarea-container {
    display: grid;
    width: fit-content;
    min-width: 150px;
    max-width: 100%;
  }
  
  .auto-expand-textarea-container::after,
  .auto-expand-textarea {
    grid-area: 1 / 1;
    width: 100%;
    min-width: 0;
  }
  
  .auto-expand-textarea-container::after {
    content: attr(data-value) ' ';
    visibility: hidden;
    white-space: pre-wrap;
    padding: 0.5rem;
    border: 1px solid transparent;
  }
  
  .auto-expand-textarea {
    resize: none !important;
    overflow: hidden;
  }
  
  /* Completely hide resize handle in all browsers */
  textarea {
    resize: none !important;
    
  }
  
  /* Hide WebKit/Blink/Chrome resize handle */
  textarea::-webkit-resizer {
    display: none !important;
  }
  
  /* Additional Firefox-specific rule */
  textarea {
    overflow: auto !important;
  }
`;

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
  const contentRef = useRef<HTMLDivElement>(null);
  const hiddenTextRef = useRef<HTMLSpanElement>(null);
  
  // Update local value when content changes
  useEffect(() => {
    setLocalValue(content);
  }, [content]);

  // Add the auto-expand styles to the document
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = autoExpandStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const handleBlur = () => {
    setIsEditing(false);
    if (localValue !== content) {
      onEdit(section, localValue);
    }
    if (onBlur) {
      onBlur({} as React.FocusEvent<HTMLInputElement>);
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

  // Function to process content and enhance bullet points
  const processContent = (content: string) => {
    if (!content) return '';
    // Replace bullet points with styled ones that match the theme color
    return content.replace(
      /^(\s*)[•·]\s(.+)$/gm, 
      `$1<span class="font-bold" style="color: var(--theme-color)">•</span> $2`
    );
  };

  const displayValue = useMemo(() => {
    const contentToProcess = value || content || '';
    
    if (propMultiline || isMultiline) {
      // Process the content to enhance bullet points
      const processed = processContent(contentToProcess);
      return (
        <div 
          ref={contentRef}
          className={`whitespace-pre-wrap ${className}`} 
          dangerouslySetInnerHTML={{ __html: processed }}
        />
      );
    }
    return <div ref={contentRef} className={className}>{contentToProcess}</div>;
  }, [value, content, propMultiline, isMultiline, className]);

  useEffect(() => {
    // Add a style tag to the document head for bullet point styling
    const styleTag = document.createElement('style');
    styleTag.innerHTML = `
      @media print {
        .resume-content span[style*="color: var(--theme-color)"] {
          color: var(--theme-color) !important;
          font-weight: bold !important;
        }
      }
    `;
    document.head.appendChild(styleTag);
    
    return () => {
      document.head.removeChild(styleTag);
    };
  }, []);

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
    // For multiline content, use auto-expanding textarea
    if (propMultiline) {
      return (
        <div 
          className="auto-expand-textarea-container"
          data-value={localValue || placeholder}
          style={{
            fontFamily: style.fontFamily || 'inherit',
            fontSize: style.fontSize || 'inherit',
            fontWeight: style.fontWeight || 'inherit',
            lineHeight: style.lineHeight || 'inherit',
          }}
        >
          <textarea
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={`auto-expand-textarea p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
            style={{
              ...style,
              width: '100%',
              resize: 'none',
              overflow: 'hidden',
            }}
            autoFocus
          />
        </div>
      );
    }
    
    // For single line content, use input with inline-block display
    return (
      <div className="relative inline-block" style={{ maxWidth: '100%' }}>
        {/* Hidden span to measure text width */}
        <span 
          ref={hiddenTextRef}
          className="absolute invisible whitespace-pre"
          style={{
            fontFamily: style.fontFamily || 'inherit',
            fontSize: style.fontSize || 'inherit',
            fontWeight: style.fontWeight || 'inherit',
            letterSpacing: style.letterSpacing || 'inherit',
            padding: '0.5rem', // Match input padding
            ...style
          }}
        >
          {localValue || placeholder}
        </span>
        
        <input
          type="text"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={`p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
          style={{
            ...style,
            width: 'auto',
            minWidth: '3ch', // Minimum width for very short text
            maxWidth: '100%',
            resize: 'none', // Disable resizing
          }}
          autoFocus
        />
      </div>
    );
  }

  return (
    <div
      onClick={() => isEditable && setIsEditing(true)}
      className={`${isEditable ? 'cursor-text hover:bg-gray-50' : ''} p-2 rounded-md inline-block ${className}`}
      style={{ ...style, maxWidth: '100%' }}
    >
      {displayValue || <span className="text-gray-400">{placeholder}</span>}
    </div>
  );
};

export default EditableField; 