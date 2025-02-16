'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  HiOutlineClock, 
  HiOutlineTemplate, 
  HiOutlinePencil,
  HiOutlineDownload,
  HiOutlineSparkles,
  HiOutlineShieldCheck 
} from 'react-icons/hi';

const features = [
  {
    icon: <HiOutlineClock className="w-8 h-8" />,
    title: "Save Time! ⏳",
    description: "Create your resume in minutes, not hours. Our intuitive builder guides you through each step."
  },
  {
    icon: <HiOutlineTemplate className="w-8 h-8" />,
    title: "Professional Templates! 📄",
    description: "Choose from our collection of ATS-friendly templates designed by HR professionals."
  },
  {
    icon: <HiOutlinePencil className="w-8 h-8" />,
    title: "Easy Customization! 🎨",
    description: "Customize every aspect of your resume with our simple drag-and-drop interface."
  },
  {
    icon: <HiOutlineDownload className="w-8 h-8" />,
    title: "Instant Download! 💫",
    description: "Download your resume in multiple formats including PDF, Word, and plain text."
  },
  {
    icon: <HiOutlineSparkles className="w-8 h-8" />,
    title: "AI-Powered! 🤖",
    description: "Get smart suggestions and improvements powered by our AI technology."
  },
  {
    icon: <HiOutlineShieldCheck className="w-8 h-8" />,
    title: "Privacy First! 🔒",
    description: "Your data is secure with us. We never share your information with third parties."
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

export default function Features() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <section id="features" className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
          >
            Why Choose Our Resume Builder?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Create a professional resume in minutes with our easy-to-use builder
          </motion.p>
        </div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
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
      </div>
    </section>
  );
} 