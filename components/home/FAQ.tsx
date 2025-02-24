'use client';

import { motion } from 'framer-motion';
import { Disclosure } from '@headlessui/react';
import { HiChevronDown } from 'react-icons/hi';

const faqs = [
  {
    question: "How long does it take to create a resume? ⏱️",
    answer: "With our intuitive builder, you can create a professional resume in as little as 15 minutes. Our smart templates and AI-powered suggestions help speed up the process."
  },
  {
    question: "Is my information secure? 🔒",
    answer: "Yes, absolutely! We take data privacy seriously. Your information is encrypted and never shared with third parties. You can delete your data at any time."
  },
  {
    question: "Do you offer multiple templates? 🎨",
    answer: "Yes, we offer a wide variety of professional templates suitable for different industries and career levels. All templates are customizable to match your preferences."
  },
  {
    question: "Is it free to use? 💰",
    answer: "Yes! Our resume builder is completely free to use. You can create and customize your resume with all available features."
  },
  {
    question: "Can I edit my resume after saving? ✏️",
    answer: "Yes! You can edit your resume anytime. Your changes are saved automatically so you never lose your progress."
  }
];

export default function FAQ() {
  return (
    <section id="faq" className="py-20 bg-gradient-to-br from-white to-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="bg-secondary-100 text-secondary-700 text-sm font-medium px-4 py-1 rounded-md inline-block mb-4">
            FAQ ❓
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600">
            Everything you need to know about our resume builder
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className="space-y-4"
        >
          {faqs.map((faq, index) => (
            <Disclosure key={index}>
              {({ open }) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Disclosure.Button className="flex justify-between w-full px-6 py-4 text-left text-gray-800 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                    <span className="text-lg font-medium">{faq.question}</span>
                    <HiChevronDown
                      className={`w-5 h-5 text-primary-500 transition-transform duration-200 ${
                        open ? 'transform rotate-180' : ''
                      }`}
                    />
                  </Disclosure.Button>
                  <Disclosure.Panel className="px-6 py-4 text-gray-600 bg-white rounded-b-lg -mt-1">
                    {faq.answer}
                  </Disclosure.Panel>
                </motion.div>
              )}
            </Disclosure>
          ))}
        </motion.div>
      </div>
    </section>
  );
} 