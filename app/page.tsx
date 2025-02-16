import Navbar from '@/components/layout/Navbar';
import Hero from '@/components/home/Hero';
import HowItWorks from '@/components/home/HowItWorks';
import Features from '@/components/home/Features';
import Templates from '@/components/home/Templates';
import Testimonials from '@/components/home/Testimonials';
import FAQ from '@/components/home/FAQ';

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <a href="#home" className="text-xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                ResumeCraft
              </a>
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
              © 2024 ResumeCraft. All rights reserved.
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
