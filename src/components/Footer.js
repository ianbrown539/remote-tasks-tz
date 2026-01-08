// src/components/Footer.js
import React from "react";
import { Link } from "react-router-dom";

function Footer() {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="bg-green-950 text-white py-10 border-t border-white/10 text-sm">
      <div className="max-w-7xl mx-auto px-4 space-y-10">
        {/* Top Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <div className="text-2xl font-black">
                Remote AI <span className="text-lime-400">Tasks</span>
              </div>
              <span className="text-xs bg-lime-400/20 px-2 py-0.5 rounded-full inline-block">
                by HandshakeAI Labs
              </span>
            </div>
            <p className="text-green-200 leading-relaxed">
              Join thousands of people worldwide contributing to AI development with flexible remote tasks.
              <br />
              No experience required • Weekly payments
            </p>

            {/* Trust signals */}
            <div className="flex flex-wrap gap-3 text-xs">
              <div className="flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-md">
                <svg className="w-3.5 h-3.5 text-lime-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Weekly payouts</span>
              </div>
              <div className="flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-md">
                <svg className="w-3.5 h-3.5 text-lime-400" fill="currentColor" viewBox="0 0 20 20">
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
            <h4 className="text-base font-bold mb-3 text-lime-400">Community</h4>
            <ul className="space-y-2 text-green-200">
              <li><button onClick={() => scrollToSection("jobs")} className="hover:text-lime-400 transition">Available Tasks</button></li>
              <li><button onClick={() => scrollToSection("how")} className="hover:text-lime-400 transition">How It Works</button></li>
              <li><Link to="/success-stories" className="hover:text-lime-400 transition">Member Stories</Link></li>
              <li>
                <a href="https://discord.gg/remote-tasks" target="_blank" rel="noreferrer" className="hover:text-lime-400 transition">
                  Join Discord
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-base font-bold mb-3 text-lime-400">Resources</h4>
            <ul className="space-y-2 text-green-200">
              <li><Link to="/training-center" className="hover:text-lime-400 transition">Training Center</Link></li>
              <li><Link to="/blog" className="hover:text-lime-400 transition">Blog</Link></li>
              <li><Link to="/payment-proof" className="hover:text-lime-400 transition">Payment Examples</Link></li>
              <li><Link to="/faq" className="hover:text-lime-400 transition">FAQ</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-base font-bold mb-3 text-lime-400">Support</h4>
            <ul className="space-y-2 text-green-200">
              <li><a href="mailto:support@remote-tasks.com" className="hover:text-lime-400 transition">support@remote-tasks.com</a></li>
              <li><Link to="/contact" className="hover:text-lime-400 transition">Contact Us</Link></li>
              <li><Link to="/terms" className="hover:text-lime-400 transition">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-lime-400 transition">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-xs text-green-300">
          <p>© 2026 RemoTasks by HandshakeAI Labs. All rights reserved.</p>
          <div className="flex gap-6 mt-3 md:mt-0">
            <a href="https://twitter.com/remo-tasks" target="_blank" rel="noreferrer" className="hover:text-lime-400 transition">Twitter</a>
            <a href="https://linkedin.com/company/remo-tasks" target="_blank" rel="noreferrer" className="hover:text-lime-400 transition">LinkedIn</a>
            <a href="https://youtube.com/@remo-tasks" target="_blank" rel="noreferrer" className="hover:text-lime-400 transition">YouTube</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;