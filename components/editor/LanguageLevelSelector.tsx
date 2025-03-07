import React from 'react';

interface LanguageLevelSelectorProps {
  level: number;
  onChange: (level: number) => void;
  color: string;
  primaryColor?: string;
}

const LanguageLevelSelector: React.FC<LanguageLevelSelectorProps> = ({
  level = 0,
  onChange,
  color,
  primaryColor
}) => {
  // Create an array of 5 levels
  const levels = [1, 2, 3, 4, 5];
  
  // Determine the color class based on the provided color
  const getColorClass = (isActive: boolean) => {
    if (!isActive) return 'bg-gray-200';
    
    // For primary color
    if (color === 'primary') {
      return 'bg-primary-600';
    }
    
    // For any other color (fallback to primary if not recognized)
    return 'bg-primary-600';
  };

  return (
    <div 
      className="flex items-center space-x-1 language-level"
      data-level={level}
      data-language-selector="true"
    >
      {levels.map((value) => (
        <div
          key={value}
          onClick={() => onChange(value)}
          className={`w-4 h-4 rounded-full transition-colors duration-200 level-circle cursor-pointer ${
            !primaryColor ? getColorClass(value <= level) : ''
          }`}
          style={{
            backgroundColor: value <= level && primaryColor ? primaryColor : value <= level ? undefined : '#f9fafb',
            border: value <= level ? 'none' : '1px solid rgba(0, 0, 0, 0.2)'
          }}
          role="button"
          aria-label={`Language level ${value}`}
          data-level-value={value}
          data-active={value <= level ? 'true' : 'false'}
        />
      ))}
    </div>
  );
};

export default LanguageLevelSelector; 