// src/pages/LandingPage.js - TANZANIA EDITION 🇹🇿
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import {
  Clock,
  ArrowRight,
  Menu,
  X,
  Smartphone,
  DollarSign,
  Zap,
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
    { 
      title: "Tathmini ya Matokeo", 
      titleEn: "Online Rater",
      pay: "Hadi TSh 50,000/wiki", 
      desc: "Tathmini matokeo ya utafutaji, chatbots, na matangazo" 
    },
    { 
      title: "Mkusanyaji wa Data", 
      titleEn: "Data Collector",
      pay: "Hadi TSh 45,000/wiki", 
      desc: "Rekodi sauti, piga picha, au unda maswali" 
    },
    { 
      title: "Uwekaji Alama", 
      titleEn: "Data Annotator",
      pay: "Hadi TSh 55,000/wiki", 
      desc: "Weka alama kwa picha na maandishi kwa zana rahisi" 
    },
    { 
      title: "Mtathmini wa Utafutaji", 
      titleEn: "Search Evaluator",
      pay: "Hadi TSh 48,000/wiki", 
      desc: "Boresha utendaji wa mitandao ya utafutaji na video" 
    },
    { 
      title: "Mkaguzi wa Matangazo", 
      titleEn: "Ad Reviewer",
      pay: "Hadi TSh 42,000/wiki", 
      desc: "Kagua matangazo kwa dakika chache" 
    },
    { 
      title: "Miradi Maalum", 
      titleEn: "Specialized Projects",
      pay: "Malipo ya Juu Zaidi", 
      desc: "Fanya kazi za AI za kina katika maeneo maalum" 
    },
  ];

  const steps = [
    { 
      step: 1, 
      title: "Fungua Akaunti", 
      titleEn: "Create Account",
      desc: "Jisajili bure kwa dakika chache tu" 
    },
    { 
      step: 2, 
      title: "Maliza Onboarding", 
      titleEn: "Complete Onboarding",
      desc: "Fanya kazi moja ya kwanza na pata pesa zako" 
    },
    { 
      step: 3, 
      title: "Anza Kazi", 
      titleEn: "Begin Tasks",
      desc: "Chagua kutoka kwa kazi nyingi zinazopatikana" 
    },
    { 
      step: 4, 
      title: "Pata Pesa", 
      titleEn: "Get Paid",
      desc: "Toa pesa kila Alhamisi kupitia M-Pesa, PayPal au benki" 
    },
  ];

  const benefits = [
    { icon: Smartphone, text: "Fanya kazi na simu yako", textEn: "Work from your phone" },
    { icon: Clock, text: "Wakati unao uamuzi", textEn: "Flexible schedule" },
    { icon: DollarSign, text: "Malipo ya haraka", textEn: "Fast payments" },
    { icon: Zap, text: "Anza leo, pata pesa kesho", textEn: "Start today, earn tomorrow" },
  ];

  return (
    <div className="bg-gradient-to-br from-green-950 via-green-900 to-emerald-900 text-white min-h-screen">
      {/* ===== HEADER ===== */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-green-950/95 backdrop-blur-md shadow-lg" : "bg-transparent"}`}>
        <nav className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="text-3xl md:text-4xl font-extrabold flex items-center gap-2">
            Remote AI<span className="text-lime-400">Tasks</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6 text-sm">
            <button onClick={() => scrollTo("jobs")} className="hover:text-lime-400 transition">Kazi</button>
            <button onClick={() => scrollTo("how")} className="hover:text-lime-400 transition">Jinsi Inavyofanya</button>
            <span className="text-green-200 text-xs">🇹🇿 Kazi za mtandaoni • Malipo kila wiki</span>
            <Link to="/signin" className="hover:text-lime-400 transition">Ingia</Link>
            <Link
              to="/signup"
              className="bg-gradient-to-r from-lime-400 to-green-500 text-slate-900 font-semibold px-5 py-2.5 rounded-full hover:shadow-md hover:shadow-lime-300/50 transition"
            >
              Jisajili Bure
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-2xl">
            {mobileOpen ? <X /> : <Menu />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden bg-green-950/95 backdrop-blur-md border-t border-white/10">
            <div className="px-6 py-6 space-y-4 text-center">
              <button onClick={() => scrollTo("jobs")} className="block text-base hover:text-lime-400">Kazi</button>
              <button onClick={() => scrollTo("how")} className="block text-base hover:text-lime-400">Jinsi Inavyofanya</button>
              <Link to="/signin" className="block text-base hover:text-lime-400">Ingia</Link>
              <Link
                to="/signup"
                className="block bg-gradient-to-r from-lime-400 to-green-500 text-slate-900 font-semibold py-3 rounded-full"
              >
                Jisajili Bure
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ===== HERO ===== */}
      <section className="pt-28 pb-16 px-4 text-center relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-lime-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-500 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="inline-block bg-lime-400/20 border border-lime-400 text-lime-300 px-3 py-1.5 rounded-full text-xs font-semibold mb-4">
            🇹🇿 Made for Tanzania • Tengenezwa kwa Watanzania
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4">
            Pata Pesa Kwa<br/>
            <span className="text-lime-400">Kufundisha AI</span> 🚀
          </h1>
          
          <p className="text-lg md:text-xl text-green-100 mb-3 max-w-3xl mx-auto">
            Fanya kazi za mtandaoni, malipo kila wiki
          </p>
          
          <p className="text-sm text-green-200 mb-8 max-w-2xl mx-auto">
            Hakuna ujuzi maalum unahitajika. Fanya kazi ukiwa nyumbani, kwa simu yako. 
            Pata malipo kupitia M-Pesa, PayPal au benki yako.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <Link
              to="/signup"
              className="bg-gradient-to-r from-lime-400 to-green-500 text-green-950 font-semibold text-sm px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-lime-300/30 transition hover:scale-105 flex items-center justify-center gap-2"
            >
              Anza Sasa - Bure <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={() => scrollTo("jobs")}
              className="text-white border border-lime-400 px-6 py-3 rounded-lg text-sm font-medium hover:bg-lime-400/10 transition"
            >
              Angalia Kazi
            </button>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {benefits.map((benefit, i) => {
              const Icon = benefit.icon;
              return (
                <div key={i} className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20">
                  <Icon className="w-6 h-6 text-lime-400 mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-white">{benefit.text}</p>
                  <p className="text-[10px] text-green-300">{benefit.textEn}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== SOCIAL PROOF ===== */}
      <section className="py-10 px-4 bg-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-gradient-to-br from-lime-400/20 to-emerald-500/20 backdrop-blur-md rounded-xl p-6 border border-lime-400/30">
              <div className="text-3xl font-bold text-lime-400 mb-1">500+</div>
              <p className="text-white font-medium text-sm mb-0.5">Watanzania Wanafanya Kazi</p>
              <p className="text-green-300 text-xs">Tanzanians Working</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-400/20 to-green-500/20 backdrop-blur-md rounded-xl p-6 border border-emerald-400/30">
              <div className="text-3xl font-bold text-emerald-400 mb-1">TSh 2M+</div>
              <p className="text-white font-medium text-sm mb-0.5">Imelipwa Hadi Sasa</p>
              <p className="text-green-300 text-xs">Paid Out to Date</p>
            </div>
            <div className="bg-gradient-to-br from-green-400/20 to-lime-500/20 backdrop-blur-md rounded-xl p-6 border border-green-400/30">
              <div className="text-3xl font-bold text-green-400 mb-1">24/7</div>
              <p className="text-white font-medium text-sm mb-0.5">Msaada wa Haraka</p>
              <p className="text-green-300 text-xs">Fast Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== JOBS ===== */}
      <section id="jobs" className="py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Kazi Zinazopatikana
          </h2>
          <p className="text-sm text-green-100 mb-10">
            Chagua kazi unayopenda, fanya kwa wakati wako
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {jobs.map((job, i) => (
              <div
                key={i}
                className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20 hover:border-lime-400 hover:shadow-lg hover:shadow-lime-400/20 transition-all"
              >
                <div className="bg-lime-400/20 text-lime-400 text-[10px] font-bold px-2 py-1 rounded-full inline-block mb-3">
                  {job.titleEn}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{job.title}</h3>
                <p className="text-base font-semibold text-lime-400 mb-3">{job.pay}</p>
                <p className="text-xs text-green-100 mb-4 leading-relaxed">{job.desc}</p>
                <Link
                  to="/signup"
                  className="text-lime-400 font-semibold text-xs hover:text-lime-300 flex items-center justify-center gap-1 transition"
                >
                  Anza Kazi Hii <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how" className="py-16 px-4 bg-gradient-to-b from-green-900/50 to-green-950/50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Jinsi Ya Kuanza
          </h2>
          <p className="text-sm text-green-100 mb-2">
            Ni rahisi! Anza kufanya kazi kwa hatua 4 tu
          </p>
          <p className="text-xs text-green-300 mb-10">
            How It Works - Simple 4-step process
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-10">
            {steps.map((s) => (
              <div key={s.step} className="relative">
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl p-5 border border-white/20 h-full">
                  <div className="w-10 h-10 bg-gradient-to-br from-lime-400 to-emerald-500 text-green-950 rounded-full flex items-center justify-center text-lg font-bold mb-3 mx-auto shadow-lg">
                    {s.step}
                  </div>
                  <h3 className="font-semibold text-white mb-1 text-base">{s.title}</h3>
                  <p className="text-green-300 text-[10px] mb-2">{s.titleEn}</p>
                  <p className="text-green-200 text-xs leading-relaxed">{s.desc}</p>
                </div>
                {s.step < 4 && (
                  <div className="hidden md:block absolute top-1/2 -right-2.5 w-5 h-0.5 bg-lime-400/30 -translate-y-1/2" />
                )}
              </div>
            ))}
          </div>

          <Link
            to="/signup"
            className="inline-block bg-gradient-to-r from-lime-400 to-green-500 text-green-950 font-semibold text-sm px-8 py-3 rounded-lg hover:shadow-lg hover:shadow-lime-300/30 transition hover:scale-105"
          >
            Jisajili Sasa - Bure Kabisa! 🚀
          </Link>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 text-center">
            Wenzetu Wanasema Nini?
          </h2>
          <p className="text-sm text-green-100 mb-10 text-center">What Our Workers Say</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-10 h-10 bg-lime-400 rounded-full flex items-center justify-center text-green-950 font-bold text-sm">
                  J
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">Juma M.</p>
                  <p className="text-[10px] text-green-300">Dar es Salaam</p>
                </div>
              </div>
              <p className="text-green-100 text-xs mb-2 leading-relaxed">
                "Nimekuwa nikipata TSh 40,000 kila wiki. Kazi ni rahisi sana na malipo yanakuja haraka!"
              </p>
              <p className="text-green-400 text-[10px] italic">
                "I've been earning 40k weekly. Work is easy and payments are fast!"
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-10 h-10 bg-emerald-400 rounded-full flex items-center justify-center text-green-950 font-bold text-sm">
                  A
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">Amina K.</p>
                  <p className="text-[10px] text-green-300">Arusha</p>
                </div>
              </div>
              <p className="text-green-100 text-xs mb-2 leading-relaxed">
                "Naweza kufanya kazi wakati wowote. Hii ni perfect kwa mama wa nyumbani kama mimi!"
              </p>
              <p className="text-green-400 text-[10px] italic">
                "I can work anytime. Perfect for stay-at-home moms like me!"
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-10 h-10 bg-green-400 rounded-full flex items-center justify-center text-green-950 font-bold text-sm">
                  H
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">Hassan S.</p>
                  <p className="text-[10px] text-green-300">Mwanza</p>
                </div>
              </div>
              <p className="text-green-100 text-xs mb-2 leading-relaxed">
                "Pesa inatumwa M-Pesa moja kwa moja. Ninapenda sana huduma hii!"
              </p>
              <p className="text-green-400 text-[10px] italic">
                "Money sent directly to M-Pesa. I love this service!"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="py-16 px-4 text-center bg-gradient-to-br from-lime-400/10 via-emerald-500/10 to-green-600/10 border-y border-lime-400/20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Anza Leo, Pata Pesa Kesho! 💰
          </h2>
          <p className="text-base text-green-100 mb-2 font-medium">
            Jiunge na mamia ya Watanzania wanaopata kipato cha ziada
          </p>
          <p className="text-sm text-green-200 mb-8">
            Join hundreds of Tanzanians earning extra income working from home
          </p>
          <Link
            to="/signup"
            className="inline-block bg-gradient-to-r from-lime-400 to-green-500 text-green-950 font-semibold text-base px-10 py-3.5 rounded-lg hover:shadow-xl hover:shadow-lime-300/30 transition hover:scale-105"
          >
            Jisajili Bure Sasa! 🚀
          </Link>
          <p className="text-xs text-green-300 mt-6 space-y-1">
            <span className="block">✅ Bila malipo ya kujisajili • No signup fees</span>
            <span className="block">✅ Anza kufanya kazi mara moja • Start working immediately</span>
            <span className="block">✅ Malipo kila wiki kupitia M-Pesa • Weekly M-Pesa payments</span>
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default LandingPage;