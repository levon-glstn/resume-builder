'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { HiStar } from 'react-icons/hi';

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Software Engineer",
    image: "/testimonials/user1.jpg",
    company: "Tech Corp",
    text: "The AI suggestions were incredibly helpful. Got multiple interview calls after using this resume builder! 🚀",
    rating: 5,
    tag: "Verified User ✅"
  },
  {
    name: "Michael Chen",
    role: "Marketing Manager",
    image: "/testimonials/user2.jpg",
    company: "Brand Solutions",
    text: "Clean, professional templates that really made my experience stand out. Landed my dream job! 🎯",
    rating: 5,
    tag: "Premium User 💎"
  },
  {
    name: "Emily Rodriguez",
    role: "UX Designer",
    image: "/testimonials/user3.jpg",
    company: "Creative Studio",
    text: "The customization options are amazing. Perfect for creative professionals like me! 🎨",
    rating: 5,
    tag: "Featured Review ⭐️"
  }
];

export default function Testimonials() {
  return (
    <section className="py-20 bg-gradient-to-br from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="bg-secondary-100 text-secondary-700 text-sm font-medium px-4 py-1 rounded-md inline-block mb-4">
            TESTIMONIALS 📢
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            What Our Users Say
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join thousands of satisfied professionals who built their perfect resume
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-center mb-4">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden mr-4">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{testimonial.name}</h3>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                  <p className="text-sm text-primary-600">{testimonial.company}</p>
                </div>
                <span className="ml-auto bg-secondary-50 text-secondary-700 text-xs px-2 py-1 rounded">
                  {testimonial.tag}
                </span>
              </div>
              <div className="flex mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <HiStar key={i} className="w-5 h-5 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700">{testimonial.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 