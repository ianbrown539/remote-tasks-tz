// src/pages/UserDashboard.js - WITH DYNAMIC EXCHANGE RATE & ANIMATED MODALS
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
  RefreshCw, CheckCircle2, Check, Bell, User, Star, Zap, 
  BadgeCheck, PartyPopper
} from 'lucide-react';

import { ToastContainer, toast } from 'react-toastify';
import Confetti from 'react-confetti';
import 'react-toastify/dist/ReactToastify.css';
import availableTasks from '../data/availableTasks';
import { useAuth } from '../context/AuthContext';

// Dynamic TZS Exchange Rate Simulator (2000-3000 range)
class TZSExchangeRateSimulator {
  constructor() {
    this.targetRate = 2709;
    this.currentRate = 2217;
    this.lastUpdate = Date.now();
    this.dailyBias = (Math.random() - 0.5) * 50;
    this.updateCounter = 0;
  }

  getCurrentRate() {
    const now = Date.now();
    const secondsSinceLast = (now - this.lastUpdate) / 1000;

    if (secondsSinceLast > 30 + Math.random() * 60) {
      this._updateRate();
      this.lastUpdate = now;
    }

    return Math.round(this.currentRate);
  }

  _updateRate() {
    this.updateCounter++;
    const noise = (Math.random() - 0.5) * 20;
    const distanceFromTarget = this.targetRate - this.currentRate;
    const reversion = distanceFromTarget * 0.05;
    const dayFraction = Date.now() / (86400 * 1000);
    const trend = this.dailyBias * (dayFraction - Math.floor(dayFraction));

    this.currentRate += noise + reversion + trend * 0.01;
    this.currentRate = Math.max(2000, Math.min(3000, this.currentRate));

    if (this.updateCounter % 100 === 0) {
      this.targetRate += (Math.random() - 0.5) * 100;
      this.targetRate = Math.max(2000, Math.min(3000, this.targetRate));
    }
  }
}

const tzsExchangeSimulator = new TZSExchangeRateSimulator();

export const getCurrentTZSRate = () => tzsExchangeSimulator.getCurrentRate();

// Backward compatibility - use TZS rate for Kenya exchange too
export const getCurrentExchangeRate = () => getCurrentTZSRate();

export const formatTZS = (usd) => {
  const rate = getCurrentTZSRate();
  const tzs = usd * rate;
  const formatted = Math.round(tzs).toLocaleString('en-US');
  return `TSh ${formatted}`;
};

// Backward compatibility - formatKES now formats as TZS
export const formatKES = (usd) => formatTZS(usd);

// VIP Configuration - TANZANIA PRICING WITH DYNAMIC RATES
const getVIPConfig = () => {
  const rate = getCurrentTZSRate();
  return {
    Bronze: { priceUSD: 0.09, priceTZS: Math.round(0.09 * rate), dailyTasks: 3 },
    Silver: { priceUSD: 0.10, priceTZS: Math.round(0.10 * rate), dailyTasks: 8 },
    Gold:   { priceUSD: 0.11, priceTZS: Math.round(0.11 * rate), dailyTasks: 15 },
  };
};

// Tanzania phone validation
const isValidTZPhoneNumber = (input) => {
  if (!input) return false;
  const cleaned = input.replace(/\D/g, '');
  return /^0(6[2-9]|7[1-9])\d{7}$/.test(cleaned) || /^255(6[2-9]|7[1-9])\d{7}$/.test(cleaned);
};

const normalizeTZPhoneNumber = (input) => {
  if (!input) return null;
  const cleaned = input.replace(/\D/g, '');
  
  if (/^0(6[2-9]|7[1-9])\d{7}$/.test(cleaned)) {
    return `255${cleaned.slice(1)}`;
  }
  
  if (/^255(6[2-9]|7[1-9])\d{7}$/.test(cleaned)) {
    return cleaned;
  }
  
  return null;
};

