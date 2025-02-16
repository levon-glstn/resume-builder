'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { HiCheck } from 'react-icons/hi';

const templates = [
  {
    name: "Professional",
    image: "/templates/professional.jpg",
    description: "Clean and modern design perfect for corporate roles",
    features: ["ATS-Friendly", "Multiple Color Schemes", "Customizable Sections"],
    tag: "Most Popular 🔥"
  },
  {
    name: "Creative",
    image: "/templates/creative.jpg",
    description: "Stand out with a unique layout for creative positions",
    features: ["Visual Elements", "Portfolio Section", "Custom Typography"],
    tag: "Designer's Choice 🎨"
  },
  {
    name: "Executive",
    image: "/templates/executive.jpg",
    description: "Elegant design for senior-level professionals",
    features: ["Achievement Focused", "Executive Summary", "Skills Matrix"],
    tag: "Premium ⭐️"
  }
];

export default function Templates() {
  return (
    <section id="templates" className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="bg-secondary-100 text-secondary-700 text-sm font-medium px-4 py-1 rounded-md inline-block mb-4">
            TEMPLATES 🖼️
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Choose Your Perfect Template
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Professional templates designed by HR experts and data-driven insights
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {templates.map((template, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative h-64 w-full">
                <Image
                  src={template.image}
                  alt={template.name}
                  fill
                  className="object-cover rounded-t-lg"
                />
                <div className="absolute top-4 right-4">
                  <span className="bg-white/90 backdrop-blur-sm text-primary-700 text-sm font-medium px-3 py-1 rounded-md shadow-sm">
                    {template.tag}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {template.name}
                </h3>
                <p className="text-gray-600 mb-4">
                  {template.description}
                </p>
                <ul className="space-y-2 mb-6">
                  {template.features.map((feature, i) => (
                    <li key={i} className="flex items-center text-gray-600">
                      <HiCheck className="w-5 h-5 text-green-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-primary-600 text-white py-2 rounded-md font-medium hover:bg-primary-700 transition-colors"
                >
                  Use This Template
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 