// src/components/Footer.js
import React from "react";
import { Link } from "react-router-dom";

function Footer() {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="bg-slate-900 text-white py-10 border-t border-white/10 text-sm">
      <div className="max-w-7xl mx-auto px-4 space-y-10">
        {/* Top Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-amber-400">Remote AI Tasks</span>
              <span className="text-xs bg-amber-400/20 px-2 py-0.5 rounded-full">
                by HandshakeAI Labs
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Join thousands of people worldwide contributing to AI development with flexible remote tasks.
              <br />
              No experience required • Weekly payments
            </p>

            {/* Removed $12M+ and 4.9★ claims — replaced with safe trust signals */}
            <div className="flex flex-wrap gap-3 text-xs">
              <div className="flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-md">
                <svg className="w-3.5 h-3.5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Weekly payouts</span>
              </div>
              <div className="flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-md">
                <svg className="w-3.5 h-3.5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Trusted globally</span>
              </div>
            </div>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-base font-bold mb-3 text-amber-400">Community</h4>
            <ul className="space-y-2 text-slate-300">
              <li><button onClick={() => scrollToSection("jobs")} className="hover:text-amber-400">Available Tasks</button></li>
              <li><button onClick={() => scrollToSection("how")} className="hover:text-amber-400">How It Works</button></li>
              <li><Link to="/success-stories" className="hover:text-amber-400">Member Stories</Link></li>
              <li>
                <a href="https://discord.gg/remote-tasks" target="_blank" rel="noreferrer" className="hover:text-amber-400">
                  Join Discord
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-base font-bold mb-3 text-amber-400">Resources</h4>
            <ul className="space-y-2 text-slate-300">
              <li><Link to="/training-center" className="hover:text-amber-400">Training Center</Link></li>
              <li><Link to="/blog" className="hover:text-amber-400">Blog</Link></li>
              <li><Link to="/payment-proof" className="hover:text-amber-400">Payment Examples</Link></li>
              <li><Link to="/faq" className="hover:text-amber-400">FAQ</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-base font-bold mb-3 text-amber-400">Support</h4>
            <ul className="space-y-2 text-slate-300">
              <li><a href="mailto:support@remote-tasks.com" className="hover:text-amber-400">support@remote-tasks.com</a></li>
              <li><Link to="/contact" className="hover:text-amber-400">Contact Us</Link></li>
              <li><Link to="/terms" className="hover:text-amber-400">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-amber-400">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-xs text-slate-400">
          <p>© 2025 Remote Tasks by HandshakeAI Labs. All rights reserved.</p>
          <div className="flex gap-4 mt-3 md:mt-0">
            <a href="https://twitter.com/remote-tasks" target="_blank" rel="noreferrer" className="hover:text-amber-400">Twitter</a>
            <a href="https://linkedin.com/company/remote-tasks" target="_blank" rel="noreferrer" className="hover:text-amber-400">LinkedIn</a>
            <a href="https://youtube.com/@remote-tasks" target="_blank" rel="noreferrer" className="hover:text-amber-400">YouTube</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;