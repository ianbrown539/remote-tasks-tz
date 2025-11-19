// src/pages/UserDashboard.js
import React, { useEffect, useState, useCallback } from 'react';
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
  DollarSign,
  Calendar,
  Activity,
  Briefcase,
  TrendingUp,
  CheckCircle,
  ChevronRight,
  LogOut,
  Menu,
  X,
  Crown,
  Smartphone,
  PlayCircle,
  RefreshCw,
  CheckCircle2,
  Bell,
  Zap,
  Clock,
  Headphones,
  Shield,
  Gift,
  Sparkles,
  Lock,
  User,
  Star
} from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import Confetti from 'react-confetti';
import 'react-toastify/dist/ReactToastify.css';
import availableTasks from '../data/availableTasks';
import { useAuth } from '../context/AuthContext';

const EXCHANGE_RATE = 129.00;
const formatKES = (usd) =>
  `Ksh.${(usd * EXCHANGE_RATE)
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;

const VIP_CONFIG = {
  Bronze: { priceUSD: 1, dailyTasks: 4 },
  Silver: { priceUSD: 4, dailyTasks: 7 },
  Gold:   { priceUSD: 10, dailyTasks: 10 },
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
  'in-progress': {
    label: 'In Progress',
    icon: PlayCircle,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  completed: {
    label: 'Under Review',
    icon: RefreshCw,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
  approved: {
    label: 'Approved',
    icon: CheckCircle2,
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
};

const normalizePhoneNumber = (input) => {
  if (!input) return null;
  const cleaned = input.replace(/\D/g, '');

  if (/^0[71]\d{8}$/.test(input)) {
    return `254${cleaned.slice(1)}`;
  }
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
  const [dailyTasksRemaining, setDailyTasksRemaining] = useState(1);
  const [myTasks, setMyTasks] = useState([]);
  const [showVIPModal, setShowVIPModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedVIP, setSelectedVIP] = useState('');
  const [mpesaNumber, setMpesaNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(getNextThursday() - new Date());
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      const diff = getNextThursday() - new Date();
      setTimeLeft(diff > 0 ? diff : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Memoized addNotification
  const addNotification = useCallback((msg) => {
    setNotifications(prev => {
      const newNotif = {
        id: Date.now().toString(),
        message: msg,
        timestamp: new Date().toISOString(),
        read: false,
      };
      const updated = [newNotif, ...prev];
      if (currentUser?.uid) {
        localStorage.setItem(`notifications_${currentUser.uid}`, JSON.stringify(updated));
      }
      return updated;
    });
  }, [currentUser?.uid]);

  // Load user profile and tasks
  useEffect(() => {
    if (!currentUser) return;

    const unsub = onSnapshot(doc(db, 'users', currentUser.uid), (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      setUserProfile(data);

      const today = new Date().toLocaleDateString('en-CA');
      const lastReset = data.lastTaskResetDate?.toDate?.().toLocaleDateString('en-CA') || null;
      const isVIP = data.isVIP || false;
      const tier = data.tier?.replace('VIP', '') || '';
      const maxTasks = isVIP ? VIP_CONFIG[tier]?.dailyTasks || 1 : 1;

      if (lastReset !== today) {
        updateDoc(doc(db, 'users', currentUser.uid), {
          dailyTasksRemaining: maxTasks,
          lastTaskResetDate: serverTimestamp(),
        });
        setDailyTasksRemaining(maxTasks);
      } else {
        setDailyTasksRemaining(data.dailyTasksRemaining ?? maxTasks);
      }
    });

    const saved = localStorage.getItem(`myTasks_${currentUser.uid}`);
    if (saved) setMyTasks(JSON.parse(saved));

    const savedNotifs = localStorage.getItem(`notifications_${currentUser.uid}`);
    if (savedNotifs) setNotifications(JSON.parse(savedNotifs));

    return () => unsub();
  }, [currentUser]);

  // Persist tasks
  useEffect(() => {
    if (currentUser?.uid && myTasks.length) {
      localStorage.setItem(`myTasks_${currentUser.uid}`, JSON.stringify(myTasks));
    }
  }, [myTasks, currentUser?.uid]);

  // Auto-approval simulation with onboarding detection
  useEffect(() => {
    if (!currentUser) return;

    const interval = setInterval(() => {
      setMyTasks((prev) => {
        let changed = false;
        const updated = prev.map((task) => {
          // Check if this is the onboarding task
          const isOnboardingTask = task.id.startsWith(availableTasks[0]?.id);
          
          if (task.status === 'completed' && !task.approvalScheduled) {
            // Faster approval time for onboarding task (30-60 seconds)
            // Normal approval time for regular tasks (1-5 minutes)
            const approvalDelay = isOnboardingTask 
              ? Math.random() * 30000 + 30000  // 30-60 seconds for onboarding
              : Math.random() * 240000 + 60000; // 1-5 minutes for regular tasks
            
            task.approvalScheduled = Date.now() + approvalDelay;
            changed = true;
          }

          if (
            task.approvalScheduled &&
            Date.now() >= task.approvalScheduled &&
            task.status !== 'approved'
          ) {
            task.status = 'approved';
            task.approvedAt = new Date();
            changed = true;

            updateDoc(doc(db, 'users', currentUser.uid), {
              currentbalance: increment(task.paymentAmount),
              thisMonthEarned: increment(task.paymentAmount),
              totalEarned: increment(task.paymentAmount),
              ApprovedTasks: increment(1),
              ...(isOnboardingTask && { hasDoneOnboardingTask: true })
            });

            toast.success(`+${task.paymentAmount.toFixed(2)} approved!`, {
              icon: <CheckCircle className="w-5 h-5 text-green-500" />,
            });

            if (isOnboardingTask) {
              addNotification(
                `🎉 Congratulations! You've completed your onboarding task and earned ${task.paymentAmount.toFixed(2)}! All tasks are now unlocked.`
              );
            } else {
              addNotification(
                `You have been paid ${task.paymentAmount.toFixed(
                  2
                )}! Task "${task.title}" has been approved successfully.`
              );
            }

            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 4000);
          }
          return task;
        });

        if (changed && currentUser?.uid) {
          localStorage.setItem(`myTasks_${currentUser.uid}`, JSON.stringify(updated));
        }
        return updated;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [currentUser, addNotification]);

  // Daily reminder
  useEffect(() => {
    if (!currentUser || !userProfile) return;

    const today = new Date().toDateString();
    const lastReminder = localStorage.getItem(`lastReminder_${currentUser.uid}`);

    if (lastReminder !== today && dailyTasksRemaining > 0) {
      const startedToday = myTasks.filter(
        t => new Date(t.startedAt).toDateString() === today
      ).length;

      if (startedToday === 0) {
        addNotification(
          `You still have ${dailyTasksRemaining} task${dailyTasksRemaining > 1 ? 's' : ''} available today. Start now and keep earning!`
        );
      } else if (startedToday < dailyTasksRemaining) {
        addNotification(
          `You have ${dailyTasksRemaining - startedToday} pending task${dailyTasksRemaining - startedToday > 1 ? 's' : ''} for today. Finish them to stay on track!`
        );
      }

      localStorage.setItem(`lastReminder_${currentUser.uid}`, today);
    }
  }, [currentUser, userProfile, dailyTasksRemaining, myTasks, addNotification]);

  const startTask = async (task) => {
    const maxTasks = userProfile?.isVIP
      ? VIP_CONFIG[userProfile.tier?.replace('VIP', '')]?.dailyTasks || 2
      : 2;

    const usedToday = myTasks.filter(
      (t) => new Date(t.startedAt).toDateString() === new Date().toDateString() &&
             ['completed', 'approved'].includes(t.status)
    ).length;

    if (usedToday >= maxTasks) {
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

    setMyTasks((prev) => [...prev, newTask]);

    toast.success('Task started', {
      icon: <Briefcase className="w-5 h-5 text-blue-600" />,
    });

    navigate(`/working/${task.id}`);
  };

  const markAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    if (currentUser?.uid) {
      localStorage.setItem(`notifications_${currentUser.uid}`, JSON.stringify(updated));
    }
  };

  const handleRealVIPUpgrade = async () => {
    if (!selectedVIP) return toast.error('Select a VIP tier');
    const normalized = normalizePhoneNumber(mpesaNumber);
    if (!normalized || !isValidMpesaNumber(mpesaNumber))
      return toast.error('Invalid M-Pesa number');

    setIsProcessing(true);
    const clientReference = `VIP_${currentUser.uid}_${Date.now()}`;
    const amount = VIP_CONFIG[selectedVIP].priceUSD * 129;
    let poll = null;

    try {
      const init = await fetch('/api/stk-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: normalized,
          amount,
          reference: clientReference,
        }),
      });
      const { success, payheroReference, error } = await init.json();

      if (!success) throw new Error(error || 'STK push failed');
      if (!payheroReference) throw new Error('Missing PayHero reference');

      toast.info(`STK push sent to ${mpesaNumber}…`, { autoClose: 5000 });

      poll = setInterval(async () => {
        try {
          const statusRes = await fetch(
            `/api/transaction-status?reference=${encodeURIComponent(payheroReference)}`
          );
          const { success, status, error } = await statusRes.json();

          if (!success) throw new Error(error);

          if (status === 'SUCCESS') {
            clearInterval(poll);
            toast.success('Payment confirmed!');
            await finalizeVIPUpgrade();
          } else if (['FAILED', 'CANCELLED'].includes(status)) {
            clearInterval(poll);
            toast.error('Payment failed');
            setIsProcessing(false);
          }
        } catch (e) {
          console.error(e);
        }
      }, 3000);

      setTimeout(() => {
        if (poll) {
          clearInterval(poll);
          if (isProcessing) {
            toast.warn('Payment timed out');
            setIsProcessing(false);
          }
        }
      }, 120_000);
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

    setDailyTasksRemaining(newMax);
    setUserProfile((p) => ({ ...p, isVIP: true, tier: `${selectedVIP}VIP` }));

    toast.success(`${selectedVIP} VIP activated! ${newMax} tasks/day unlocked!`, {
      icon: <Crown className="w-6 h-6 text-amber-500" />,
    });
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000);
    setShowVIPModal(false);
    setSelectedVIP('');
    setMpesaNumber('');
    setIsProcessing(false);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg text-blue-100">Redirecting to login…</p>
        </div>
      </div>
    );
  }

  // Stats calculations
  const todayTasks = myTasks.filter(
    (t) => new Date(t.startedAt).toDateString() === new Date().toDateString()
  );
  const completedCount = todayTasks.filter((t) => t.status === 'completed').length;
  const approvedCount = todayTasks.filter((t) => t.status === 'approved').length;
  const todayEarnings = todayTasks
    .filter((t) => t.status === 'approved')
    .reduce((s, t) => s + t.paymentAmount, 0);

  const maxTasks = userProfile?.isVIP
    ? VIP_CONFIG[userProfile.tier?.replace('VIP', '')]?.dailyTasks || 1
    : 2;
  
  const todayCompletedTasks = myTasks.filter(t => 
    new Date(t.startedAt).toDateString() === new Date().toDateString() &&
    ['completed', 'approved'].includes(t.status)
  ).length;
  
  const progress = maxTasks > 0 ? (todayCompletedTasks / maxTasks) * 100 : 0;
  
  const lastThursday = getLastThursday();
  const nextThursday = getNextThursday();
  const dateRange = `${lastThursday.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - ${nextThursday.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`;

  const hasCompletedOnboarding = userProfile?.hasDoneOnboardingTask || false;
  const onboardingTask = availableTasks[0];
  
  const tasksToShow = hasCompletedOnboarding ? availableTasks : [onboardingTask];
  
  const categories = ['all', ...new Set(tasksToShow.map((t) => t.category))];
  const filteredTasks =
    selectedCategory === 'all'
      ? tasksToShow
      : tasksToShow.filter((t) => t.category === selectedCategory);

  const myTaskMap = {};
  myTasks.forEach((t) => {
    const originalId = t.id.split('_')[0];
    myTaskMap[originalId] = t;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} gravity={0.3} />}

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
              <div className="hidden sm:flex items-center justify-center px-4 py-2 bg-slate-50 rounded-lg border border-slate-200">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {userProfile?.name?.[0] ?? <User className="w-4 h-4" />}
                </div>
                <div className="ml-2 text-left">
                  <p className="text-sm font-semibold text-slate-900">
                    {userProfile?.name ?? 'User'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {userProfile?.tier ? userProfile.tier : 'Standard'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowNotifications(true)}
                className="relative p-2 rounded-lg hover:bg-slate-100 transition"
              >
                <Bell className="w-5 h-5 text-slate-700" />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                )}
              </button>

              <button
                onClick={() =>
                  auth.signOut().then(() => {
                    localStorage.clear();
                    navigate('/signin');
                  })
                }
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition"
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
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <TrendingUp className="w-4 h-4" />
            <span>Live</span>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm text-slate-300">Available Balance ({dateRange})</p>
            </div>
            <DollarSign className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-3xl font-black tracking-tight">
            ${(userProfile?.currentbalance ?? 0).toFixed(2)}
          </p>
          <p className="text-lg font-bold text-amber-500 mt-1">
            {formatKES(userProfile?.currentbalance ?? 0)}
          </p>
        </div>

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
          ? VIP_CONFIG[userProfile.tier?.replace('VIP', '')]?.dailyTasks || 2
          : 2;

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
                ? VIP_CONFIG[userProfile.tier?.replace('VIP', '')]?.dailyTasks || 2
                : 2;
              
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
                      START HERE
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
                          CONTINUE
                          <ChevronRight className="w-4 h-4 flex-shrink-0 transition-transform group-hover/btn:translate-x-0.5" />
                        </span>
                      ) : !dailyLimitReached ? (
                        <span className="flex items-center gap-2 truncate">
                          {isOnboardingTask ? 'START ONBOARDING' : 'START TASK'}
                          <ChevronRight className="w-4 h-4 flex-shrink-0 transition-transform group-hover/btn:translate-x-0.5" />
                        </span>
                      ) : (
                        <span className="flex items-center gap-2 truncate">
                          <Crown className="w-4 h-4 flex-shrink-0" />
                          <span>Upgrade to VIP</span>
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
    <div className="bg-gradient-to-br from-white to-slate-50/90 backdrop-blur-xl rounded-2xl p-6 md:p-8 max-w-2xl w-full shadow-2xl border border-amber-200/50 overflow-y-auto max-h-[90vh]">

      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Crown className="w-6 h-6 text-amber-500" />
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Upgrade to VIP
            </h2>
          </div>
          <p className="text-slate-600 text-sm">Unlock premium features and maximize your earnings</p>
        </div>
        <button 
          onClick={() => setShowVIPModal(false)} 
          className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <X className="w-5 h-5 text-slate-500" />
        </button>
      </div>

      {/* Value Proposition */}
      <div className="bg-gradient-to-r from-blue-50 to-amber-50/50 border border-blue-200/50 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Ready to accelerate your earnings?</h3>
            <p className="text-sm text-blue-700/80">
              VIP members earn <span className="font-bold">2-3x more</span> daily and enjoy exclusive benefits 
              designed to maximize your income potential.
            </p>
          </div>
        </div>
      </div>

      {/* Benefits List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        {[
          { icon: TrendingUp, text: "Higher daily earning limits", highlight: "Earn 2-3x more daily" },
          { icon: Zap, text: "More daily tasks", highlight: "Up to 3x task capacity" },
          { icon: Clock, text: "Priority processing", highlight: "Faster withdrawals" },
          { icon: Headphones, text: "Dedicated support", highlight: "24-48h response time" },
          { icon: Shield, text: "Premium status", highlight: "Verified VIP badge" },
          { icon: Gift, text: "Special bonuses", highlight: "Exclusive offers" }
        ].map(({ icon: Icon, text, highlight }, index) => (
          <div key={index} className="flex items-center gap-3 p-3 bg-white/80 rounded-lg border border-slate-200/80">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Icon className="w-4 h-4 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-800">{text}</p>
              <p className="text-xs text-amber-600 font-semibold">{highlight}</p>
            </div>
          </div>
        ))}
      </div>

      {/* VIP Tiers */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-800 mb-3">Choose Your VIP Plan</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Object.entries(VIP_CONFIG).map(([tier, config]) => {
            const isSelected = selectedVIP === tier;
            const isRecommended = tier === "Silver";
            const isPopular = tier === "Gold";
            
            return (
              <label
                key={tier}
                className={`relative cursor-pointer p-5 rounded-xl border-2 transition-all duration-300 ${
                  isSelected
                    ? 'border-amber-500 bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg scale-[1.02]'
                    : 'border-slate-300 bg-white hover:border-slate-400 hover:shadow-md'
                } ${isPopular ? 'ring-2 ring-amber-300 ring-offset-2' : ''}`}
              >
                <input
                  type="radio"
                  name="vipTier"
                  value={tier}
                  checked={isSelected}
                  onChange={(e) => setSelectedVIP(e.target.value)}
                  className="sr-only"
                />

                {isRecommended && (
                  <span className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-3 py-1 rounded-full font-bold whitespace-nowrap">
                    ⭐ Most Popular
                  </span>
                )}

                <div className="text-center">
                  <Crown className={`w-8 h-8 mb-3 mx-auto ${isSelected ? 'text-white' : 'text-amber-500'}`} />
                  <h3 className={`font-bold text-lg mb-2 ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                    {tier} VIP
                  </h3>
                  
                  <div className="mb-3">
                    <p className={`text-3xl font-black ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                      ${config.priceUSD}
                    </p>
                    <p className={`text-sm ${isSelected ? 'text-white/90' : 'text-slate-600'}`}>
                      {formatKES(config.priceUSD)}
                    </p>
                  </div>

                  <div className={`px-3 py-2 rounded-lg mb-3 ${
                    isSelected ? 'bg-white/20' : 'bg-slate-100'
                  }`}>
                    <p className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                      {config.dailyTasks} Daily Tasks
                    </p>
                    <p className={`text-xs ${isSelected ? 'text-white/80' : 'text-slate-600'}`}>
                      {tier === 'Bronze' ? '2x more earning potential' : 
                       tier === 'Silver' ? '3x more earning potential' : 
                       'Maximum earning capacity'}
                    </p>
                  </div>

                  <div className="text-left space-y-1.5">
                    <p className={`text-xs ${isSelected ? 'text-white/90' : 'text-slate-600'}`}>
                      • {config.dailyTasks} tasks per day
                    </p>
                    <p className={`text-xs ${isSelected ? 'text-white/90' : 'text-slate-600'}`}>
                      • Priority withdrawals
                    </p>
                    <p className={`text-xs ${isSelected ? 'text-white/90' : 'text-slate-600'}`}>
                      • {tier === 'Gold' ? '24h' : '48h'} support
                    </p>
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Payment Section */}
      <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-200/60">
        <div className="mb-4">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            M-Pesa Number
          </label>
          <input
            type="tel"
            value={mpesaNumber}
            onChange={(e) => setMpesaNumber(e.target.value)}
            placeholder="Enter your M-Pesa number (07XX XXX XXX)"
            className="w-full px-4 py-3 rounded-lg border-2 border-green-400 focus:border-green-500 focus:ring-2 focus:ring-green-400/30 transition-all text-base"
          />
          <p className="text-xs text-slate-500 mt-1">
            You'll receive an STK Push to complete payment securely
          </p>
        </div>

        <button
          onClick={handleRealVIPUpgrade}
          disabled={isProcessing || !selectedVIP || !isValidMpesaNumber(mpesaNumber)}
          className={`w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 ${
            selectedVIP && isValidMpesaNumber(mpesaNumber)
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          } ${isProcessing ? 'opacity-80' : ''}`}
        >
          {isProcessing ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing Upgrade...
            </>
          ) : (
            <>
              <Smartphone className="w-5 h-5" />
              Upgrade to {selectedVIP || 'VIP'} - {selectedVIP ? `$${VIP_CONFIG[selectedVIP]?.priceUSD}` : ''}
            </>
          )}
        </button>

        {/* Trust Indicators */}
        <div className="mt-4 text-center space-y-2">
          <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-green-500" />
              Secure Payment
            </div>
            <div className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-green-500" />
              Encrypted
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-green-500" />
              Instant Access
            </div>
          </div>
          
          <p className="text-xs text-slate-500">
            Upgrade in seconds • Cancel anytime • 100% Satisfaction Guaranteed
          </p>
        </div>
      </div>
    </div>
  </div>
)}

      {showNotifications && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-end p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-900">Notifications</h3>
              <div className="flex gap-2">
                {notifications.some(n => !n.read) && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setShowNotifications(false)}
                  className="p-1 hover:bg-slate-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-3">
              {notifications.length === 0 ? (
                <p className="text-center text-slate-500 py-8">No notifications yet.</p>
              ) : (
                notifications.map(notif => (
                  <div
                    key={notif.id}
                    className={`p-3 rounded-lg border ${
                      notif.read ? 'bg-white border-slate-200' : 'bg-amber-50 border-amber-300'
                    }`}
                  >
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