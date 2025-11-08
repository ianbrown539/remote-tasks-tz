import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* ==================== FULL HEADER (Sticky + Hero) ==================== */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-slate-900/95 backdrop-blur-md shadow-2xl' : 'bg-transparent'
      }`}>
        {/* Trust Bar */}
        <div className="bg-amber-400 text-slate-900 text-sm font-bold py-2 text-center">
          <span className="hidden sm:inline">50,000+ members earned $12M+ in 2025</span>
          <span className="sm:hidden">50K+ members • $12M+ paid</span>
          <span className="ml-4">First $100 in 48 hours guaranteed</span>
        </div>

        {/* Nav */}
        <nav className="max-w-7xl mx-auto px-4 py-5 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-3">
            <div className="text-3xl font-black text-amber-400">Train2Earn</div>
            <span className="hidden sm:inline text-xs bg-amber-400/20 text-amber-300 px-2 py-1 rounded">by ComoAI Labs</span>
          </Link>

          <div className="hidden lg:flex items-center space-x-8">
            <button onClick={() => scrollToSection('tasks')} className="hover:text-amber-400 font-medium">AI Jobs</button>
            <button onClick={() => scrollToSection('how-it-works')} className="hover:text-amber-400 font-medium">How It Works</button>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-amber-400 font-bold">$15–$50/hr</span>
              <span className="text-gray-400">• Paid Weekly</span>
            </div>
            <Link to="/signin" className="hover:text-amber-400">Log In</Link>
            <Link to="/signup" className="bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-bold px-6 py-3 rounded-full hover:shadow-xl transform hover:scale-105 transition">
              Join Free → Earn Today
            </Link>
          </div>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden text-3xl">
            {mobileMenuOpen ? '×' : '☰'}
          </button>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-slate-900/98 backdrop-blur-md border-t border-white/10">
            <div className="px-6 py-8 space-y-6 text-center">
              <button onClick={() => scrollToSection('tasks')} className="block text-xl hover:text-amber-400">AI Jobs</button>
              <button onClick={() => scrollToSection('how-it-works')} className="block text-xl hover:text-amber-400">How It Works</button>
              <div className="py-4">
                <p className="text-amber-400 font-bold text-2xl">$15–$50/hour</p>
                <p className="text-gray-400">No experience needed</p>
              </div>
              <Link to="/signin" className="block text-lg hover:text-amber-400">Log In</Link>
              <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="block bg-amber-400 text-slate-900 font-bold text-xl py-4 rounded-2xl mt-6">
                Join Free – Start Earning Now
              </Link>
            </div>
          </div>
        )}

        {/* Hero (only shows at top) */}
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
                No experience required • Work when you want • Paid weekly via , M-pesa or bank<br />
                Join 50,000+ rating data for ChatGPT, Google & Meta
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/signup" className="bg-amber-400 text-slate-900 font-black text-2xl px-12 py-6 rounded-full hover:bg-amber-300 transform hover:scale-105 transition shadow-2xl">
                  Yes! Join Train2Earn – 100% Free
                </Link>
                <button onClick={() => scrollToSection('tasks')} className="text-white border-2 border-white/50 px-10 py-6 rounded-full text-xl hover:bg-white/10 transition">
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

      {/* ==================== MAIN CONTENT (starts below header) ==================== */}
      <main className="pt-32"> {/* This prevents overlap! */}

{/* ==================== WHY CHOOSE Train2Earn – Professional SVG Icons ==================== */}
<section className="py-24 bg-gray-50">
  <div className="max-w-7xl mx-auto px-4">
    <h2 className="text-4xl md:text-5xl font-black text-center mb-4 text-slate-800">
      Why 50,000+ People Choose Train2Earn
    </h2>
    <p className="text-xl text-center text-gray-600 mb-16">Real jobs. Real pay. Real freedom.</p>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
      {[
        {
          title: "No Experience Required",
          desc: "Students, beginners, career changers, or seasoned pros — we have tasks for every skill level.",
          svg: (
            <svg className="w-14 h-14 mx-auto mb-6 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.576.158-1.162.307-1.755.449a49.94 49.94 0 00-2.69.72 51.04 51.04 0 00-5.908 3.505 51.04 51.04 0 00-5.908-3.505 49.94 49.94 0 00-2.69-.72z"/>
              <path d="M12 14.5l4.5-2.25 4.5 2.25V17l-4.5 2.25L12 17l-4.5 2.25V17l4.5-2.25z"/>
            </svg>
          )
        },
        {
          title: "100% Flexible Schedule",
          desc: "Work 1 hour or 10. Log in anytime, from anywhere. Perfect for parents, students & digital nomads.",
          svg: (
            <svg className="w-14 h-14 mx-auto mb-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        },
        {
          title: "Fair & Transparent Pay",
          desc: "$15–$50/hour based on your skills • Annual reviews • Paid weekly via PayPal, M-pesa or bank transfer.",
          svg: (
            <svg className="w-14 h-14 mx-auto mb-6 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 21a1 1 0 01-1-1V8a1 1 0 011-1h3V4a1 1 0 011-1h8a1 1 0 011 1v3h3a1 1 0 011 1v12a1 1 0 01-1 1H4zm2-2h12V9h-3V6H8v3H5v10z"/>
              <path d="M10 14h4v2h-4v-2zm0-4h4v2h-4v-2z"/>
            </svg>
          )
        },
        {
          title: "More Training = More Money",
          desc: "Complete free training & tests → unlock VIP projects. Many members double their rate in 90 days.",
          svg: (
            <svg className="w-14 h-14 mx-auto mb-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 012-2h2a2 2 0 012 2v6m-6 0h6m5 4H5a2 2 0 01-2-2V7a2 2 0 012-2h5l2 2h5a2 2 0 012 2v10a2 2 0 01-2 2z" />
            </svg>
          )
        },
        {
          title: "Real Human Support",
          desc: "Responsive team replies within 48 hours on business days. Full training & tools provided.",
          svg: (
            <svg className="w-14 h-14 mx-auto mb-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L5 20V8a2 2 0 012-2h6.586z" />
            </svg>
          )
        },
        {
          title: "Trusted by AI Giants",
          desc: "Work on real projects for top AI labs training ChatGPT, Gemini, self-driving cars & medical AI.",
          svg: (
            <svg className="w-14 h-14 mx-auto mb-6 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          )
        }
      ].map((benefit, i) => (
        <div
          key={i}
          className="group bg-white p-10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-amber-400 text-center"
        >
          <div className="transform group-hover:scale-110 transition duration-300">
            {benefit.svg}
          </div>
          <h3 className="text-2xl font-black mb-4 text-slate-800 mt-2">
            {benefit.title}
          </h3>
          <p className="text-gray-600 leading-relaxed">
            {benefit.desc}
          </p>
        </div>
      ))}
    </div>
  </div>
</section>

        {/* AI Jobs Grid */}
        <section id="tasks" className="py-20">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-6">Choose Your AI Job</h2>
            <p className="text-xl mb-12 text-gray-600">New tasks every hour • Start in minutes</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: "Online Rater", pay: "$15–$35/hr", desc: "Rate text/audio/video for chatbots & search" },
                { title: "Data Collector", pay: "$18–$40/hr", desc: "Record voice, take photos, write prompts" },
                { title: "Data Annotator", pay: "$20–$45/hr", desc: "Label objects with easy tools" },
                { title: "Search Evaluator", pay: "$16–$38/hr", desc: "Rate Google/YouTube results" },
                { title: "Ad Evaluator", pay: "$15–$30/hr", desc: "Review ads in 2 mins" },
                { title: "VIP Projects", pay: "Up to $80/hr", desc: "Medical, legal, self-driving AI" }
              ].map((job, i) => (
                <div key={i} className="bg-white p-8 rounded-2xl shadow-xl border hover:border-amber-400 transition">
                  <h3 className="text-2xl font-bold mb-3">{job.title}</h3>
                  <p className="text-3xl font-bold text-amber-500 mb-4">{job.pay}</p>
                  <p className="text-gray-600 mb-6">{job.desc}</p>
                  <Link to="/signup" className="block bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 rounded-lg hover:from-blue-700">
                    Start Earning →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Earnings Proof + How It Works + Final CTA */}
        <section className="bg-indigo-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-10">Real People. Real Earnings.</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16">
              <div className="bg-white/10 backdrop-blur rounded-2xl p-8"><p className="text-5xl font-bold text-amber-400">$1,800</p><p>Earned last month</p></div>
              <div className="bg-white/10 backdrop-blur rounded-2xl p-8"><p className="text-5xl font-bold text-amber-400">$46/hr</p><p>After 60 days</p></div>
              <div className="bg-white/10 backdrop-blur rounded-2xl p-8"><p className="text-5xl font-bold text-amber-400">4.9/5</p><p>From 12,000+ reviews</p></div>
            </div>
          </div>
        </section>
{/* ==================== HOW IT WORKS – Professional SVG Icons ==================== */}
<section id="how-it-works" className="py-24 bg-gray-50">
  <div className="max-w-7xl mx-auto px-4 text-center">
    <h2 className="text-4xl md:text-5xl font-black mb-4 text-slate-800">
      Start Earning in 10 Minutes
    </h2>
    <p className="text-xl text-gray-600 mb-16">No experience needed • 4 simple steps</p>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
      {[
        {
          title: "Sign Up Free",
          desc: "Create your account in 2 minutes — no credit card required.",
          svg: (
            <svg className="w-16 h-16 mx-auto mb-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          )
        },
        {
          title: "Take Quick Quiz",
          desc: "Answer 5 simple questions to unlock your first paid tasks.",
          svg: (
            <svg className="w-16 h-16 mx-auto mb-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )
        },
        {
          title: "Start Tasks",
          desc: "3,000+ AI training jobs available right now — pick any.",
          svg: (
            <svg className="w-16 h-16 mx-auto mb-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          )
        },
        {
          title: "Get Paid Weekly",
          desc: "Every Thursday via PayPal, M-pesa or bank transfer — on time, every time.",
          svg: (
            <svg className="w-16 h-16 mx-auto mb-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        }
      ].map((step, i) => (
        <div
          key={i}
          className="group bg-white p-10 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-amber-400"
        >
          <div className="transform group-hover:scale-110 transition">{step.svg}</div>
          <h3 className="text-2xl font-bold mb-3 text-slate-800">{step.title}</h3>
          <p className="text-gray-600 leading-relaxed">{step.desc}</p>
          <div className="mt-6 text-5xl font-black text-amber-500/10">{i + 1}</div>
        </div>
      ))}
    </div>

    <div className="mt-16">
      <Link
        to="/signup"
        className="inline-block bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-black text-xl px-12 py-6 rounded-full hover:shadow-2xl transform hover:scale-105 transition"
      >
        Yes! I Want to Start Earning Now
      </Link>
    </div>
  </div>
</section>

        <section className="bg-gradient-to-r from-amber-400 to-orange-500 py-20">
          <div className="max-w-4xl mx-auto text-center px-4">
            <h2 className="text-5xl font-bold text-slate-900 mb-6">Earn $500–$2,000/month From Home</h2>
            <Link to="/signup" className="bg-slate-900 text-white font-black text-2xl px-16 py-6 rounded-full hover:bg-slate-800 inline-block">
              Join Train2Earn Now – Free Forever
            </Link>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}

export default LandingPage;