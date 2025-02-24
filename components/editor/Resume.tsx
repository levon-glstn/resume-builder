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

// Make sure to apply these classes to the appropriate elements in your Resume component
// For example:
<h1 className={resumeStyles.heading}>...</h1>
<h2 className={resumeStyles.subheading}>...</h2>
<div className={resumeStyles.container}>...</div> 