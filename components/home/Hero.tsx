'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Hero() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleStartBuilding = () => {
    setIsLoading(true);
    router.push('/editor');
  };

  return (
    <section id="home" className="pt-20 md:pt-28 pb-12 md:pb-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center lg:text-left"
          >
            <div className="hidden md:flex flex-wrap gap-2 justify-center lg:justify-start mb-4 md:mb-6">
              <span className="bg-primary-100 text-primary-700 text-xs md:text-sm font-medium px-3 py-1 rounded-md">
                AI-Powered ✨
              </span>
              <span className="bg-secondary-100 text-secondary-700 text-xs md:text-sm font-medium px-3 py-1 rounded-md">
                ATS-Friendly 🎯
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-3 md:mb-4">
              <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Build Your Resume
              </span>
              <br />
              <span className="text-gray-900">in Minutes</span>
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 mb-6 md:mb-8 max-w-2xl mx-auto lg:mx-0">
              Create a professional resume that stands out with our easy-to-use builder. 
              No design experience needed - just fill in your details and let our AI do the magic! ✨
            </p>
            <div className="flex justify-center lg:justify-start">
              <motion.button
                onClick={handleStartBuilding}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isLoading}
                className="bg-primary-600 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-primary-700 transition-colors shadow-lg relative"
              >
                {isLoading ? (
                  <>
                    <span className="opacity-0">Start Building Now</span>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </>
                ) : (
                  "Start Building Now"
                )}
              </motion.button>
            </div>
            <p className="mt-2 md:mt-3 text-xs sm:text-sm text-gray-500">No sign up required to start ✨</p>
            <div className="mt-6 md:mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-2 md:gap-4">
              <span className="bg-green-100 text-green-700 text-xs sm:text-sm px-3 py-1 rounded-md flex items-center">
                ⭐️ 4.9/5 rating
              </span>
              <span className="bg-blue-100 text-blue-700 text-xs sm:text-sm px-3 py-1 rounded-md flex items-center">
                🚀 10k+ resumes
              </span>
              <span className="bg-purple-100 text-purple-700 text-xs sm:text-sm px-3 py-1 rounded-md flex items-center">
                🔒 100% secure
              </span>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative mt-8 lg:mt-0"
          >
            <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[600px] rounded-lg overflow-hidden shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-secondary-500/10 z-10" />
              <Image
                src="/images/hero-img.png"
                alt="Professional Resume Template"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 640px) 90vw, (max-width: 1024px) 70vw, 50vw"
                quality={100}
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 md:w-48 h-32 md:h-48 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full blur-3xl opacity-20" />
            <div className="absolute -top-6 -left-6 w-32 md:w-48 h-32 md:h-48 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full blur-3xl opacity-20" />
          </motion.div>
        </div>
      </div>
    </section>
  );
} 