// Helper functions
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
  Intermediate: 'bg-lime-100 text-lime-700 border-lime-200',
  Advanced: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Expert: 'bg-teal-100 text-teal-700 border-teal-200',
};

const statusConfig = {
  'in-progress': { label: 'In Progress', icon: PlayCircle, color: 'text-lime-600', bg: 'bg-lime-50' },
  completed: { label: 'Under Review', icon: RefreshCw, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  approved: { label: 'Approved', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
};

const UserDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [userProfile, setUserProfile] = useState(null);
  const [myTasks, setMyTasks] = useState([]);
  const [showVIPModal, setShowVIPModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedVIP, setSelectedVIP] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(getNextThursday() - new Date());
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [tzsRate, setTzsRate] = useState(getCurrentTZSRate());
  
  // Payment animation states - FIXED: consistent naming
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);
  const [paymentData, setPaymentData] = useState(null);

  const hasResetToday = useRef(false);

  // Memoize VIP_CONFIG to prevent recalculation on every render
  const VIP_CONFIG = React.useMemo(() => getVIPConfig(), []);

  // Update TZS rate periodically
  useEffect(() => {
    const rateTimer = setInterval(() => {
      setTzsRate(getCurrentTZSRate());
    }, 5000); // Update every 5 seconds
    return () => clearInterval(rateTimer);
  }, []);

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
        const audio = new Audio("/sounds/notification.mp3");
        audio.currentTime = 0;
        audio.play().catch(() => {});
      };
    }, []);
    return null;
  };

  const addNotification = useCallback((msg) => {
    setNotifications(prev => {
      const updated = [{ id: Date.now().toString(), message: msg, timestamp: new Date().toISOString(), read: false }, ...prev];
      if (currentUser?.uid) localStorage.setItem(`notifications_${currentUser.uid}`, JSON.stringify(updated));
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
      const vipConfig = getVIPConfig();
      const maxTasks = data.isVIP ? vipConfig[data.tier?.replace('VIP', '')]?.dailyTasks || 1 : 1;

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

  // AUTO-APPROVAL
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
              ? `Welcome! $${task.paymentAmount.toFixed(2)} for onboarding task approved!`
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
    console.log('Starting task:', task);
    
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
      totalQuestions: task.questions?.length || 0,
    };

    setMyTasks(prev => {
      const updated = [...prev, newTask];
      localStorage.setItem(`myTasks_${currentUser.uid}`, JSON.stringify(updated));
      return updated;
    });

    console.log('Navigating to:', `/working/${task.id}`);
    toast.success('Task Started!', { icon: <Briefcase className="w-5 h-5" /> });
    navigate(`/working/${task.id}`);
  };

  const markAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem(`notifications_${currentUser.uid}`, JSON.stringify(updated));
  };

  // PALMPESA VIP UPGRADE WITH ANIMATED MODAL - FIXED
  const handlePalmPesaUpgrade = async () => {
    if (!selectedVIP) {
      toast.error('Select a VIP tier');
      return;
    }
    
    const normalized = normalizeTZPhoneNumber(phoneNumber);
    if (!normalized || !isValidTZPhoneNumber(phoneNumber)) {
      toast.error('Invalid Tanzania phone number');
      return;
    }

    setIsProcessing(true);
    setShowVIPModal(false);
    setShowPaymentModal(true);
    setAnimationStep(0);

    const usdPrice = VIP_CONFIG[selectedVIP].priceUSD;
    const tzsAmount = VIP_CONFIG[selectedVIP].priceTZS;
    const transactionId = `VIP_${selectedVIP}_${currentUser.uid}_${Date.now()}`;

    // Store payment data for modal display
    setPaymentData({
      tier: selectedVIP,
      amount: tzsAmount,
      usd: usdPrice,
      phone: phoneNumber,
      rate: tzsRate,
      tasks: VIP_CONFIG[selectedVIP].dailyTasks
    });

    try {
      // Ensure name has at least 2 words (PalmPesa requirement)
      let customerName = userProfile?.name || 'VIP Customer';
      if (customerName.trim().split(/\s+/).length < 2) {
        customerName = `${customerName} User`;
      }

      const res = await fetch('/api/palmpesa-pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'pay',
          phone: normalized,
          amount: tzsAmount,
          transaction_id: transactionId,
          name: customerName,
          email: userProfile?.email || currentUser?.email || 'customer@remote-tasks.it.com'
        }),
      });

      const data = await res.json();
      
      console.log('PalmPesa response:', data);
      
      if (data.error === true) {
        throw new Error(data.message || 'Payment initiation failed');
      }

      const isSuccess = data.order_id;
      
      if (!isSuccess) {
        throw new Error(data.message || 'Payment failed');
      }

      const orderId = data.order_id;

      // Move to step 1 - Payment Approved
      setTimeout(() => setAnimationStep(1), 2000);

      let attempts = 0;
      const maxAttempts = 24;

      const poll = setInterval(async () => {
        attempts++;

        try {
          const statusRes = await fetch('/api/palmpesa-pay', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'status',
              order_id: orderId
            })
          });

          const statusData = await statusRes.json();

          console.log(`[${attempts}/${maxAttempts}] Payment status:`, statusData);

          if (statusData.data && statusData.data[0]) {
            console.log('Payment detail:', statusData.data[0]);
          }

          const paymentDataDetail = statusData.data && statusData.data[0];
          
          const isPaid = statusData.result === 'SUCCESS' && 
                         paymentDataDetail && 
                         (paymentDataDetail.payment_status === 'COMPLETED' ||
                          paymentDataDetail.payment_status === 'PAID' ||
                          paymentDataDetail.payment_status === 'SUCCESS');

          const isFailed = paymentDataDetail && 
                           (paymentDataDetail.payment_status === 'FAILED' || 
                            paymentDataDetail.payment_status === 'CANCELLED');

          if (isPaid) {
            clearInterval(poll);
            
            // Move to step 2 - Success
            setAnimationStep(2);
            
            // Finalize VIP upgrade
            const newMax = VIP_CONFIG[selectedVIP].dailyTasks;
            await updateDoc(doc(db, 'users', currentUser.uid), {
              isVIP: true,
              tier: `${selectedVIP}VIP`,
              dailyTasksRemaining: newMax,
              lastTaskResetDate: serverTimestamp(),
              vipUpgradedAt: serverTimestamp(),
            });

            setUserProfile(prev => ({ ...prev, isVIP: true, tier: `${selectedVIP}VIP` }));
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 7000);
            setIsProcessing(false);
          } 
          else if (isFailed) {
            clearInterval(poll);
            setShowPaymentModal(false);
            toast.error('❌ Payment failed or cancelled');
            setIsProcessing(false);
          }
          else if (attempts >= maxAttempts) {
            clearInterval(poll);
            setShowPaymentModal(false);
            toast.warn('⏱️ Payment verification timed out. Contact support if money was deducted.');
            setIsProcessing(false);
          }

        } catch (e) {
          console.error('Status check error:', e);
          if (attempts >= maxAttempts) {
            clearInterval(poll);
            setShowPaymentModal(false);
            setIsProcessing(false);
          }
        }
      }, 5000);

    } catch (e) {
      console.error('PalmPesa payment error:', e);
      setShowPaymentModal(false);
      toast.error(e.message || 'Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  if (!currentUser || !userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-950 via-green-900 to-emerald-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-lime-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg text-green-100">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950 via-green-900 to-emerald-900">
      {showConfetti && <Confetti recycle={false} numberOfPieces={250} gravity={0.3} />}

      {/* HEADER */}
      <header className="bg-white/95 backdrop-blur-xl border-b border-lime-400/20 sticky top-0 z-40 shadow-sm">
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
                <div className="w-10 h-10 bg-gradient-to-br from-lime-400 to-green-500 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-black text-slate-900">Remote AI <span className="text-lime-600">Tasks</span></h1>
                  <p className="text-xs text-slate-500">AI Training Platform</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center justify-center px-4 py-2 bg-slate-50 rounded-lg border border-slate-200">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {userProfile?.name?.[0] ?? <User className="w-4 h-4" />}
                </div>
                <div className="ml-2 text-left">
                  <p className="text-sm font-semibold text-slate-900">{userProfile?.name ?? 'User'}</p>
                  <p className="text-xs text-slate-500">{userProfile?.tier || 'Standard'}</p>
                </div>
              </div>

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
          <div className="mb-6 bg-gradient-to-r from-lime-400 to-green-500 rounded-2xl p-6 text-green-950 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <Star className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-black mb-2">Karibu! Welcome to Remote AI Tasks! 🎉</h3>
                <p className="text-green-900 mb-3">
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
              {hasCompletedOnboarding ? 'Karibu tena!' : 'Anza Sasa!'}
            </h1>
            <div className="flex items-center gap-4 text-sm text-green-100">
              <div>
                <p className="text-xs uppercase tracking-wide">Next Payout</p>
                <div className="flex items-center gap-1 font-semibold text-white">
                  <Calendar className="w-4 h-4 text-lime-400" />
                  {formatTime(timeLeft)} <span className="text-xs ml-1">• Every Thursday</span>
                </div>
              </div>
              <button
                onClick={() => navigate("/withdraw")}
                className="bg-gradient-to-r from-lime-400 to-green-500 text-green-950 font-bold px-5 py-2.5 rounded-lg shadow-sm hover:shadow-md transition"
              >
                Withdraw
              </button>
            </div>
          </div>
        </div>

        <section className="mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-950 via-green-900 to-green-950 p-6 text-white shadow-xl border border-white/10">
              <div className="absolute inset-0 bg-gradient-to-tr from-lime-500/5 via-transparent to-transparent" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-semibold text-green-200">Financial Overview</h3>
                  <p className="text-xs font-medium text-lime-400 opacity-90">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="relative flex">
                        <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-lime-500 opacity-75"></span>
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-lime-500"></span>
                      </span>
                      <span>1 USD = {tzsRate.toLocaleString()} TZS</span>
                    </span>
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-green-300">Available Balance ({dateRange})</p>
                    <DollarSign className="w-5 h-5 text-lime-400" />
                  </div>

                  <p className="text-3xl font-black tracking-tight">
                    ${(userProfile?.currentbalance ?? 0).toFixed(2)}
                  </p>

                  <p className="text-sm font-medium text-lime-500 mt-1">
                    TSh {Math.round((userProfile?.currentbalance ?? 0) * tzsRate).toLocaleString()}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-5">
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <p className="text-xs text-green-400">This Month</p>
                    <p className="text-xl font-bold text-lime-400 mt-1">
                      +${(userProfile?.thisMonthEarned ?? 0).toFixed(2)}
                    </p>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <p className="text-xs text-green-400">Earned Today</p>
                    <p className="text-xl font-bold text-lime-400 mt-1">
                      ${todayEarnings.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-base font-semibold text-slate-900 mb-5">Today's Performance</h3>

              {(() => {
                const progressPercentage = maxDaily > 0 ? Math.round((todayCompletedCount / maxDaily) * 100) : 0;
                const remaining = Math.max(0, maxDaily - todayCompletedCount);

                return (
                  <div className="space-y-5">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-600">Daily Quota</span>
                        <span className="text-sm font-bold text-lime-600">
                          {todayCompletedCount} / {maxDaily}
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-lime-400 to-green-500 transition-all duration-700 rounded-full"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        {remaining === 0 
                          ? "Hongera! Daily limit reached 🎉" 
                          : `${remaining} task${remaining > 1 ? 's' : ''} remaining today`
                        }
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-1" />
                        <p className="text-xs text-green-800 font-medium">Approved</p>
                        <p className="text-lg font-bold text-green-900">{approvedCount}</p>
                      </div>

                      <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <RefreshCw className="w-6 h-6 text-yellow-600 mx-auto mb-1" />
                        <p className="text-xs text-yellow-800 font-medium">Review</p>
                        <p className="text-lg font-bold text-yellow-900">
                          {myTasks.filter(t => 
                            new Date(t.startedAt).toDateString() === new Date().toDateString() && 
                            t.status === 'completed'
                          ).length}
                        </p>
                      </div>

                      <div className="p-3 bg-lime-50 rounded-lg border border-lime-200">
                        <Activity className="w-6 h-6 text-lime-600 mx-auto mb-1" />
                        <p className="text-xs text-lime-800 font-medium">Active</p>
                        <p className="text-lg font-bold text-lime-900">
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
              <Briefcase className="w-5 h-5 text-lime-500" />
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
                      focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-offset-2
                      ${selectedCategory === cat
                        ? "bg-gradient-to-r from-lime-400 to-green-500 text-green-950 shadow-lg shadow-lime-400/30"
                        : "bg-white border border-slate-200 text-slate-700 hover:border-lime-300 hover:text-slate-900"
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

              return (
                <div
                  key={task.id}
                  className={`
                    group relative rounded-xl border border-slate-200 bg-white 
                    transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/50
                    overflow-hidden h-full flex flex-col 
                    ${isDone ? "opacity-75 grayscale-[20%]" : ""}
                    ${isOnboardingTask ? "ring-2 ring-lime-400 shadow-lg" : ""}
                  `}
                >
                  <div className={`absolute top-0 left-0 w-1 h-full ${
                    isDone ? "bg-slate-300" : isOnboardingTask ? "bg-gradient-to-b from-lime-400 to-green-500" : "bg-gradient-to-b from-lime-400 to-green-500"
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
                        if (isDone) return;
                        if (isInProgress) {
                          navigate(`/working/${task.id}`);
                        } else if (dailyLimitReached) {
                          setShowVIPModal(true);
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
                            : "bg-gradient-to-r from-lime-400 to-green-500 text-green-950 hover:shadow-lg hover:shadow-lime-400/25 hover:scale-[1.02] cursor-pointer"
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
                          {isOnboardingTask ? 'Anza Onboarding' : 'Anza Task'}
                          <ChevronRight className="w-4 h-4 flex-shrink-0 transition-transform group-hover/btn:translate-x-0.5" />
                        </span>
                      ) : (
                        <span className="flex items-center gap-2 truncate">
                          <Crown className="w-4 h-4 flex-shrink-0" />
                          <span>Anza Task</span>
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

      {/* VIP SELECTION MODAL */}
      {showVIPModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-green-950 rounded-2xl p-6 max-w-md w-full border border-white/10 shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-lime-400/20 rounded-lg flex items-center justify-center">
                  <Crown className="w-6 h-6 text-lime-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Fungua VIP Access</h2>
                  <p className="text-xs text-green-200">Ongeza Kipato Chako 🇹🇿</p>
                </div>
              </div>
              <button 
                onClick={() => setShowVIPModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg text-green-200 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-lime-400/20 border border-lime-400 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-lime-400 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-green-950" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm mb-1">Kwa Nini VIP?</p>
                  <ul className="space-y-1.5 text-xs text-green-200">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-lime-400 flex-shrink-0" />
                      <span>Kazi <strong className="text-white">hadi 15 kwa siku</strong> (badala ya 1)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-lime-400 flex-shrink-0" />
                      <span>Pata <strong className="text-white">3-15× zaidi kwa siku</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-lime-400 flex-shrink-0" />
                      <span><strong className="text-white">Msaada wa haraka</strong> & utoaji wa pesa</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mb-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-green-200 uppercase tracking-wide">Chagua Mpango Wako</p>
               
              </div>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(VIP_CONFIG).map(([tier, config]) => {
                  const isSelected = selectedVIP === tier;
                  const isRecommended = tier === 'Silver';

                  return (
                    <label
                      key={tier}
                      className={`relative cursor-pointer rounded-xl border-2 p-3.5 text-center transition-all ${
                        isSelected 
                          ? 'border-lime-400 bg-lime-400/10 shadow-lg shadow-lime-400/20' 
                          : 'border-white/10 bg-green-900 hover:border-lime-400/50'
                      }`}
                    >
                      {isRecommended && (
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-lime-400 text-green-950 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                          Bora Zaidi
                        </span>
                      )}
                      
                      <input
                        type="radio"
                        name="vipTier"
                        value={tier}
                        checked={isSelected}
                        onChange={(e) => setSelectedVIP(e.target.value)}
                        className="sr-only"
                      />

                      <Crown className={`w-7 h-7 mx-auto mb-2 ${isSelected ? 'text-lime-400' : 'text-green-400'}`} />
                      <p className={`font-bold text-xs mb-1 ${isSelected ? 'text-white' : 'text-green-200'}`}>{tier}</p>
                      <p className={`text-lg font-black mb-1 ${isSelected ? 'text-lime-400' : 'text-white'}`}>
                          ${config.priceUSD}
                      </p>
                      <p className="text-[10px] text-green-300">TSh {config.priceTZS.toLocaleString()}</p>
                      <div className="mt-2 pt-2 border-t border-white/10">
                        <p className="text-xs font-semibold text-lime-400">{config.dailyTasks} Kazi/Siku</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {selectedVIP && (
              <div className="bg-green-900 border-2 border-lime-400 rounded-lg p-4 mb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-green-200">Gharama</span>
                
                <div className="flex items-center gap-1.5 bg-lime-400/20 px-2.5 py-1 rounded-full border border-lime-400/30">
                  <span className="relative flex">
                    <span className="animate-ping absolute inline-flex h-1.5 w-1.5 rounded-full bg-lime-400 opacity-75"></span>
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-lime-400"></span>
                  </span>
                  <span className="text-[10px] font-bold text-lime-400">1 USD = {tzsRate.toLocaleString()} TZS</span>
                </div>

                  <span className="text-xs bg-lime-400/20 text-lime-400 px-2 py-1 rounded font-semibold">
                    {selectedVIP} VIP
                  </span>
                </div>
                <p className="text-3xl font-black text-lime-400 mb-1">
                  TSh {VIP_CONFIG[selectedVIP].priceTZS.toLocaleString()}
                </p>
                <p className="text-xs text-green-200">
                  • Fungua {VIP_CONFIG[selectedVIP].dailyTasks} kazi kwa siku
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-green-200 mb-2">
                  Namba ya Simu (Tanzania)
                </label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="0769500302 au 0652345678"
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-green-900 border-2 border-white/10 text-white placeholder-green-400 focus:border-lime-400 focus:outline-none transition"
                  />
                </div>
                <p className="text-xs text-green-300 mt-1.5">Vodacom, Tigo, Airtel, au Halotel</p>
              </div>

              <button
                onClick={handlePalmPesaUpgrade}
                disabled={!selectedVIP || !isValidTZPhoneNumber(phoneNumber) || isProcessing}
                className={`w-full py-3.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  selectedVIP && isValidTZPhoneNumber(phoneNumber) && !isProcessing
                    ? 'bg-lime-400 hover:bg-lime-500 text-green-950 shadow-lg hover:shadow-xl hover:shadow-lime-400/20 active:scale-[0.98]'
                    : 'bg-white/10 text-green-400 cursor-not-allowed'
                }`}
              >
                <Smartphone className="w-5 h-5" />
                {isProcessing ? 'Processing...' : selectedVIP ? `Lipa TSh ${VIP_CONFIG[selectedVIP].priceTZS.toLocaleString()}` : 'Chagua Mpango'}
              </button>

              <div className="flex items-center justify-center gap-4 text-xs text-green-300">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-lime-400" />
                  <span>Malipo Salama</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-lime-400" />
                  <span>Activation Haraka</span>
                </div>
              </div>

              <div className="text-center pt-2">
                <p className="text-xs text-green-300 mb-2">Mitandao Inayotumika:</p>
                <div className="flex justify-center gap-2 text-[10px] text-green-200">
                  <span className="bg-white/10 px-2 py-1 rounded">Vodacom</span>
                  <span className="bg-white/10 px-2 py-1 rounded">Tigo</span>
                  <span className="bg-white/10 px-2 py-1 rounded">Airtel</span>
                  <span className="bg-white/10 px-2 py-1 rounded">Halotel</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ANIMATED PAYMENT PROCESSING MODAL */}
      {showPaymentModal && paymentData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4">
          <div className="bg-green-950 rounded-2xl p-8 max-w-md w-full shadow-2xl border border-white/10">
            <div className="text-center">
              {animationStep === 0 && (
                <div>
                  <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Zap className="w-10 h-10 text-blue-400 animate-pulse" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-3">Processing Payment</h3>
                  <p className="text-green-200 mb-2">Checking your phone for confirmation...</p>
                  <p className="text-xs text-green-400 mb-6">Enter your PIN to complete payment</p>
                  <div className="w-8 h-8 border-4 border-lime-400 border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              )}

              {animationStep === 1 && (
                <div>
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BadgeCheck className="w-10 h-10 text-lime-400 animate-bounce" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-3">Payment Received!</h3>
                  <p className="text-green-200 mb-6">Activating your VIP access...</p>
                  <div className="flex justify-center space-x-2">
                    <div className="w-3 h-3 bg-lime-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-3 h-3 bg-lime-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-3 h-3 bg-lime-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}

              {animationStep === 2 && (
                <div>
                  <div className="w-20 h-20 bg-lime-400 rounded-full flex items-center justify-center mx-auto mb-6">
                    <PartyPopper className="w-10 h-10 text-green-950" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-3">Hongera! 🎉</h3>
                  <p className="text-green-200 mb-2">VIP activated successfully</p>
                  
                  <div className="bg-green-900 rounded-xl p-5 border border-lime-400 mt-6">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-green-200">Amount Paid:</span>
                      <span className="text-2xl font-black text-lime-400">
                        TSh {paymentData.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-green-300">Tier:</span>
                      <span className="font-bold text-white">{paymentData.tier} VIP</span>
                    </div>
                    <div className="flex justify-between text-sm mb-3">
                      <span className="text-green-300">Daily Tasks:</span>
                      <span className="font-bold text-lime-400">{paymentData.tasks} tasks/day</span>
                    </div>
                    <div className="border-t border-white/10 pt-3">
                      <p className="text-xs text-green-300">
                        To: {paymentData.phone}
                      </p>
                      <p className="text-xs text-lime-400 mt-1">
                        Activated: Instantly • Valid: Monthly
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <button
                      onClick={() => {
                        setShowPaymentModal(false);
                        setSelectedVIP('');
                        setPhoneNumber('');
                        setPaymentData(null);
                        setAnimationStep(0);
                      }}
                      className="w-full bg-lime-400 hover:bg-lime-500 text-green-950 font-bold py-3 rounded-xl transition"
                    >
                      Start Earning More!
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <NotificationSound />
      
      {/* Notifications Panel */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-end p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-900">Notifications</h3>
              <div className="flex gap-2">
                {notifications.some(n => !n.read) && (
                  <button onClick={markAllRead} className="text-xs text-lime-600 hover:underline">
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
                <p className="text-center text-slate-500 py-8">Hakuna arifa bado.</p>
              ) : (
                notifications.map(notif => (
                  <div key={notif.id} className={`p-3 rounded-lg border ${notif.read ? 'bg-white border-slate-200' : 'bg-lime-50 border-lime-300'}`}>
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