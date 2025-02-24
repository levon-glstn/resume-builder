'use client';

import { motion } from 'framer-motion';
import { HiOutlineClipboardList, HiOutlineTemplate, HiOutlinePencil } from 'react-icons/hi';

const steps = [
  {
    icon: <HiOutlineClipboardList className="w-8 h-8" />,
    title: "Fill Your Details",
    description: "Enter your information using our smart forms. Our AI helps you write better bullet points and highlights your achievements.",
    tag: "Step 1",
    color: "from-primary-500 to-primary-600"
  },
  {
    icon: <HiOutlineTemplate className="w-8 h-8" />,
    title: "Choose Template",
    description: "Pick from our collection of ATS-friendly templates. Customize colors, fonts, and layout to match your style.",
    tag: "Step 2",
    color: "from-secondary-500 to-secondary-600"
  },
  {
    icon: <HiOutlinePencil className="w-8 h-8" />,
    title: "Customize & Perfect",
    description: "Fine-tune your resume with our styling options. Make it uniquely yours with custom colors and fonts.",
    tag: "Step 3",
    color: "from-primary-600 to-secondary-600"
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="bg-primary-100 text-primary-700 text-sm font-medium px-4 py-1 rounded-md inline-block mb-4">
            HOW IT WORKS ⚡️
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Three Simple Steps
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create your professional resume in minutes with our easy-to-follow process
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting Line */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-primary-100 via-secondary-100 to-primary-100" />

          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="relative bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className={`absolute -top-4 left-8 bg-gradient-to-r ${step.color} text-white text-sm font-medium px-3 py-1 rounded-full`}>
                {step.tag}
              </div>
              <div className="bg-gradient-to-br from-primary-50 to-secondary-50 w-16 h-16 rounded-lg flex items-center justify-center text-primary-600 mb-6">
                {step.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {step.title}
              </h3>
              <p className="text-gray-600">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 