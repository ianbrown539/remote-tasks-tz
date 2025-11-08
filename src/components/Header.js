import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Make header sticky + change style on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false); // Close mobile menu after click
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-slate-900/95 backdrop-blur-md shadow-2xl' : 'bg-transparent'
    }`}>
      {/* Top Bar - Trust Signals */}
      <div className="bg-amber-400 text-slate-900 text-sm font-bold py-2 text-center">
        <span className="hidden sm:inline">50,000+ members earned $12M+ in 2025</span>
        <span className="sm:hidden">50K+ members • $12M+ paid</span>
        <span className="ml-4">First $100 in 48 hours guaranteed</span>
      </div>

      {/* Main Nav */}
      <nav className="max-w-7xl mx-auto px-4 py-5 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3">
          <div className="text-3xl font-black text-amber-400">Train2Earn</div>
          <span className="hidden sm:inline text-xs bg-amber-400/20 text-amber-300 px-2 py-1 rounded">by ComoAI Labs</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center space-x-8">
          <button onClick={() => scrollToSection('tasks')} className="hover:text-amber-400 transition font-medium">
            AI Jobs
          </button>
          <button onClick={() => scrollToSection('how-it-works')} className="hover:text-amber-400 transition font-medium">
            How It Works
          </button>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-amber-400 font-bold">$15–$50/hr</span>
            <span className="text-gray-400">• Paid Weekly</span>
          </div>
          <Link to="/signin" className="hover:text-amber-400 transition">
            Log In
          </Link>
          <Link
            to="/signup"
            className="bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-bold px-6 py-3 rounded-full hover:shadow-xl transform hover:scale-105 transition"
          >
            Join Free → Earn Today
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden text-3xl"
        >
          {mobileMenuOpen ? '×' : '☰'}
        </button>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900/98 backdrop-blur-md border-t border-white/10">
          <div className="px-6 py-8 space-y-6 text-center">
            <button onClick={() => scrollToSection('tasks')} className="block text-xl hover:text-amber-400">
              AI Jobs Available
            </button>
            <button onClick={() => scrollToSection('how-it-works')} className="block text-xl hover:text-amber-400">
              How It Works
            </button>
            <div className="py-4">
              <p className="text-amber-400 font-bold text-2xl">$15–$50/hour</p>
              <p className="text-gray-400">No experience needed</p>
            </div>
            <Link to="/signin" className="block text-lg hover:text-amber-400">Log In</Link>
            <Link
              to="/signup"
              className="block bg-amber-400 text-slate-900 font-bold text-xl py-4 rounded-2xl mt-6"
              onClick={() => setMobileMenuOpen(false)}
            >
              Join Free – Start Earning Now
            </Link>
          </div>
        </div>
      )}

      {/* Hero Section (only shows when not scrolled) */}
      {!isScrolled && (
        <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 pt-32 pb-24 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center bg-amber-400/20 border border-amber-400/50 rounded-full px-6 py-2 text-sm font-bold mb-6">
              New members earn $100 in first 48 hours
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              Earn <span className="text-amber-400">$15–$50/hour</span><br />
              Training AI From Home
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-3xl mx-auto">
              No experience required • Work when you want • Get paid weekly via PayPal, M-pesa or bank<br />
              Join 50,000+ students, parents & freelancers rating data for ChatGPT, Google & Meta
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="bg-amber-400 text-slate-900 font-black text-2xl px-12 py-6 rounded-full hover:bg-amber-300 transform hover:scale-105 transition shadow-2xl"
              >
                Yes! Join Train2Earn – 100% Free
              </Link>
              <button
                onClick={() => scrollToSection('tasks')}
                className="text-white border-2 border-white/50 px-10 py-6 rounded-full text-xl hover:bg-white/10 transition"
              >
                See All Jobs →
              </button>
            </div>
            <div className="mt-10 flex justify-center gap-8 text-sm opacity-80">
              <span>3,000+ tasks daily</span>
              <span>48-hour support</span>
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;