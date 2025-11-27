// src/pages/UserDashboard.js
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  doc,
  onSnapshot,
  updateDoc,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import {
  DollarSign, Calendar, Activity, Briefcase, CheckCircle,
  ChevronRight, LogOut, Menu, X, Crown, Smartphone, PlayCircle,
  RefreshCw, CheckCircle2, Bell, User, Star
} from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import Confetti from 'react-confetti';
import 'react-toastify/dist/ReactToastify.css';
import availableTasks from '../data/availableTasks';
import { useAuth } from '../context/AuthContext';

// =============================
// EXCHANGE RATE SIMULATOR (FIXED & CLEAN)
// =============================

class ExchangeRateSimulator {
  constructor() {
    this.targetRate = 125.00;
    this.currentRate = 125.00;
    this.lastUpdate = Date.now();
    this.dailyBias = (Math.random() - 0.5) * 0.3;
    this.updateCounter = 0;
  }

  getCurrentRate() {
    const now = Date.now();
    const secondsSinceLast = (now - this.lastUpdate) / 1000;

    if (secondsSinceLast > 15 + Math.random() * 30) {
      this._updateRate();
      this.lastUpdate = now;
    }

    return Math.round(this.currentRate * 10000) / 10000;
  }

  _updateRate() {
    this.updateCounter++;

    const noise = (Math.random() - 0.5) * 0.06;
    const distanceFromTarget = this.targetRate - this.currentRate;
    const reversion = distanceFromTarget * 0.04;
    const dayFraction = Date.now() / (86400 * 1000);
    const trend = this.dailyBias * (dayFraction - Math.floor(dayFraction));

    this.currentRate += noise + reversion + trend * 0.0001;
    this.currentRate = Math.max(120.00, Math.min(130.00, this.currentRate));

    if (this.updateCounter % 150 === 0) {
      this.targetRate += (Math.random() - 0.5) * 1.5;
      this.targetRate = Math.max(121, Math.min(129, this.targetRate));
    }
  }
}

// Single shared instance
const exchangeRateSimulator = new ExchangeRateSimulator();

// Public functions — NOW SAFE
export const getCurrentExchangeRate = () => exchangeRateSimulator.getCurrentRate();

export const formatKES = (usd) => {
  const rate = getCurrentExchangeRate();
  const kes = usd * rate;
  const formatted = kes.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `Ksh.${formatted}`;
};

// VIP Config
const VIP_CONFIG = {
  Bronze: { priceUSD: 0.99, dailyTasks: 4 },
  Silver: { priceUSD: 3.99, dailyTasks: 7 },
  Gold:   { priceUSD: 9.99, dailyTasks: 10 },
};

const getNextThursday = () => {
  const now = new Date();
  const thursday = new Date(now);
  thursday.setDate(now.getDate() + ((4 - now.getDay() + 7) % 7 || 7));
  thursday.setHours(23, 59, 59, 0);
  return thursday;
};

const getLastThursday = () => {
  const now = new Date();
  const lastThursday = new Date(now);
  const daysSinceThursday = (now.getDay() + 3) % 7;
  lastThursday.setDate(now.getDate() - daysSinceThursday);
  lastThursday.setHours(0, 0, 0, 0);
  return lastThursday;
};

const formatTime = (ms) => {
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  return `${days}d ${hours}h ${minutes}m`;
};

const difficultyColors = {
  Beginner: 'bg-green-100 text-green-700 border-green-200',
  Intermediate: 'bg-blue-100 text-blue-700 border-blue-200',
  Advanced: 'bg-purple-100 text-purple-700 border-purple-200',
  Expert: 'bg-red-100 text-red-700 border-red-200',
};

