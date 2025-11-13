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
  Clock,
  ChevronRight,
  LogOut,
  Menu,
  X,
  Crown,
  Smartphone,
  PlayCircle,
  RefreshCw,
  CheckCircle2,
  Lock,
  Bell,
  User
} from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import Confetti from 'react-confetti';
import 'react-toastify/dist/ReactToastify.css';
import availableTasks from '../data/availableTasks';
import { useAuth } from '../context/AuthContext';

const EXCHANGE_RATE = 129.55;
const formatKES = (usd) =>
  `Ksh.${(usd * EXCHANGE_RATE)
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;

const VIP_CONFIG = {
  Bronze: { priceUSD: 10, dailyTasks: 10 },
  Silver: { priceUSD: 20, dailyTasks: 20 },
  Gold: { priceUSD: 50, dailyTasks: 50 },
};

const getNextThursday = () => {
  const now = new Date();
  const thursday = new Date(now);
  thursday.setDate(now.getDate() + ((4 - now.getDay() + 7) % 7 || 7));
  thursday.setHours(23, 59, 59, 0);
  return thursday;
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
  const [dailyTasksRemaining, setDailyTasksRemaining] = useState(2);
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
    const newNotif = {
      id: Date.now().toString(),
      message: msg,
      timestamp: new Date().toISOString(),
      read: false,
    };
    const updated = [newNotif, ...notifications];
    setNotifications(updated);
    if (currentUser?.uid) {
      localStorage.setItem(`notifications_${currentUser.uid}`, JSON.stringify(updated));
    }
  }, [currentUser?.uid, notifications]);

  // Load user profile and tasks
  useEffect(() => {
    if (!currentUser) return;

    const unsub = onSnapshot(doc(db, 'users', currentUser.uid), (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      setUserProfile(data);

      const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
      const lastReset = data.lastTaskResetDate?.toDate?.().toLocaleDateString('en-CA');
      const isVIP = data.isVIP || false;
      const maxTasks = isVIP ? VIP_CONFIG[data.vipTier]?.dailyTasks || 2 : 2;

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

  // Auto-approval simulation
  useEffect(() => {
    if (!currentUser) return;

    const interval = setInterval(() => {
      setMyTasks((prev) => {
        let changed = false;
        const updated = prev.map((task) => {
          if (task.status === 'completed' && !task.approvalScheduled) {
            task.approvalScheduled = Date.now() + (Math.random() * 240000 + 60000);
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
              balance: increment(task.paymentAmount),
              thisMonthEarned: increment(task.paymentAmount),
              totalEarned: increment(task.paymentAmount),
              completedTasks: increment(1),
            });

            toast.success(`+$${task.paymentAmount.toFixed(2)} approved!`, {
              icon: <CheckCircle className="w-5 h-5 text-green-500" />,
            });

            addNotification(
              `Task: You have been paid $${task.paymentAmount.toFixed(
                2
              )}! Task "${task.title}" has been approved successfully.`
            );

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
      ? VIP_CONFIG[userProfile.vipTier]?.dailyTasks || 2
      : 2;

    const usedToday = myTasks.filter(
      (t) => new Date(t.startedAt).toDateString() === new Date().toDateString()
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
    setDailyTasksRemaining((prev) => Math.max(0, prev - 1));

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
    const amount = VIP_CONFIG[selectedVIP].priceUSD;
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
      vipTier: selectedVIP,
      dailyTasksRemaining: newMax,
      lastTaskResetDate: serverTimestamp(),
      vipUpgradedAt: serverTimestamp(),
    });

    setDailyTasksRemaining(newMax);
    setUserProfile((p) => ({ ...p, isVIP: true, vipTier: selectedVIP }));

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
    ? VIP_CONFIG[userProfile.vipTier]?.dailyTasks || 2
    : 2;
  const progress = maxTasks > 0 ? ((maxTasks - dailyTasksRemaining) / maxTasks) * 100 : 0;

  const categories = ['all', ...new Set(availableTasks.map((t) => t.category))];
  const filteredTasks =
    selectedCategory === 'all'
      ? availableTasks
      : availableTasks.filter((t) => t.category === selectedCategory);

  const myTaskMap = {};
  myTasks.forEach((t) => {
    const originalId = t.id.split('_')[0];
    myTaskMap[originalId] = t;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} gravity={0.3} />}

      {/* Header */}
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
              {/* User Profile */}
              <div className="hidden sm:flex items-center justify-center px-4 py-2 bg-slate-50 rounded-lg border border-slate-200">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {userProfile?.name?.[0] ?? <User className="w-4 h-4" />}
                </div>
                <div className="ml-2 text-left">
                  <p className="text-sm font-semibold text-slate-900">
                    {userProfile?.name ?? 'User'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {userProfile?.vipTier ? `${userProfile.vipTier} VIP` : 'Standard'}
                  </p>
                </div>
              </div>

              {/* Notification Bell */}
              <button
                onClick={() => setShowNotifications(true)}
                className="relative p-2 rounded-lg hover:bg-slate-100 transition"
              >
                <Bell className="w-5 h-5 text-slate-700" />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                )}
              </button>

              {/* Sign Out */}
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl font-black text-white">Welcome back</h1>
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

        {/* Consolidated Stats Dashboard */}
        <section className="mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Financial Overview */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl p-6 text-white">
              <h2 className="text-lg font-semibold mb-6 text-slate-200">Financial Overview</h2>
              
              <div className="space-y-5">
                {/* Available Balance */}
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-slate-300 text-sm">Available Balance</p>
                    <DollarSign className="w-5 h-5 text-amber-400" />
                  </div>
                  <h2 className="text-3xl font-black">${(userProfile?.balance ?? 0).toFixed(2)}</h2>
                  <p className="text-slate-400 text-xs mt-1">{formatKES(userProfile?.balance ?? 0)}</p>
                </div>

                {/* Monthly & Today Earnings */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-slate-400 text-xs">This Month</p>
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    </div>
                    <h3 className="text-xl font-bold text-green-400">
                      +${(userProfile?.thisMonthEarned ?? 0).toFixed(2)}
                    </h3>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-slate-400 text-xs">Today</p>
                      <Activity className="w-4 h-4 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold text-blue-400">${todayEarnings.toFixed(2)}</h3>
                  </div>
                </div>
              </div>
            </div>

            {/* Task Performance */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold mb-6 text-slate-900">Task Performance</h2>
              
              <div className="space-y-5">
                {/* Progress Bar */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Daily Progress</span>
                    <span className="font-semibold text-slate-900">{dailyTasksRemaining} tasks left</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-amber-400 to-orange-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Task Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-xl border border-green-100">
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-xs text-green-800 mb-1">Approved</p>
                    <h3 className="text-2xl font-bold text-green-900">{approvedCount}</h3>
                  </div>

                  <div className="text-center p-4 bg-orange-50 rounded-xl border border-orange-100">
                    <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                    <p className="text-xs text-orange-800 mb-1">In Review</p>
                    <h3 className="text-2xl font-bold text-orange-900">{completedCount}</h3>
                  </div>
                </div>

                {/* Completion Rate */}
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">Completion Rate</span>
                    <span className="font-semibold text-slate-900">
                      {approvedCount + completedCount > 0 
                        ? Math.round((approvedCount / (approvedCount + completedCount)) * 100) 
                        : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Available Tasks Section */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-amber-500" />
              Available Tasks
              <span className="text-sm text-slate-500 font-normal ml-2">
                ({filteredTasks.length} total)
              </span>
            </h2>
          </div>

          {/* Categories Filter */}
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

          {/* Task Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTasks.map((task) => {
              const myTask = myTaskMap[task.id];
              const isDone = myTask && ["completed", "approved"].includes(myTask.status);
              const isInProgress = myTask?.status === "in-progress";
              const cfg = myTask ? statusConfig[myTask.status] : null;
              const Icon = cfg?.icon;

              return (
                <div
                  key={task.id}
                  className={`
                    group relative rounded-xl border border-slate-200 bg-white 
                    transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/50
                    overflow-hidden h-full flex flex-col 
                    ${isDone ? "opacity-75 grayscale-[20%]" : ""}
                  `}
                >
                  {/* Accent bar */}
                  <div className={`absolute top-0 left-0 w-1 h-full ${
                    isDone ? "bg-slate-300" : "bg-gradient-to-b from-amber-400 to-orange-500"
                  }`}></div>

                  <div className="p-4 pl-5 flex-1 flex flex-col">
                    {/* Header with badges */}
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

                    {/* Task Title */}
                    <h4 className={`
                      font-semibold mb-4 line-clamp-3 leading-snug flex-1 min-h-0
                      transition-colors group-hover:text-slate-900
                      ${isDone ? "text-slate-500" : "text-slate-800"}
                    `}>
                      {task.title}
                    </h4>

                    {/* Action Button */}
                    <button
                      onClick={() => isInProgress ? navigate(`/working/${task.id}`) : startTask(task)}
                      disabled={isDone || dailyTasksRemaining === 0}
                      className={`
                        w-full py-2.5 rounded-lg font-semibold text-sm 
                        flex items-center justify-center gap-2 transition-all
                        relative overflow-hidden group/btn flex-shrink-0
                        ${isDone
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                          : dailyTasksRemaining > 0
                          ? "bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 hover:shadow-lg hover:shadow-amber-400/25 hover:scale-[1.02]"
                          : "bg-slate-100 text-slate-400 cursor-not-allowed"
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
                      ) : dailyTasksRemaining > 0 ? (
                        <span className="flex items-center gap-2 truncate">
                          START TASK
                          <ChevronRight className="w-4 h-4 flex-shrink-0 transition-transform group-hover/btn:translate-x-0.5" />
                        </span>
                      ) : (
                        <span className="flex items-center gap-2 truncate">
                          <Lock className="w-4 h-4 flex-shrink-0" />
                          <span>VIP Only</span>
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

      {/* VIP Modal */}
      {showVIPModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 max-w-2xl w-full shadow-2xl border border-amber-400/20">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-800">Upgrade to VIP</h2>
              <button onClick={() => setShowVIPModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-slate-600 mb-6">
              Choose your tier and enter your M-Pesa number to receive an STK push.
            </p>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {Object.entries(VIP_CONFIG).map(([tier, config]) => (
                <label
                  key={tier}
                  className={`cursor-pointer p-5 rounded-2xl border-2 transition-all ${
                    selectedVIP === tier
                      ? 'border-amber-500 bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg'
                      : 'border-slate-300 bg-white hover:border-slate-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="vipTier"
                    value={tier}
                    checked={selectedVIP === tier}
                    onChange={(e) => setSelectedVIP(e.target.value)}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <Crown className={`w-8 h-8 mx-auto mb-2 ${selectedVIP === tier ? 'text-white' : 'text-amber-500'}`} />
                    <h3 className={`font-black text-lg ${selectedVIP === tier ? 'text-white' : 'text-slate-800'}`}>
                      {tier} VIP
                    </h3>
                    <p className={`text-3xl font-black my-2 ${selectedVIP === tier ? 'text-white' : 'text-slate-900'}`}>
                      ${config.priceUSD}
                    </p>
                    <p className={`text-sm ${selectedVIP === tier ? 'text-white/90' : 'text-slate-500'}`}>
                      {formatKES(config.priceUSD)}
                    </p>
                    <p className={`mt-3 font-bold ${selectedVIP === tier ? 'text-white' : 'text-green-600'}`}>
                      {config.dailyTasks} Tasks/Day
                    </p>
                  </div>
                </label>
              ))}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 mb-2">M-Pesa Number</label>
              <input
                type="tel"
                value={mpesaNumber}
                onChange={(e) => setMpesaNumber(e.target.value)}
                placeholder="07..., 01..., or +254712345678"
                className="w-full px-4 py-3 rounded-xl border-2 border-green-400 focus:ring-2 focus:ring-green-400/20 transition"
              />
            </div>

            <button
              onClick={handleRealVIPUpgrade}
              disabled={isProcessing || !selectedVIP || !isValidMpesaNumber(mpesaNumber)}
              className={`w-full py-4 rounded-xl font-black text-lg transition-all flex items-center justify-center gap-2 ${
                selectedVIP && isValidMpesaNumber(mpesaNumber)
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-xl transform hover:scale-105'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              } ${isProcessing ? 'opacity-70' : ''}`}
            >
              {isProcessing ? (
                <>Processing Payment…</>
              ) : (
                <>
                  Pay with M-Pesa <Smartphone className="w-5 h-5" />
                </>
              )}
            </button>

            <p className="text-xs text-slate-500 text-center mt-4">
              You'll receive an STK push. Enter your PIN to complete.
            </p>
          </div>
        </div>
      )}

      {/* Notification Panel */}
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