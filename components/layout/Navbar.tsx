'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Disclosure } from '@headlessui/react';
import { HiMenu, HiX } from 'react-icons/hi';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const navigation = [
  { name: 'How It Works', href: '#how-it-works' },
  { name: 'Templates', href: '#templates' },
  { name: 'Features', href: '#features' },
  { name: 'FAQ', href: '#faq' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setHasMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleStartNow = () => {
    router.push('/editor');
  };

  // Avoid hydration mismatch by not rendering until mounted
  if (!hasMounted) return null;

  return (
    <Disclosure as="nav" className={`fixed w-full z-50 transition-all duration-300 border-b ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm border-gray-200' : 'border-transparent'}`}>
      {({ open }) => (
        <>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center -ml-4 sm:-ml-3 md:-ml-4 lg:-ml-5">
                <motion.a
                  href="#home"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center"
                >
                  <Image 
                    src="/images/logo.svg" 
                    alt="ResumeCool Logo" 
                    width={250} 
                    height={100} 
                    className="h-20 w-auto"
                  />
                </motion.a>
              </div>
              <div className="hidden md:flex items-center space-x-6">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-gray-700 hover:text-primary-600 transition-colors px-2 py-2 text-sm font-medium"
                  >
                    {item.name}
                  </a>
                ))}
                <motion.button
                  onClick={handleStartNow}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-primary-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                >
                  Start Now
                </motion.button>
              </div>
              <div className="flex items-center md:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-600">
                  {open ? (
                    <HiX className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <HiMenu className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white/80 backdrop-blur-md border-t border-gray-100">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as="a"
                  href={item.href}
                  className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium"
                >
                  {item.name}
                </Disclosure.Button>
              ))}
              <button
                onClick={handleStartNow}
                className="block w-full bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors mt-4 text-center"
              >
                Start Now
              </button>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
} 