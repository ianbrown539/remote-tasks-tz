// src/pages/LandingPage.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import {
  Check,
  Clock,
  Users,
  Zap,
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
    { title: "Online Rater", pay: "$15–$35/hr", desc: "Rate search results, chatbots, and ads" },
    { title: "Data Collector", pay: "$18–$40/hr", desc: "Record voice, take photos, or write prompts" },
    { title: "Data Annotator", pay: "$20–$45/hr", desc: "Label images and text with easy tools" },
    { title: "Search Evaluator", pay: "$16–$38/hr", desc: "Improve Google and YouTube results" },
    { title: "Ad Reviewer", pay: "$15–$30/hr", desc: "Review short ads in 2 minutes" },
    { title: "VIP Projects", pay: "Up to $80/hr", desc: "Medical, legal, and self-driving AI" },
  ];

  const steps = [
    { step: 1, title: "Sign Up Free", desc: "Create your account in 2 minutes" },
    { step: 2, title: "Take Quick Quiz", desc: "Answer 5 simple questions to unlock jobs" },
    { step: 3, title: "Start Tasks", desc: "Choose from 3,000+ available tasks" },
    { step: 4, title: "Get Paid Weekly", desc: "Every Thursday — fast and reliable" },
  ];




  return (
    <>
      {/* ===== HEADER ===== */}
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled ? "bg-white/95 backdrop-blur-sm shadow-sm" : "bg-transparent"
        }`}
      >
        <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 text-xs font-semibold py-1.5 text-center">
          50,000+ members earned $12M+ in 2025 • First $100 in 48h
        </div>

        <nav className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-slate-900">
            Outlier<span className="text-amber-500">AI</span>
             <span className="hidden sm:inline text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
              by ComoAI Labs
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6 text-sm">
            <button onClick={() => scrollTo("jobs")} className="text-slate-700 hover:text-amber-600">
              Jobs
            </button>
            <button onClick={() => scrollTo("how")} className="text-slate-700 hover:text-amber-600">
              How It Works
            </button>
            <span className="text-slate-500">
              <span className="font-bold text-amber-600">$15–$50/hr</span> • Paid Weekly
            </span>
            <Link to="/signin" className="text-slate-700 hover:text-amber-600">
              Log In
            </Link>
            <Link
              to="/signup"
              className="bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-bold px-5 py-2 rounded-full hover:shadow transition"
            >
              Join Free
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-xl text-slate-800"
          >
            {mobileOpen ? <X /> : <Menu />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 shadow-sm">
            <div className="px-6 py-6 space-y-4 text-center">
              <button onClick={() => scrollTo("jobs")} className="block text-base font-medium text-slate-700 hover:text-amber-600">
                Jobs
              </button>
              <button onClick={() => scrollTo("how")} className="block text-base font-medium text-slate-700 hover:text-amber-600">
                How It Works
              </button>
              <Link to="/signin" className="block text-base hover:text-amber-600">
                Log In
              </Link>
              <Link
                to="/signup"
                className="block bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-bold py-3 rounded-xl"
              >
                Join Free – Start Earning
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ===== HERO ===== */}
      <section className="pt-28 pb-12 bg-gradient-to-br from-slate-50 to-white px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
            <Zap className="w-3.5 h-3.5 mr-2" /> New members earn $100 in 48h
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-4">
            Earn <span className="text-amber-500">$15–$50/hr</span> Training AI From Home
          </h1>

          <p className="text-base text-slate-600 mb-8 max-w-2xl mx-auto">
            No experience needed • Work anytime • Paid every Thursday via M-Pesa, PayPal, or bank
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
            <Link
              to="/signup"
              className="bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-bold text-base px-8 py-3 rounded-full hover:shadow-md hover:scale-[1.02] transition flex items-center justify-center"
            >
              Join Free <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
            <button
              onClick={() => scrollTo("jobs")}
              className="text-slate-700 border border-slate-300 px-7 py-3 rounded-full text-base hover:border-slate-400 transition"
            >
              View Jobs
            </button>
          </div>

          <div className="flex justify-center gap-6 text-xs text-slate-500 flex-wrap">
            <span className="flex items-center"><Check className="w-3.5 h-3.5 mr-1 text-green-600" /> 3,000+ tasks</span>
            <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> 48h support</span>
            <span className="flex items-center"><Users className="w-3.5 h-3.5 mr-1" /> 50,000+ members</span>
          </div>
        </div>
      </section>

      {/* ===== JOBS ===== */}
      <section id="jobs" className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black text-slate-900 mb-3">Choose Your AI Job</h2>
          <p className="text-base text-slate-600 mb-8">New tasks every hour — start in minutes</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map((job, i) => (
              <div
                key={i}
                className="bg-slate-50 p-5 rounded-xl border border-slate-200 hover:border-amber-400 hover:shadow-sm transition"
              >
                <h3 className="text-lg font-bold text-slate-900 mb-1">{job.title}</h3>
                <p className="text-xl font-bold text-amber-600 mb-2">{job.pay}</p>
                <p className="text-slate-600 mb-3 text-sm">{job.desc}</p>
                <Link to="/signup" className="text-amber-600 font-semibold text-sm hover:underline flex items-center justify-center md:justify-start">
                  Start <ArrowRight className="ml-1 w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how" className="py-12 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black text-slate-900 mb-3">Start Earning in 10 Minutes</h2>
          <p className="text-base text-slate-600 mb-8">4 simple steps — no experience required</p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {steps.map((s) => (
              <div key={s.step} className="relative">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                  <div className="w-10 h-10 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm font-bold mb-3 mx-auto">
                    {s.step}
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1 text-sm">{s.title}</h3>
                  <p className="text-slate-600 text-xs">{s.desc}</p>
                </div>
                {s.step < 4 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-slate-300 -translate-y-1/2" />
                )}
              </div>
            ))}
          </div>

          <Link
            to="/signup"
            className="mt-8 inline-block bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-bold text-base px-8 py-3 rounded-full hover:shadow-md transition"
          >
            Join Now – Free
          </Link>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="py-10 bg-gradient-to-r from-slate-900 to-indigo-900 text-white text-center">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-3xl font-black text-amber-400">$1,800</div>
            <p className="text-slate-300 text-sm">Avg monthly earnings</p>
          </div>
          <div>
            <div className="text-3xl font-black text-amber-400">$46/hr</div>
            <p className="text-slate-300 text-sm">Top earners (60 days)</p>
          </div>
          <div>
            <div className="text-3xl font-black text-amber-400">4.9/5</div>
            <p className="text-slate-300 text-sm">From 12,000+ members</p>
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="py-12 bg-white">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl font-black text-slate-900 mb-4">
            Earn $500–$2,000/month From Home
          </h2>
          <p className="text-base text-slate-600 mb-6">
            Join 50,000+ people training AI for Google, Meta & OpenAI
          </p>
          <Link
            to="/signup"
            className="inline-block bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-black text-lg px-10 py-4 rounded-full hover:shadow-md hover:scale-[1.03] transition"
          >
            Join Outlier AI – Free Forever
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default LandingPage;
