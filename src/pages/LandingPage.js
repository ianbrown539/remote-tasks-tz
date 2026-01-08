// src/pages/LandingPage.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import {
  Check,
  Clock,
  Users,
  ArrowRight,
  Menu,
  X,
} from "lucide-react";

function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  const jobs = [
    { title: "Online Rater", pay: "Competitive hourly rates", desc: "Evaluate search results, chatbots, and advertisements" },
    { title: "Data Collector", pay: "Competitive hourly rates", desc: "Record audio, capture images, or create prompts" },
    { title: "Data Annotator", pay: "Competitive hourly rates", desc: "Label images and text using intuitive tools" },
    { title: "Search Evaluator", pay: "Competitive hourly rates", desc: "Enhance search and video platform performance" },
    { title: "Ad Reviewer", pay: "Competitive hourly rates", desc: "Review advertisements in minutes" },
    { title: "Specialized Projects", pay: "Premium rates available", desc: "Work on advanced AI tasks in specialized fields" },
  ];

  const steps = [
    { step: 1, title: "Create Account", desc: "Sign up for free in minutes" },
    { step: 2, title: "Qualify", desc: "Complete a brief assessment to unlock tasks" },
    { step: 3, title: "Begin Tasks", desc: "Select from a variety of available projects" },
    { step: 4, title: "Receive Payments", desc: "Get paid weekly via PayPal, M-Pesa, or bank transfer" },
  ];

  return (
    <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">
      {/* ===== HEADER ===== */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-slate-900/95 backdrop-blur-md shadow-lg" : "bg-transparent"}`}>
        <nav className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link
  to="/"
  className="text-4xl md:text-5xl font-extrabold flex items-center gap-3"
>
  Remote<span className="text-amber-400">Tasks</span>
 
</Link>


          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6 text-sm">
            <button onClick={() => scrollTo("jobs")} className="hover:text-amber-400 transition">Tasks</button>
            <button onClick={() => scrollTo("how")} className="hover:text-amber-400 transition">How It Works</button>
            <span className="text-blue-200">Remote AI tasks • Weekly payments</span>
            <Link to="/signin" className="hover:text-amber-400 transition">Log In</Link>
            <Link
              to="/signup"
              className="bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-semibold px-4 py-2 rounded-full hover:shadow-md transition"
            >
              Join Free
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-2xl">
            {mobileOpen ? <X /> : <Menu />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden bg-slate-900/95 backdrop-blur-md border-t border-white/10">
            <div className="px-6 py-6 space-y-4 text-center">
              <button onClick={() => scrollTo("jobs")} className="block text-base hover:text-amber-400">Tasks</button>
              <button onClick={() => scrollTo("how")} className="block text-base hover:text-amber-400">How It Works</button>
              <Link to="/signin" className="block text-base hover:text-amber-400">Log In</Link>
              <Link
                to="/signup"
                className="block bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-semibold py-2 rounded-full"
              >
                Join Free
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ===== HERO ===== */}
      <section className="pt-28 pb-16 px-4 text-center">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
            Contribute to Cutting-Edge AI Development
          </h1>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Work remotely on flexible AI training tasks. No experience required. Receive weekly payments via PayPal, M-Pesa, or bank transfer.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <Link
              to="/signup"
              className="bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-semibold text-base px-6 py-3 rounded-full hover:shadow-md transition flex items-center justify-center gap-2"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={() => scrollTo("jobs")}
              className="text-white border border-white/30 px-6 py-3 rounded-full text-base hover:bg-white/10 transition"
            >
              Explore Tasks
            </button>
          </div>
          <div className="flex justify-center gap-6 text-sm text-blue-200 flex-wrap">
            <span className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> Diverse task selection</span>
            <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> Responsive support</span>
            <span className="flex items-center gap-2"><Users className="w-4 h-4" /> Global contributor network</span>
          </div>
        </div>
      </section>

      {/* ===== JOBS ===== */}
      <section id="jobs" className="py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-3">AI Training Opportunities</h2>
          <p className="text-base text-blue-100 mb-8">Engage in tasks that shape the future of AI, with new projects added regularly</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job, i) => (
              <div
                key={i}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-amber-400/50 transition"
              >
                <h3 className="text-lg font-semibold text-white mb-2">{job.title}</h3>
                <p className="text-base font-medium text-amber-400 mb-3">{job.pay}</p>
                <p className="text-sm text-blue-100 mb-4">{job.desc}</p>
                <Link
                  to="/signup"
                  className="text-amber-400 font-medium text-sm hover:underline flex items-center justify-center gap-1"
                >
                  Start Now <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how" className="py-16 px-4 bg-white/5">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-3">Begin in Minutes</h2>
          <p className="text-base text-blue-100 mb-8">A straightforward process to join our AI training platform</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {steps.map((s) => (
              <div key={s.step} className="relative">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                  <div className="w-10 h-10 bg-amber-500 text-white rounded-full flex items-center justify-center text-base font-bold mb-3 mx-auto">
                    {s.step}
                  </div>
                  <h3 className="font-semibold text-white mb-2 text-sm">{s.title}</h3>
                  <p className="text-blue-200 text-xs">{s.desc}</p>
                </div>
                {s.step < 4 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-white/30 -translate-y-1/2" />
                )}
              </div>
            ))}
          </div>
          <Link
            to="/signup"
            className="mt-8 inline-block bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-semibold text-base px-6 py-3 rounded-full hover:shadow-md transition"
          >
            Join Now
          </Link>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="py-16 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">
            Shape the Future of AI
          </h2>
          <p className="text-base text-blue-100 mb-6">
            Join a global community of contributors working on innovative AI projects from anywhere
          </p>
          <Link
            to="/signup"
            className="inline-block bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-semibold text-base px-6 py-3 rounded-full hover:shadow-md transition"
          >
            Start Contributing
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default LandingPage;