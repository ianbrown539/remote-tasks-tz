import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-slate-900 text-white py-16 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Brand + Trust */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="text-3xl font-black text-amber-400">Train2Earn</div>
              <span className="text-xs bg-amber-400/20 px-3 py-1 rounded-full">by ComoAI Labs</span>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Join 50,000+ members earning $15–$50/hour training AI from home.<br />
              No experience required. Paid weekly.
            </p>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg">
                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>$12M+ paid out</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg">
                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>4.9/5 from 12K+ reviews</span>
              </div>
            </div>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-lg font-bold mb-5 text-amber-400">Community</h4>
            <ul className="space-y-3 text-gray-300">
              <li><button onClick={() => scrollToSection('tasks')} className="hover:text-amber-400 transition">Available AI Jobs</button></li>
              <li><button onClick={() => scrollToSection('how-it-works')} className="hover:text-amber-400 transition">How It Works</button></li>
              <li><Link to="/success-stories" className="hover:text-amber-400 transition">Success Stories</Link></li>
              <li><a href="https://discord.gg/Train2Earn" target="_blank" rel="noopener" className="hover:text-amber-400 transition">Join Discord</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-lg font-bold mb-5 text-amber-400">Resources</h4>
            <ul className="space-y-3 text-gray-300">
              <li><a href="/training-center" className="hover:text-amber-400 transition">Free Training Center</a></li>
              <li><a href="/blog" className="hover:text-amber-400 transition">Blog & Updates</a></li>
              <li><a href="/payment-proof" className="hover:text-amber-400 transition">Payment Proof</a></li>
              <li><a href="/faq" className="hover:text-amber-400 transition">FAQ</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-bold mb-5 text-amber-400">Support</h4>
            <ul className="space-y-3 text-gray-300">
              <li><a href="mailto:support@Train2Earn.com" className="hover:text-amber-400 transition">support@Train2Earn.com</a></li>
              <li><Link to="/contact" className="hover:text-amber-400 transition">Contact Us</Link></li>
              <li><Link to="/terms" className="hover:text-amber-400 transition">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-amber-400 transition">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p>&copy; 2025 Train2Earn by ComoAI Labs. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-amber-400 transition">Twitter</a>
            <a href="#" className="hover:text-amber-400 transition">LinkedIn</a>
            <a href="#" className="hover:text-amber-400 transition">YouTube</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;