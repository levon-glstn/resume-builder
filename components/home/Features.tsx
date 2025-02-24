'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect, useState } from 'react';
import { 
  HiOutlineClock, 
  HiOutlineTemplate, 
  HiOutlinePencilAlt,
  HiOutlineColorSwatch,
  HiOutlineLightningBolt,
  HiOutlineDeviceMobile,
  HiOutlineShieldCheck,
  HiOutlineChevronLeft,
  HiOutlineChevronRight
} from 'react-icons/hi';
import { IconType } from 'react-icons';

const features = [
  {
    icon: <HiOutlinePencilAlt className="w-8 h-8" />,
    title: "Easy to Use! 🎯",
    description: "Our intuitive interface makes resume creation a breeze. No design experience needed!"
  },
  {
    icon: <HiOutlineTemplate className="w-8 h-8" />,
    title: "Professional Templates! 📄",
    description: "Choose from our collection of ATS-friendly templates designed for various industries."
  },
  {
    icon: <HiOutlineColorSwatch className="w-8 h-8" />,
    title: "Customizable Design! 🎨",
    description: "Personalize your resume with custom colors, fonts, and styling options."
  },
  {
    icon: <HiOutlineLightningBolt className="w-8 h-8" />,
    title: "Real-time Preview! ⚡",
    description: "See your changes instantly as you type, making it easy to perfect your resume."
  },
  {
    icon: <HiOutlineDeviceMobile className="w-8 h-8" />,
    title: "Mobile Friendly! 📱",
    description: "Create and edit your resume on any device, anytime, anywhere."
  },
  {
    icon: <HiOutlineShieldCheck className="w-8 h-8" />,
    title: "Data Privacy! 🔒",
    description: "Your information is secure with us. We never share your data with third parties."
  }
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

interface CarouselButtonProps {
  onClick: () => void;
  enabled: boolean;
  icon: IconType;
  position: 'left' | 'right';
}

export default function Features() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
    initialInView: true
  });

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  const CarouselButton = ({ onClick, enabled, icon: Icon, position }: CarouselButtonProps) => (
    <button
      className={`absolute top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-lg text-gray-600 transition-all ${
        enabled ? 'opacity-100 hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'
      } ${position === 'left' ? '-left-5' : '-right-5'}`}
      onClick={onClick}
      disabled={!enabled}
    >
      <Icon className="w-6 h-6" />
    </button>
  );

  return (
    <section id="features" className="py-20 bg-gradient-to-br from-gray-50 to-white overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 md:mb-16"
        >
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary-100 text-primary-700 text-sm font-medium px-4 py-1 rounded-md inline-block mb-4"
          >
            WHY CHOOSE US ⚡️
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 px-4"
          >
            Why Choose Our Resume Builder?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4"
          >
            Create a professional resume in minutes with our easy-to-use builder
          </motion.p>
        </motion.div>

        {/* Desktop Grid View */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600 mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Mobile Carousel View */}
        <div className="md:hidden relative mt-8">
          <div className="overflow-hidden pb-8" ref={emblaRef}>
            <div className="flex">
              {features.map((feature, index) => (
                <div key={index} className="flex-[0_0_100%] min-w-0 px-4">
                  <motion.div
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg mx-auto max-w-sm"
                  >
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600 mb-4 sm:mb-6">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600">
                      {feature.description}
                    </p>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
          
          <CarouselButton
            onClick={scrollPrev}
            enabled={prevBtnEnabled}
            icon={HiOutlineChevronLeft}
            position="left"
          />
          <CarouselButton
            onClick={scrollNext}
            enabled={nextBtnEnabled}
            icon={HiOutlineChevronRight}
            position="right"
          />
        </div>
      </div>
    </section>
  );
} 