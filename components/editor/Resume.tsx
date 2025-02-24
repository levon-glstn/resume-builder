import React from 'react';

// Add these CSS classes to your Resume component
const resumeStyles = {
  container: `
    font-size: var(--base-font-size, 1rem);
  `,
  heading: `
    font-size: var(--heading-font-size, 1.5rem);
  `,
  subheading: `
    font-size: var(--subheading-font-size, 1.25rem);
  `
};

// Resume component with proper structure
const Resume: React.FC = () => {
  return (
    <div className={resumeStyles.container}>
      {/* Example usage of the styles */}
      <h1 className={resumeStyles.heading}>Your Name</h1>
      <h2 className={resumeStyles.subheading}>Your Title</h2>
      {/* Add your resume content here */}
    </div>
  );
};

export default Resume; 