const statusConfig = {
  'in-progress': { label: 'In Progress', icon: PlayCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
  completed: { label: 'Under Review', icon: RefreshCw, color: 'text-orange-600', bg: 'bg-orange-50' },
  approved: { label: 'Approved', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
};

const normalizePhoneNumber = (input) => {
  if (!input) return null;
  const cleaned = input.replace(/\D/g, '');
  if (/^0[71]\d{8}$/.test(input)) return `254${cleaned.slice(1)}`;
  if (/^\+254[71]\d{8}$/.test(input)) return cleaned;
  if (/^254[71]\d{8}$/.test(cleaned)) return cleaned;
  return null;
};

const isValidMpesaNumber = (input) =>
  /^0[17]\d{8}$/.test(input) || /^\+254[17]\d{8}$/.test(input);

const UserDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [userProfile, setUserProfile] = useState(null);
  const [myTasks, setMyTasks] = useState([]);
  const [showVIPModal, setShowVIPModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // FIXED
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedVIP, setSelectedVIP] = useState('');
  const [mpesaNumber, setMpesaNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(getNextThursday() - new Date());
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const hasResetToday = useRef(false);

  // DERIVED VALUES
  const hasCompletedOnboarding = userProfile?.hasDoneOnboardingTask || false;
  const onboardingTask = availableTasks[0];
  const tasksToShow = hasCompletedOnboarding ? availableTasks : [onboardingTask];
  const categories = ['all', ...new Set(tasksToShow.map(t => t.category))];
  const filteredTasks = selectedCategory === 'all' ? tasksToShow : tasksToShow.filter(t => t.category === selectedCategory);

  const myTaskMap = {};
  myTasks.forEach(t => { myTaskMap[t.id.split('_')[0]] = t; });

  const todayTasks = myTasks.filter(t => new Date(t.startedAt).toDateString() === new Date().toDateString());
  const approvedCount = todayTasks.filter(t => t.status === 'approved').length;
  const todayEarnings = todayTasks.filter(t => t.status === 'approved').reduce((s, t) => s + t.paymentAmount, 0);

  const lastThursday = getLastThursday();
  const nextThursday = getNextThursday();
  const dateRange = `${lastThursday.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - ${nextThursday.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`;

  const todayCompletedCount = myTasks.filter(t =>
    new Date(t.startedAt).toDateString() === new Date().toDateString() &&
    ['completed', 'approved'].includes(t.status)
  ).length;

  const maxDaily = userProfile?.isVIP
    ? VIP_CONFIG[userProfile.tier?.replace('VIP', '')]?.dailyTasks || 1
    : 1;

  const dailyLimitReached = todayCompletedCount >= maxDaily;

  // EFFECTS
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getNextThursday() - new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);


const NotificationSound = () => {
  useEffect(() => {
    window.playNotificationSound = () => {
      const audio = new Audio("/sounds/notification.mp3");   // ← change path if you used the other folder
      // const audio = new Audio("/notification.mp3");       // ← use this line instead if you put it directly in public/
      audio.currentTime = 0;
      audio.play().catch(() => {}); // silently ignore autoplay restrictions
    };
  }, []);
  return null;
};

  const addNotification = useCallback((msg) => {
    setNotifications(prev => {
      const updated = [{ id: Date.now().toString(), message: msg, timestamp: new Date().toISOString(), read: false }, ...prev];
      if (currentUser?.uid) localStorage.setItem(`notifications_${currentUser.uid}`, JSON.stringify(updated));
      // THIS LINE PLAYS THE SOUND
    if (window.playNotificationSound) {
      window.playNotificationSound();
    }      
      return updated;
    });
  }, [currentUser?.uid]);


  useEffect(() => {
    if (!currentUser) {
      navigate('/signin', { replace: true });
      return;
    }

    const unsub = onSnapshot(doc(db, 'users', currentUser.uid), (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      setUserProfile(data);

      const today = new Date().toLocaleDateString('en-CA');
      const lastReset = data.lastTaskResetDate?.toDate?.().toLocaleDateString('en-CA');
      const maxTasks = data.isVIP ? VIP_CONFIG[data.tier?.replace('VIP', '')]?.dailyTasks || 1 : 1;

      if (!hasResetToday.current && lastReset !== today) {
        hasResetToday.current = true;
        updateDoc(doc(db, 'users', currentUser.uid), {
          dailyTasksRemaining: maxTasks,
          lastTaskResetDate: serverTimestamp(),
        }).catch(() => {});
      }
    });

    const savedTasks = localStorage.getItem(`myTasks_${currentUser.uid}`);
    if (savedTasks) setMyTasks(JSON.parse(savedTasks));

    const savedNotifs = localStorage.getItem(`notifications_${currentUser.uid}`);
    if (savedNotifs) setNotifications(JSON.parse(savedNotifs));

    return () => unsub();
  }, [currentUser, navigate]);

  // AUTO-APPROVAL (Onboarding = instant)
  useEffect(() => {
    if (!currentUser) return;

    const interval = setInterval(() => {
      setMyTasks(prevTasks => {
        let changed = false;
        const toApproveNow = [];

        const updatedTasks = prevTasks.map(task => {
          if (task.status !== 'completed') return task;

          const isOnboarding = task.id.startsWith(availableTasks[0]?.id);

          if (isOnboarding && !userProfile?.hasDoneOnboardingTask) {
            task.status = 'approved';
            task.approvedAt = new Date();
            toApproveNow.push(task);
            changed = true;
          } else if (!task.approvalScheduled) {
            task.approvalScheduled = Date.now() + 20000 + Math.random() * 20000;
            changed = true;
          } else if (task.approvalScheduled && Date.now() >= task.approvalScheduled) {
            task.status = 'approved';
            task.approvedAt = new Date();
            toApproveNow.push(task);
            changed = true;
          }
          return task;
        });

        if (toApproveNow.length > 0) {
          const total = toApproveNow.reduce((s, t) => s + t.paymentAmount, 0);
          const hasOnboarding = toApproveNow.some(t => t.id.startsWith(availableTasks[0]?.id));

          updateDoc(doc(db, 'users', currentUser.uid), {
            currentbalance: increment(total),
            thisMonthEarned: increment(total),
            totalEarned: increment(total),
            ApprovedTasks: increment(toApproveNow.length),
            ...(hasOnboarding && { hasDoneOnboardingTask: true })
          });

          toApproveNow.forEach(task => {
            const msg = hasOnboarding
              ? `Welcome! $${task.paymentAmount.toFixed(2)} for onboarding task approved successfully !`
              : `+$${task.paymentAmount.toFixed(2)} for completed task approved!`;
            toast.success(msg);
            addNotification(msg);
          });

          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 6000);
        }

        if (changed) {
          localStorage.setItem(`myTasks_${currentUser.uid}`, JSON.stringify(updatedTasks));
        }

        return updatedTasks;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [currentUser, userProfile?.hasDoneOnboardingTask, addNotification]);

  // FUNCTIONS
  const startTask = (task) => {
    if (dailyLimitReached) {
      setShowVIPModal(true);
      return;
    }

    const newTask = {
      id: `${task.id}_${Date.now()}`,
      ...task,
      status: 'in-progress',
      startedAt: new Date(),
      completedQuestions: 0,
      totalQuestions: task.questions.length,
    };

    setMyTasks(prev => {
      const updated = [...prev, newTask];
      localStorage.setItem(`myTasks_${currentUser.uid}`, JSON.stringify(updated));
      return updated;
    });

    toast.success('Task Started!', { icon: <Briefcase className="w-5 h-5" /> });
    navigate(`/working/${task.id}`);
  };

  const markAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem(`notifications_${currentUser.uid}`, JSON.stringify(updated));
  };

  
const handleRealVIPUpgrade = async () => {
  if (!selectedVIP) return toast.error('Select a VIP tier');
  
  const normalized = normalizePhoneNumber(mpesaNumber);
  if (!normalized || !isValidMpesaNumber(mpesaNumber)) 
    return toast.error('Invalid M-Pesa number');

  setIsProcessing(true);

  // LIVE EXCHANGE RATE — NO MORE HARD CODED 129!
  const liveRate = getCurrentExchangeRate();
  const usdPrice = VIP_CONFIG[selectedVIP].priceUSD;
  const kesAmount = Math.round(usdPrice * liveRate); // M-Pesa expects whole numbers

  const clientReference = `VIP_${currentUser.uid}_${Date.now()}`;

  try {
    const res = await fetch('/api/stk-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phoneNumber: normalized,
        amount: kesAmount,                    // Now using real live rate
        reference: clientReference,
        description: `${selectedVIP} VIP Upgrade • $${usdPrice} USD @ ${liveRate.toFixed(2)} KES/USD`,
      }),
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'STK push failed');

    toast.info(
      <div className="text-xs">
        <p>STK push sent to {mpesaNumber}</p>
        <p className="text-emerald-300 mt-1">
          Amount: Ksh.{kesAmount.toLocaleString()} (≈ ${usdPrice} @ {liveRate.toFixed(2)} KES/USD)
        </p>
      </div>,
      { autoClose: 15000 }
    );


    const poll = setInterval(async () => {
      try {
        const statusRes = await fetch(`/api/transaction-status?reference=${encodeURIComponent(data.payheroReference)}`);
        const statusData = await statusRes.json();

        if (statusData.status === 'SUCCESS') {
          clearInterval(poll);
          toast.success('Payment confirmed! VIP upgraded 🎉');
          await finalizeVIPUpgrade();
        } else if (['FAILED', 'CANCELLED'].includes(statusData.status)) {
          clearInterval(poll);
          toast.error('Payment failed or cancelled');
          setIsProcessing(false);
        }
      } catch (e) {
        console.error('Polling error:', e);
      }
    }, 5000);

    // Timeout after 2 minutes
    setTimeout(() => {
      clearInterval(poll);
      if (isProcessing) {
        toast.warn('Payment timed out — check your phone');
        setIsProcessing(false);
      }
    }, 120000);

  } catch (e) {
    toast.error(e.message || 'Upgrade failed');
    setIsProcessing(false);
  }
};

  const finalizeVIPUpgrade = async () => {
    const newMax = VIP_CONFIG[selectedVIP].dailyTasks;
    await updateDoc(doc(db, 'users', currentUser.uid), {
      isVIP: true,
      tier: `${selectedVIP}VIP`,
      dailyTasksRemaining: newMax,
      lastTaskResetDate: serverTimestamp(),
      vipUpgradedAt: serverTimestamp(),
    });

    setUserProfile(prev => ({ ...prev, isVIP: true, tier: `${selectedVIP}VIP` }));
    toast.success(`${selectedVIP} VIP Activated! ${newMax} tasks/day unlocked!`);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 7000);
    setShowVIPModal(false);
    setIsProcessing(false);
    setSelectedVIP('');
    setMpesaNumber('');
  };

  if (!currentUser || !userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg text-blue-100">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {showConfetti && <Confetti recycle={false} numberOfPieces={250} gravity={0.3} />}

      {/* HEADER WITH MOBILE MENU TOGGLE - NOW WORKING */}
      <header className="bg-white/95 backdrop-blur-xl border-b border-amber-400/20 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-black text-slate-900">Outlier AI</h1>
                  <p className="text-xs text-slate-500">AI Training Platform</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* User avatar + tier */}
              <div className="hidden sm:flex items-center justify-center px-4 py-2 bg-slate-50 rounded-lg border border-slate-200">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {userProfile?.name?.[0] ?? <User className="w-4 h-4" />}
                </div>
                <div className="ml-2 text-left">
                  <p className="text-sm font-semibold text-slate-900">{userProfile?.name ?? 'User'}</p>
                  <p className="text-xs text-slate-500">{userProfile?.tier || 'Standard'}</p>
                </div>
              </div>

              {/* Notifications & Logout */}
              <button onClick={() => setShowNotifications(true)} className="relative p-2 rounded-lg hover:bg-slate-100">
                <Bell className="w-5 h-5 text-slate-700" />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                )}
              </button>

              <button
                onClick={() => auth.signOut().then(() => { localStorage.clear(); navigate('/signin'); })}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {!hasCompletedOnboarding && (
          <div className="mb-6 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl p-6 text-slate-900 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <Star className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-black mb-2">Welcome to Outlier AI! 🎉</h3>
                <p className="text-slate-800 mb-3">
                  Complete your first onboarding task below to unlock all available tasks and start earning!
                </p>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <CheckCircle className="w-4 h-4" />
                  <span>Quick & Easy • Get Paid Instantly • Unlock Full Access</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl font-black text-white">
              {hasCompletedOnboarding ? 'Welcome back' : 'Get Started'}
            </h1>
            <div className="flex items-center gap-4 text-sm text-blue-100">
              <div>
                <p className="text-xs uppercase tracking-wide">Next Payout</p>
                <div className="flex items-center gap-1 font-semibold text-white">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  {formatTime(timeLeft)} <span className="text-xs ml-1">• Every Thursday</span>
                </div>
              </div>
              <button
                onClick={() => navigate("/withdraw")}
                className="bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-bold px-5 py-2.5 rounded-lg shadow-sm hover:shadow-md transition"
              >
                Withdraw
              </button>
            </div>
          </div>
        </div>


<section className="mb-10">
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-xl border border-white/10">
      <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 via-transparent to-transparent" />

      <div className="relative z-10">
       <div className="flex items-center justify-between mb-5">
  <h3 className="text-base font-semibold text-slate-200">Financial Overview</h3>

  {/* Live Exchange Rate with RED pulsing dot */}
  <p className="text-xs font-medium text-emerald-400 opacity-90">
    <span className="inline-flex items-center gap-1.5">
      {/* Red pulsing dot */}
      <span className="relative flex">
        <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-500 opacity-75"></span>
        <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
      </span>
      <span>
       Approx : 1 USD = {getCurrentExchangeRate().toFixed(4)} KES
      </span>
    </span>
  </p>
</div>

        {/* Balance Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-slate-300">
              Available Balance ({dateRange})
            </p>
            <DollarSign className="w-5 h-5 text-amber-400" />
          </div>

          {/* USD Amount */}
          <p className="text-3xl font-black tracking-tight">
            ${(userProfile?.currentbalance ?? 0).toFixed(2)}
          </p>

          {/* KES Amount */}
          <p className="text-sm font-medium text-amber-500 mt-1">
            {formatKES(userProfile?.currentbalance ?? 0)}
          </p>

        </div>

        {/* This Month & Today Earnings */}
        <div className="grid grid-cols-2 gap-4 mt-5">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <p className="text-xs text-slate-400">This Month</p>
            <p className="text-xl font-bold text-emerald-400 mt-1">
              +${(userProfile?.thisMonthEarned ?? 0).toFixed(2)}
            </p>
          </div>

          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <p className="text-xs text-slate-400">Earned Today</p>
            <p className="text-xl font-bold text-blue-400 mt-1">
              ${todayEarnings.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h3 className="text-base font-semibold text-slate-900 mb-5">Today's Performance</h3>

      {(() => {
        const todayCompleted = myTasks.filter(t => 
          new Date(t.startedAt).toDateString() === new Date().toDateString() &&
          ['completed', 'approved'].includes(t.status)
        ).length;

        const maxDaily = userProfile?.isVIP
          ? VIP_CONFIG[userProfile.tier?.replace('VIP', '')]?.dailyTasks || 1
          : 1;

        const remaining = Math.max(0, maxDaily - todayCompleted);
        const progressPercentage = maxDaily > 0 ? Math.round((todayCompleted / maxDaily) * 100) : 0;

        return (
          <div className="space-y-5">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-600">Daily Quota</span>
                <span className="text-sm font-bold text-amber-600">
                  {todayCompleted} / {maxDaily}
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-700 rounded-full"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {remaining === 0 
                  ? "Daily limit reached — excellent work!" 
                  : `${remaining} task${remaining > 1 ? 's' : ''} remaining today`
                }
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <CheckCircle className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                <p className="text-xs text-emerald-800 font-medium">Approved</p>
                <p className="text-lg font-bold text-emerald-900">{approvedCount}</p>
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <RefreshCw className="w-6 h-6 text-amber-600 mx-auto mb-1" />
                <p className="text-xs text-amber-800 font-medium">Review</p>
                <p className="text-lg font-bold text-amber-900">
                  {myTasks.filter(t => 
                    new Date(t.startedAt).toDateString() === new Date().toDateString() && 
                    t.status === 'completed'
                  ).length}
                </p>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <Activity className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                <p className="text-xs text-blue-800 font-medium">Active</p>
                <p className="text-lg font-bold text-blue-900">
                  {myTasks.filter(t => 
                    new Date(t.startedAt).toDateString() === new Date().toDateString() && 
                    t.status === 'in-progress'
                  ).length}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
              <span className="text-sm text-slate-600">Earnings Today</span>
              <span className="text-xl font-bold text-green-600">
                +${todayEarnings.toFixed(2)}
              </span>
            </div>
          </div>
        );
      })()}
    </div>
  </div>
</section>

        <section className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-amber-500" />
              {hasCompletedOnboarding ? 'Available Tasks' : 'Onboarding Task'}
              <span className="text-sm text-slate-500 font-normal ml-2">
                ({filteredTasks.length} {hasCompletedOnboarding ? 'total' : 'to complete'})
              </span>
            </h2>
          </div>

          {hasCompletedOnboarding && (
            <div className="mb-8">
              <div className="flex gap-3 overflow-x-auto scrollbar-hide py-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`
                      px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap
                      transition-all duration-300 ease-out flex-shrink-0
                      focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2
                      ${selectedCategory === cat
                        ? "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 shadow-lg shadow-amber-400/30"
                        : "bg-white border border-slate-200 text-slate-700 hover:border-amber-300 hover:text-slate-900"
                      }
                    `}
                  >
                    {cat === "all" ? "All Categories" : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTasks.map((task) => {
              const myTask = myTaskMap[task.id];
              const isDone = myTask && ["completed", "approved"].includes(myTask.status);
              const isInProgress = myTask?.status === "in-progress";
              const cfg = myTask ? statusConfig[myTask.status] : null;
              const Icon = cfg?.icon;
              const isOnboardingTask = !hasCompletedOnboarding && task.id === onboardingTask?.id;
              
              const todayCompletedCount = myTasks.filter(t => 
                new Date(t.startedAt).toDateString() === new Date().toDateString() &&
                ['completed', 'approved'].includes(t.status)
              ).length;
              
              const maxDaily = userProfile?.isVIP
                ? VIP_CONFIG[userProfile.tier?.replace('VIP', '')]?.dailyTasks || 1
                : 1;
              
              const dailyLimitReached = todayCompletedCount >= maxDaily;

              return (
                <div
                  key={task.id}
                  className={`
                    group relative rounded-xl border border-slate-200 bg-white 
                    transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/50
                    overflow-hidden h-full flex flex-col 
                    ${isDone ? "opacity-75 grayscale-[20%]" : ""}
                    ${isOnboardingTask ? "ring-2 ring-amber-400 shadow-lg" : ""}
                  `}
                >
                  <div className={`absolute top-0 left-0 w-1 h-full ${
                    isDone ? "bg-slate-300" : isOnboardingTask ? "bg-gradient-to-b from-green-400 to-emerald-500" : "bg-gradient-to-b from-amber-400 to-orange-500"
                  }`}></div>

                  {isOnboardingTask && (
                    <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      Required
                    </div>
                  )}

                  <div className="p-4 pl-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex flex-wrap gap-1.5 min-w-0 flex-1">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${difficultyColors[task.difficulty]}`}>
                          {task.difficulty}
                        </span>
                        {myTask && cfg && (
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
                            <Icon className="w-3.5 h-3.5" />
                            <span className="truncate">{cfg.label}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-right min-w-0 flex-shrink-0 ml-2">
                        <p className="font-bold text-base text-slate-900">${task.paymentAmount}</p>
                        <p className="text-xs text-slate-500">{task.duration}</p>
                      </div>
                    </div>

                    <h4 className={`
                      font-semibold mb-4 line-clamp-3 leading-snug flex-1 min-h-0
                      transition-colors group-hover:text-slate-900
                      ${isDone ? "text-slate-500" : "text-slate-800"}
                    `}>
                      {task.title}
                    </h4>

                    <button
                      onClick={() => {
                        if (isDone) return; // Do nothing if task is done
                        if (isInProgress) {
                          navigate(`/working/${task.id}`);
                        } else if (dailyLimitReached) {
                          setShowVIPModal(true); // Show VIP modal if daily limit reached
                        } else {
                          startTask(task);
                        }
                      }}
                      disabled={isDone}
                      className={`
                        w-full py-2.5 rounded-lg font-semibold text-sm 
                        flex items-center justify-center gap-2 transition-all
                        relative overflow-hidden group/btn flex-shrink-0
                        ${isDone
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                          : isOnboardingTask 
                            ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg hover:shadow-green-400/25 hover:scale-[1.02]"
                            : "bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 hover:shadow-lg hover:shadow-amber-400/25 hover:scale-[1.02] cursor-pointer"
                        }
                      `}
                    >
                      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                      
                      {isDone ? (
                        <span className="flex items-center gap-2 truncate">
                          <CheckCircle className="w-4 h-4 flex-shrink-0" />
                          <span>Completed</span>
                        </span>
                      ) : isInProgress ? (
                        <span className="flex items-center gap-2 truncate">
                          Continue
                          <ChevronRight className="w-4 h-4 flex-shrink-0 transition-transform group-hover/btn:translate-x-0.5" />
                        </span>
                      ) : !dailyLimitReached ? (
                        <span className="flex items-center gap-2 truncate">
                          {isOnboardingTask ? 'Start Onboarding' : 'Start Task'}
                          <ChevronRight className="w-4 h-4 flex-shrink-0 transition-transform group-hover/btn:translate-x-0.5" />
                        </span>
                      ) : (
                        <span className="flex items-center gap-2 truncate">
                          <Crown className="w-4 h-4 flex-shrink-0" />
                          <span>Start Task</span>
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>



{showVIPModal && (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-amber-200/50">

      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-2">
          <Crown className="w-6 h-6 text-amber-500" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            Upgrade to VIP
          </h2>
        </div>
        <button 
          onClick={() => setShowVIPModal(false)}
          className="p-1.5 hover:bg-slate-100 rounded-lg transition"
        >
          <X className="w-5 h-5 text-slate-500" />
        </button>
      </div>

      {/* Value Props */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-3 mb-5 text-center">
        <p className="text-sm font-semibold text-amber-900">
          <span className="text-lg">Earn 3–4× more daily • Faster withdrawals</span>
        </p>
      </div>

      {/* VIP Tiers — Compact & Professional (Your Approved Format) */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {Object.entries(VIP_CONFIG).map(([tier, config]) => {
          const isSelected = selectedVIP === tier;
          const isRecommended = tier === 'Silver';

          return (
            <label
              key={tier}
              className={`relative cursor-pointer rounded-xl border-2 transition-all p-4 text-center
                ${isSelected 
                  ? 'border-amber-500 bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg' 
                  : 'border-slate-300 bg-white hover:border-amber-400'
                }`}
            >
              <input
                type="radio"
                name="vipTier"
                value={tier}
                checked={isSelected}
                onChange={(e) => {
                  setSelectedVIP(e.target.value);
                  setTimeout(() => document.getElementById('mpesa-input')?.focus(), 100);
                }}
                className="sr-only"
              />

              {isRecommended && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Recommended
                </span>
              )}

              <Crown className={`w-7 h-7 mx-auto mb-1 ${isSelected ? 'text-white' : 'text-amber-500'}`} />
              
              <p className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                {tier}
              </p>
              
              <p className={`text-lg font-black ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                ${config.priceUSD}
              </p>
              
              <p className={`text-sm font-bold mt-1 ${isSelected ? 'text-white' : 'text-amber-600'}`}>
                {formatKES(config.priceUSD)}
              </p>
              
              <p className={`text-xs font-medium mt-2 ${isSelected ? 'text-white/90' : 'text-slate-600'}`}>
                {config.dailyTasks} tasks/day
              </p>
            </label>
          );
        })}
      </div>

      {/* Final Confirmation — Clean & Small */}
      {selectedVIP && (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-xl p-4 text-center mb-5">
          <p className="text-sm font-medium text-slate-700">You will pay</p>
          <p className="text-2xl font-black text-emerald-600">
            {formatKES(VIP_CONFIG[selectedVIP].priceUSD)}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Rate: 1 USD = {getCurrentExchangeRate().toFixed(2)} KES
          </p>
        </div>
      )}

      {/* M-Pesa Input + Pay Button */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            M-Pesa Number
          </label>
          <input
            id="mpesa-input"
            type="tel"
            value={mpesaNumber}
            onChange={(e) => setMpesaNumber(e.target.value)}
            placeholder="0712345678"
            className="w-full px-4 py-3 rounded-lg border-2 border-green-400 focus:border-green-500 focus:ring-4 focus:ring-green-400/20 transition-all text-base"
          />
        </div>

        <button
          onClick={handleRealVIPUpgrade}
          disabled={isProcessing || !selectedVIP || !isValidMpesaNumber(mpesaNumber)}
          className={`w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all ${
            selectedVIP && isValidMpesaNumber(mpesaNumber)
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg active:scale-[0.98]'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          } ${isProcessing ? 'opacity-90' : ''}`}
        >
          {isProcessing ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Sending STK Push...
            </>
          ) : (
            <>
              <Smartphone className="w-5 h-5" />
              Pay {selectedVIP ? formatKES(VIP_CONFIG[selectedVIP].priceUSD) : ''} Now
            </>
          )}
        </button>

        <p className="text-xs text-center text-slate-500">
          Secure • Instant Access • Money-Back Guarantee
        </p>
      </div>
    </div>
  </div>
)}



    {/* Notifications */}
    <NotificationSound />
      {showNotifications && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-end p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-900">Notifications</h3>
              <div className="flex gap-2">
                {notifications.some(n => !n.read) && (
                  <button onClick={markAllRead} className="text-xs text-blue-600 hover:underline">
                    Mark all read
                  </button>
                )}
                <button onClick={() => setShowNotifications(false)} className="p-1 hover:bg-slate-100 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {notifications.length === 0 ? (
                <p className="text-center text-slate-500 py-8">No notifications yet.</p>
              ) : (
                notifications.map(notif => (
                  <div key={notif.id} className={`p-3 rounded-lg border ${notif.read ? 'bg-white border-slate-200' : 'bg-amber-50 border-amber-300'}`}>
                    <p className={`text-sm ${notif.read ? 'text-slate-700' : 'font-medium text-slate-900'}`}>
                      {notif.message}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(notif.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="bottom-right" theme="light" />
    </div>
  );


  
};

export default UserDashboard;