import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/firebase';
import { collection, query, where, onSnapshot, doc, limit, startAfter, getDocs } from 'firebase/firestore';
import { Trophy, Zap, Target, Crown, Clock, DollarSign, Calendar, TrendingUp, Filter, ChevronDown, LogOut, User } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import Confetti from 'react-confetti';
import 'react-toastify/dist/ReactToastify.css';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const UserDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [availableTasks, setAvailableTasks] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [loadingAvailable, setLoadingAvailable] = useState(true);
  const [loadingMyTasks, setLoadingMyTasks] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [trackingTask, setTrackingTask] = useState(null);
  const [workHours, setWorkHours] = useState(0);
  const [lastTaskDoc, setLastTaskDoc] = useState(null);
  const [hasMoreTasks, setHasMoreTasks] = useState(true);
  const [liveEarnings, setLiveEarnings] = useState(0);
  const [streak, setStreak] = useState(7);
  const [dailyGoal, setDailyGoal] = useState(68);
  const [vipProgress, setVipProgress] = useState(74);
  const [liveTaskCount, setLiveTaskCount] = useState(3124);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const SYSTEM_USER_ID = 'system-tasks';

  // Payout countdown
  const getNextThursday = () => {
    const now = new Date();
    const thursday = new Date(now);
    thursday.setDate(now.getDate() + ((4 - now.getDay() + 7) % 7 || 7));
    thursday.setHours(23, 59, 59, 0);
    return thursday;
  };
  const [timeLeft, setTimeLeft] = useState(getNextThursday() - new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      const diff = getNextThursday() - new Date();
      setTimeLeft(diff > 0 ? diff : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (ms) => {
    const days = Math.floor(ms / 86400000);
    const hours = Math.floor((ms % 86400000) / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  // Fetch data
  useEffect(() => {
    if (!currentUser) return;

    const unsubProfile = onSnapshot(doc(db, 'users', currentUser.uid), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setUserProfile(data);
        setLiveEarnings(data.thisMonthEarned || 0);
        setStreak(data.streak || 7);
        setDailyGoal(data.dailyGoal || 68);
        setVipProgress(data.vipProgress || 74);
      }
    });

    const q = query(
      collection(db, 'users', SYSTEM_USER_ID, 'tasks'),
      where('status', '==', 'open'),
      where('visibility', '==', 'public'),
      limit(10)
    );
    const unsubAvailable = onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setAvailableTasks(tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setLastTaskDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMoreTasks(snapshot.docs.length === 10);
      setLiveTaskCount(3100 + tasks.length);
      setLoadingAvailable(false);
    });

    const myQ = query(
      collection(db, 'users', SYSTEM_USER_ID, 'tasks'),
      where('assignedTo', '==', currentUser.uid),
      where('status', 'in', ['in-progress', 'completed'])
    );
    const unsubMyTasks = onSnapshot(myQ, (snapshot) => {
      setMyTasks(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoadingMyTasks(false);
    });

    return () => { unsubProfile(); unsubAvailable(); unsubMyTasks(); };
  }, [currentUser]);

  const loadMoreTasks = async () => {
    if (!hasMoreTasks || loadingAvailable) return;
    setLoadingAvailable(true);
    try {
      const nextQ = query(
        collection(db, 'users', SYSTEM_USER_ID, 'tasks'),
        where('status', '==', 'open'),
        where('visibility', '==', 'public'),
        limit(10),
        startAfter(lastTaskDoc)
      );
      const snapshot = await getDocs(nextQ);
      const newTasks = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setAvailableTasks(prev => [...prev, ...newTasks]);
      setLastTaskDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMoreTasks(snapshot.docs.length === 10);
    } catch {
      toast.error('Failed to load more tasks.');
    } finally {
      setLoadingAvailable(false);
    }
  };

  const startTask = (task) => {
    navigate('/working', { state: { task } });
    setLiveEarnings(prev => prev + (task.payRate || 0));
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
    toast.success(`Starting: ${task.title}`);
  };

  const handleTimeTracking = (taskId) => {
    if (trackingTask === taskId) {
      setTrackingTask(null);
      setWorkHours(0);
      toast.success('Timer stopped');
    } else {
      setTrackingTask(taskId);
      setWorkHours(0);
      toast.success('Timer started');
    }
  };

  const filteredTasks = availableTasks.filter(task => {
    const cat = categoryFilter === 'all' || task.type === categoryFilter;
    const price = priceFilter === 'all' ||
      (priceFilter === 'low' && task.payRate <= 12) ||
      (priceFilter === 'medium' && task.payRate > 12 && task.payRate <= 16) ||
      (priceFilter === 'high' && task.payRate > 16);
    return cat && price;
  });

  if (!currentUser) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="text-center">
        <p className="text-2xl font-semibold text-white">Authentication Required</p>
        <p className="text-blue-200 mt-2">Please sign in to access your dashboard</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      
      {showConfetti && <Confetti recycle={false} numberOfPieces={150} />}

      {/* Header */}
      <header className="bg-white/10 backdrop-blur-xl border-b border-white/20 sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center space-x-3 mb-1">
                <h1 className="text-2xl font-black text-amber-400">Train2Earn</h1>
                <span className="text-xs bg-amber-400/20 px-2 py-1 rounded-full text-amber-300">Dashboard</span>
              </div>
              <p className="text-sm text-blue-100">
                Welcome back, {userProfile?.name || 'User'}
              </p>
            </div>
            <button 
              onClick={() => navigate('/signin')}
              className="inline-flex items-center px-4 py-2 rounded-xl font-medium transition-all bg-white/10 text-white hover:bg-white/20 border border-white/20"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Earnings Overview */}
  
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
  <div className="lg:col-span-2 bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-amber-400/20 p-6">
    <div className="flex items-center justify-between"> {/* changed items-start → items-center */}
      <div>
        <p className="text-sm font-medium text-blue-100 mb-1">
          Monthly Earnings
        </p>
        <p className="text-5xl font-black text-amber-400">
          ${liveEarnings.toFixed(2)}
        </p>
        <div className="flex items-center mt-3 space-x-2">
          <TrendingUp className="w-4 h-4 text-green-400" />
          <span className="text-sm text-green-300 font-medium">
            Ksh. {(liveEarnings * 129.5555).toFixed(2)}
          </span>
        </div>
      </div>

      <button
        onClick={() => toast.success('Withdrawal submitted!')}
        className="bg-amber-400 text-blue-900 font-bold px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition"
      >
        Withdraw
      </button>
    </div>
  </div>

  <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-amber-400/20 p-6">
    <div className="flex items-center space-x-3 mb-3">
      <Calendar className="w-5 h-5 text-amber-400" />
      <p className="text-sm font-medium text-blue-100">
        Next Payout
      </p>
    </div>
    <p className="text-2xl font-black text-white mb-2">
      {formatTime(timeLeft)}
    </p>
    <p className="text-xs text-blue-200">
      Every Thursday at 11:59 PM
    </p>
  </div>
</div>


        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[ 
            { icon: Trophy, value: streak, label: 'Day Streak', color: 'yellow' },
            { icon: Target, value: `${dailyGoal}%`, label: 'Daily Goal', color: 'green' },
            { icon: Crown, value: `${vipProgress}%`, label: 'VIP Progress', color: 'purple' },
            { icon: Zap, value: liveTaskCount, label: 'Available Tasks', color: 'blue' }
          ].map((stat, i) => (
            <div key={i} className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-xl border border-amber-400/20 p-5">
              <div className={`inline-flex p-2 rounded-xl mb-3 ${
                stat.color === 'yellow' ? 'bg-yellow-400/20 border border-yellow-400/30' :
                stat.color === 'green' ? 'bg-green-400/20 border border-green-400/30' :
                stat.color === 'purple' ? 'bg-purple-400/20 border border-purple-400/30' :
                'bg-blue-400/20 border border-blue-400/30'
              }`}>
                <stat.icon className={`w-5 h-5 ${
                  stat.color === 'yellow' ? 'text-yellow-400' :
                  stat.color === 'green' ? 'text-green-400' :
                  stat.color === 'purple' ? 'text-purple-400' :
                  'text-blue-400'
                }`} />
              </div>
              <p className="text-2xl font-black text-white mb-1">{stat.value}</p>
              <p className="text-sm text-blue-100">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Available Tasks Section */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-amber-400/20 mb-8">
          <div className="p-6 border-b border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-white">
                  Available Tasks
                </h2>
                <p className="text-sm text-blue-100 mt-1">
                  {filteredTasks.length} tasks match your criteria
                </p>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-4 py-2 rounded-xl font-semibold transition-all bg-white/10 text-white hover:bg-white/20 border border-white/20"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/10">
<div>
  <label className="block text-sm font-medium mb-2 text-blue-100">
    Category
  </label>
  <select
    value={categoryFilter}
    onChange={e => setCategoryFilter(e.target.value)}
    className="w-full px-4 py-2 rounded-xl border-2 border-blue/20 bg-blue/5 backdrop-blur-md text-blue focus:ring-2 focus:ring-amber-400 focus:border-amber-400" >
    <option value="all">All Categories</option>
    <option value="Translation">Translation</option>
    <option value="Content Writing">Content Writing</option>
  </select>
</div>


                <div>
                  <label className="block text-sm font-medium mb-2 text-blue-100">
                    Price Range
                  </label>
                  <select 
                    value={priceFilter} 
                    onChange={e => setPriceFilter(e.target.value)} 
                    className="w-full px-4 py-2 rounded-xl border-2 border-blue/20 bg-blue/5 backdrop-blur-md text-blue focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                  >
                    <option value="all">All Prices</option>
                    <option value="low">$1 – $4</option>
                    <option value="medium">$5 – $19</option>
                    <option value="high">$20+</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="p-6">
            {loadingAvailable ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => <Skeleton key={i} height={200} className="rounded-2xl" />)}
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-blue-100">
                  No tasks match your current filters
                </p>
                <button
                  onClick={() => { setCategoryFilter('all'); setPriceFilter('all'); }}
                  className="mt-4 text-amber-400 hover:text-amber-300 font-medium"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTasks.map(task => (
                    <div 
                      key={task.id} 
                      className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:bg-white/10 hover:border-amber-400/30 transition-all hover:shadow-xl"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-blue-400/20 text-blue-300 border border-blue-400/30">
                          {task.type}
                        </span>
                        <span className="text-lg font-black text-amber-400">
                          ${task.payRate}
                        </span>
                      </div>
                      <h3 className="text-base font-bold mb-2 text-white">
                        {task.title}
                      </h3>
                      <p className="text-sm mb-4 line-clamp-2 text-blue-100">
                        {task.description}
                      </p>
                      <button
                        onClick={() => startTask(task)}
                        className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-bold py-2 px-4 rounded-xl transition-all hover:shadow-lg transform hover:scale-[1.02]"
                      >
                        Start Task
                      </button>
                    </div>
                  ))}
                </div>
                {hasMoreTasks && (
                  <div className="text-center mt-6">
                    <button 
                      onClick={loadMoreTasks} 
                      disabled={loadingAvailable}
                      className="px-6 py-2 rounded-xl font-semibold transition-all bg-white/10 text-white hover:bg-white/20 border border-white/20 disabled:opacity-50"
                    >
                      {loadingAvailable ? 'Loading...' : 'Load More Tasks'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* My Progress Section */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-amber-400/20">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-2xl font-black text-white">
              My Progress
            </h2>
            <p className="text-sm text-blue-100 mt-1">
              Track your active, completed, and approved tasks
            </p>
          </div>

          <div className="p-6">
            {loadingMyTasks ? (
              <Skeleton count={3} height={80} className="mb-3" />
            ) : myTasks.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 mx-auto mb-4 text-blue-300" />
                <p className="text-lg text-blue-100 mb-2">
                  No tasks yet
                </p>
                <p className="text-sm text-blue-200">
                  Start a task from the available tasks above
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Active Tasks */}
                {myTasks.filter(t => t.status === 'in-progress').length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold text-amber-300 flex items-center">
                        <Clock className="w-5 h-5 mr-2" />
                        Active Tasks ({myTasks.filter(t => t.status === 'in-progress').length})
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {myTasks.filter(t => t.status === 'in-progress').map(task => (
                        <div 
                          key={task.id} 
                          className="bg-white/5 backdrop-blur-md border border-yellow-400/30 rounded-2xl p-4 hover:bg-white/10 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-bold text-white mb-2">
                                {task.title}
                              </h4>
                              <div className="flex items-center space-x-3">
                                <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-400/30">
                                  In Progress
                                </span>
                                <span className="text-sm text-blue-100">
                                  {task.type}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <span className="text-lg font-black text-amber-400">
                                ${task.payRate}
                              </span>
                              <button
                                onClick={() => handleTimeTracking(task.id)}
                                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                                  trackingTask === task.id
                                    ? 'bg-red-600 hover:bg-red-700 text-white'
                                    : 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 hover:shadow-lg'
                                }`}
                              >
                                {trackingTask === task.id ? 'Stop Timer' : 'Track Time'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Completed Tasks (Under Review) */}
                {myTasks.filter(t => t.status === 'completed').length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold text-blue-300 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Under Review ({myTasks.filter(t => t.status === 'completed').length})
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {myTasks.filter(t => t.status === 'completed').map(task => (
                        <div 
                          key={task.id} 
                          className="bg-white/5 backdrop-blur-md border border-blue-400/30 rounded-2xl p-4 hover:bg-white/10 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-bold text-white mb-2">
                                {task.title}
                              </h4>
                              <div className="flex items-center space-x-3">
                                <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-blue-400/20 text-blue-300 border border-blue-400/30">
                                  Under Review
                                </span>
                                <span className="text-sm text-blue-100">
                                  {task.type}
                                </span>
                                <span className="text-xs text-blue-200">
                                  Approval in 5-30 minutes
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="text-lg font-black text-amber-400">
                                ${task.payRate}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Approved Tasks */}
                {myTasks.filter(t => t.status === 'approved').length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold text-green-300 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Approved ({myTasks.filter(t => t.status === 'approved').length})
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {myTasks.filter(t => t.status === 'approved').map(task => (
                        <div 
                          key={task.id} 
                          className="bg-white/5 backdrop-blur-md border border-green-400/30 rounded-2xl p-4 hover:bg-white/10 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-bold text-white mb-2">
                                {task.title}
                              </h4>
                              <div className="flex items-center space-x-3">
                                <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-green-400/20 text-green-300 border border-green-400/30">
                                  ✓ Approved
                                </span>
                                <span className="text-sm text-blue-100">
                                  {task.type}
                                </span>
                                {task.approvedAt && (
                                  <span className="text-xs text-blue-200">
                                    {new Date(task.approvedAt).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="text-right">
                                <span className="text-lg font-black text-green-400 block">
                                  +${task.payRate}
                                </span>
                                <span className="text-xs text-green-300">
                                  Paid
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <ToastContainer position="bottom-right" theme="dark" />
    </div>
  );
};

export default UserDashboard;