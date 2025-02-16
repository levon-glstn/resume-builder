'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Hero() {
  const router = useRouter();

  const handleStartBuilding = () => {
    router.push('/editor');
  };

  return (
    <section id="home" className="pt-28 pb-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center lg:text-left"
          >
            <div className="flex flex-wrap gap-2 justify-center lg:justify-start mb-6">
              <span className="bg-primary-100 text-primary-700 text-sm font-medium px-3 py-1 rounded-md">
                AI-Powered ✨
              </span>
              <span className="bg-secondary-100 text-secondary-700 text-sm font-medium px-3 py-1 rounded-md">
                ATS-Friendly 🎯
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Build Your Resume
              </span>
              <br />
              <span className="text-gray-900">in Minutes</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0">
              Create a professional resume that stands out with our easy-to-use builder. 
              No design experience needed - just fill in your details and let our AI do the magic! ✨
            </p>
            <div className="flex justify-center lg:justify-start">
              <motion.button
                onClick={handleStartBuilding}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-primary-600 text-white px-6 py-3 rounded-lg text-base font-semibold hover:bg-primary-700 transition-colors shadow-lg"
              >
                Start Building Now
              </motion.button>
            </div>
            <p className="mt-3 text-sm text-gray-500">No sign up required to start ✨</p>
            <div className="mt-8 flex items-center justify-center lg:justify-start space-x-4">
              <span className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-md flex items-center">
                ⭐️ 4.9/5 rating
              </span>
              <span className="bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-md flex items-center">
                🚀 10k+ resumes created
              </span>
              <span className="bg-purple-100 text-purple-700 text-sm px-3 py-1 rounded-md flex items-center">
                🔒 100% secure
              </span>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <div className="relative w-full h-[600px] rounded-lg overflow-hidden shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-secondary-500/10 z-10" />
              <Image
                src="/images/hero-template.png"
                alt="Professional Resume Template"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                quality={100}
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full blur-3xl opacity-20" />
            <div className="absolute -top-6 -left-6 w-48 h-48 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full blur-3xl opacity-20" />
          </motion.div>
        </div>
      </div>
    </section>
  );
} 