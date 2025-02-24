'use client';

import React from 'react';
import type { ResumeContent } from '@/types/resume';

interface ResumePDFProps {
  content: ResumeContent;
  activeSections: Record<string, boolean>;
}

export default function ResumePDF({ content, activeSections }: ResumePDFProps) {
  return (
    <div id="resume-content" className="p-8 bg-white">
      {/* Header Section */}
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">{content.name}</h1>
        <h2 className="text-xl text-gray-600">{content.title}</h2>
      </div>

      {/* Contact Section */}
      <div className="flex justify-center space-x-4 text-sm text-gray-600 mt-4">
        <span>{content.contact.email}</span>
        <span>{content.contact.phone}</span>
        <span>{content.contact.location}</span>
      </div>

      {/* Summary Section */}
      {activeSections.summary && (
        <div className="mt-8 space-y-2">
          <h2 className="text-xl font-bold">Summary</h2>
          <p className="text-gray-600">{content.summary}</p>
        </div>
      )}

      {/* Experience Section */}
      {activeSections.experience && (
        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-bold">Experience</h2>
          {content.experience.map((exp, index) => (
            <div key={index} className="space-y-2">
              <h3 className="font-semibold">{exp.title}</h3>
              <div className="flex justify-between text-sm text-gray-600">
                <span>{exp.company}</span>
                <span>{exp.location}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>{exp.startDate}</span>
                <span>{exp.endDate}</span>
              </div>
              <p className="text-gray-600 whitespace-pre-line">{exp.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Education Section */}
      {activeSections.education && (
        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-bold">Education</h2>
          {content.education.map((edu, index) => (
            <div key={index} className="space-y-2">
              <h3 className="font-semibold">{edu.degree}</h3>
              <div className="flex justify-between text-sm text-gray-600">
                <span>{edu.school}</span>
                <span>{edu.location}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>{edu.startDate}</span>
                <span>{edu.endDate}</span>
              </div>
              <p className="text-gray-600">{edu.details}</p>
            </div>
          ))}
        </div>
      )}

      {/* Skills Section */}
      {activeSections.skills && (
        <div className="mt-8 space-y-2">
          <h2 className="text-xl font-bold">Skills</h2>
          <p className="text-gray-600">{content.skills.join(', ')}</p>
        </div>
      )}

      {/* Projects Section */}
      {activeSections.projects && content.projects && (
        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-bold">Projects</h2>
          {content.projects.map((project, index) => (
            <div key={index} className="space-y-2">
              <h3 className="font-semibold">{project.title}</h3>
              <p className="text-gray-600">{project.description}</p>
              <p className="text-sm text-gray-600">{project.period}</p>
            </div>
          ))}
        </div>
      )}

      {/* Languages Section */}
      {activeSections.languages && content.languages && (
        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-bold">Languages</h2>
          {content.languages.map((language, index) => (
            <div key={index} className="flex justify-between items-center">
              <span>{language.name}</span>
              <span className="text-sm text-gray-600">{language.proficiency}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 