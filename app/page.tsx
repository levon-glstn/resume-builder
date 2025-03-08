'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Hero from '@/components/home/Hero';
import HowItWorks from '@/components/home/HowItWorks';
import Features from '@/components/home/Features';
import Templates from '@/components/home/Templates';
import Testimonials from '@/components/home/Testimonials';
import FAQ from '@/components/home/FAQ';
import EditableField from '@/components/editor/EditableField';
import Image from 'next/image';

const defaultActiveSections = {
  phone: true,
  email: true,
  location: true,
  url: true,
  projects: true,
  languages: true,
  certifications: true
};

export default function Home() {
  const [settings, setSettings] = useState({
    fontSize: 'medium'
  });

  useEffect(() => {
    if (settings.fontSize) {
      const root = document.documentElement;
      
      // Set base font size variables
      switch(settings.fontSize) {
        case 'small':
          root.style.setProperty('--base-font-size', '0.875rem'); // 14px
          root.style.setProperty('--heading-font-size', '1.25rem'); // 20px
          root.style.setProperty('--subheading-font-size', '1rem'); // 16px
          break;
        case 'large':
          root.style.setProperty('--base-font-size', '1.125rem'); // 18px
          root.style.setProperty('--heading-font-size', '1.75rem'); // 28px
          root.style.setProperty('--subheading-font-size', '1.375rem'); // 22px
          break;
        default: // medium
          root.style.setProperty('--base-font-size', '1rem'); // 16px
          root.style.setProperty('--heading-font-size', '1.5rem'); // 24px
          root.style.setProperty('--subheading-font-size', '1.25rem'); // 20px
          break;
      }
    }
  }, [settings.fontSize]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Features />
      <Templates />
      <Testimonials />
      <FAQ />
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex flex-col space-y-4">
              <div className="self-start">
                <a href="#home">
                  <Image 
                    src="/images/logo.svg" 
                    alt="ResumeCool Logo" 
                    width={250} 
                    height={100} 
                    className="h-22 w-auto"
                  />
                </a>
              </div>
              <p className="text-gray-400 text-sm">
                Create professional resumes in minutes with our easy-to-use builder.
              </p>
              <div className="flex space-x-4">
                <span className="bg-primary-900/20 text-primary-400 text-xs px-2 py-1 rounded">
                  4.9/5 Rating ⭐️
                </span>
                <span className="bg-primary-900/20 text-primary-400 text-xs px-2 py-1 rounded">
                  10k+ Users 🚀
                </span>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#templates" className="hover:text-white transition-colors">Templates</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#templates" className="hover:text-white transition-colors">Resume Tips</a></li>
                <li><a href="#templates" className="hover:text-white transition-colors">Examples</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#home" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#testimonials" className="hover:text-white transition-colors">Reviews</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 ResumeCool. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Terms
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Privacy
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
