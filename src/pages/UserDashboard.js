import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../services/firebase';
import { collection, query, where, onSnapshot, doc, getDocs, updateDoc, addDoc, serverTimestamp, orderBy, limit, getDoc } from 'firebase/firestore';
import { Trophy, Zap, Target, Crown, Clock, DollarSign, Calendar, TrendingUp, Filter, ChevronDown, LogOut } from 'lucide-react';
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
  const [liveEarnings, setLiveEarnings] = useState(0);
  const [streak, setStreak] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(0);
  const [vipProgress, setVipProgress] = useState(0);
  const [liveTaskCount, setLiveTaskCount] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [dailyTasksRemaining, setDailyTasksRemaining] = useState(0);

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

  const checkDailyReset = async (userData) => {
    if (!userData) return userData;
    const today = new Date().toDateString();
    const lastReset = userData.lastTaskResetDate?.toDate?.()?.toDateString();
    if (lastReset !== today) {
      const tasksAllowed = userData.isVIP ? 10 : (userData.isActive ? 5 : 0);
      await updateDoc(doc(db, 'users', currentUser.uid), {
        dailyTasksRemaining: tasksAllowed,
        lastTaskResetDate: serverTimestamp()
      });
      const assignmentDate = new Date().toISOString().split('T')[0];
      const assignmentQuery = query(
        collection(db, 'dailyTaskAssignments'),
        where('userId', '==', currentUser.uid),
        where('date', '==', assignmentDate),
        limit(1)
      );
      const assignmentDocs = await getDocs(assignmentQuery);
      if (assignmentDocs.empty) {
        await addDoc(collection(db, 'dailyTaskAssignments'), {
          userId: currentUser.uid,
          date: assignmentDate,
          isActive: userData.isActive || false,
          isVIP: userData.isVIP || false,
          totalTasksAllowed: tasksAllowed,
          tasksAssigned: 0,
          tasksCompleted: 0,
          tasksRemaining: tasksAllowed,
          earnings: 0,
          createdAt: serverTimestamp()
        });
      }
      return { ...userData, dailyTasksRemaining: tasksAllowed };
    }
    return userData;
  };

  useEffect(() => {
    if (!currentUser) return;
    const unsubProfile = onSnapshot(doc(db, 'users', currentUser.uid), async (docSnap) => {
      if (docSnap.exists()) {
        let data = docSnap.data();
        data = await checkDailyReset(data);
        setUserProfile(data);
        setLiveEarnings(data.thisMonthEarned || 0);
        setStreak(data.streak || 0);
        setDailyGoal(data.dailyGoal || 0);
        setVipProgress(data.vipProgress || 0);
        setDailyTasksRemaining(data.dailyTasksRemaining || 0);
        localStorage.setItem('user', JSON.stringify({ ...data, userId: currentUser.uid }));
      } else {
        toast.error('User profile not found. Please sign out and sign in again.');
        navigate('/signin');
      }
    }, (error) => {
      console.error('Error fetching user profile:', error);
      toast.error('Failed to load profile');
    });
    return () => unsubProfile();
  }, [currentUser, navigate]);

  // Retry logic for Firestore operations
  const withRetry = async (fn, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (err) {
        if (i === retries - 1) throw err;
        console.warn(`Retry ${i + 1} failed: ${err.message}`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  };

  useEffect(() => {
    if (!currentUser) return;
    const tasksQuery = query(
      collection(db, 'tasks'),
       where('isActive', '==', true),
      where('deadline', '>=', new Date().toISOString().split('T')[0]), // Only fetch tasks with future or current deadlines
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    const unsubAvailable = onSnapshot(tasksQuery, (snapshot) => {
      const tasks = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data(),
        title: d.data().title || 'Untitled',
        category: d.data().category || 'General',
        paymentAmount: Number(d.data().paymentAmount) || 0,
        duration: d.data().duration || 'N/A',
        difficulty: d.data().difficulty || 'N/A',
        requirements: d.data().requirements || [],
        deadline: d.data().deadline || 'N/A',
        zoomLink: d.data().zoomLink || '',
        isActive: d.data().isActive !== false,
        createdAt: d.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      }));
      setAvailableTasks(tasks);
      setLiveTaskCount(snapshot.size);
      setLoadingAvailable(false);
      console.log('Available tasks fetched:', tasks, `Count: ${tasks.length}`);
    }, (error) => {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load available tasks');
      setLoadingAvailable(false);
    });
    return () => unsubAvailable();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const myTasksQuery = query(
      collection(db, 'userTasks'),
      where('userId', '==', currentUser.uid),
      where('status', 'in', ['active', 'completed', 'approved', 'rejected'])
    );
    const unsubMyTasks = onSnapshot(myTasksQuery, async (snapshot) => {
      const userTasksData = [];
      for (const docSnap of snapshot.docs) {
        const userTaskData = docSnap.data();
        const taskDoc = await getDocs(query(
          collection(db, 'tasks'),
          where('__name__', '==', userTaskData.taskId),
          limit(1)
        ));
        if (!taskDoc.empty) {
          const taskDetails = taskDoc.docs[0].data();
          userTasksData.push({
            id: docSnap.id,
            ...userTaskData,
            title: taskDetails.title || 'Untitled',
            category: taskDetails.category || 'General',
            paymentAmount: Number(taskDetails.paymentAmount) || 0,
            duration: taskDetails.duration || 'N/A',
            difficulty: taskDetails.difficulty || 'N/A',
            requirements: taskDetails.requirements || [],
            deadline: taskDetails.deadline || 'N/A',
            zoomLink: taskDetails.zoomLink || '',
            status: userTaskData.status === 'active' ? 'in-progress' : userTaskData.status
          });
        }
      }
      setMyTasks(userTasksData);
      setLoadingMyTasks(false);
      console.log('My tasks fetched:', userTasksData, `Count: ${userTasksData.length}`);
    }, (error) => {
      console.error('Error fetching user tasks:', error);
      toast.error('Failed to load your tasks');
      setLoadingMyTasks(false);
    });
    return () => unsubMyTasks();
  }, [currentUser]);

  useEffect(() => {
    let timer;
    if (trackingTask) {
      timer = setInterval(() => setWorkHours((prev) => prev + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [trackingTask]);

  useEffect(() => {
    let saveTimer;
    if (trackingTask && workHours > 0) {
      saveTimer = setInterval(async () => {
        try {
          await withRetry(() => addDoc(collection(db, 'userTasks', trackingTask, 'workHours'), {
            hours: workHours / 3600,
            timestamp: serverTimestamp()
          }));
          toast.success('Work hours saved!');
        } catch (error) {
          console.error('Error saving work hours:', error);
          toast.error('Failed to save work hours.');
        }
      }, 60000);
    }
    return () => clearInterval(saveTimer);
  }, [trackingTask, workHours]);

  useEffect(() => {
    const checkAutoApproval = async () => {
      const completedTasksQuery = query(
        collection(db, 'userTasks'),
        where('userId', '==', currentUser.uid),
        where('status', '==', 'completed'),
        where('autoApprovalScheduledAt', '!=', null)
      );
      const snapshot = await getDocs(completedTasksQuery);
      snapshot.forEach(async (docSnap) => {
        const taskData = docSnap.data();
        const scheduleTime = taskData.autoApprovalScheduledAt?.toDate?.();
        if (scheduleTime && new Date() >= scheduleTime) {
          const userRef = doc(db, 'users', currentUser.uid);
          const userTaskRef = doc(db, 'userTasks', docSnap.id);
          await withRetry(() => updateDoc(userTaskRef, {
            status: 'approved',
            approvedAt: serverTimestamp(),
            autoApproved: true
          }));
          await withRetry(() => updateDoc(userRef, {
            balance: userProfile.balance + taskData.paymentAmount,
            thisMonthEarned: userProfile.thisMonthEarned + taskData.paymentAmount,
            completedTasks: userProfile.completedTasks + 1,
            successRate: userProfile.completedTasks > 0
              ? `${((userProfile.completedTasks + 1) / userProfile.appliedTasks * 100).toFixed(1)}%`
              : '100%'
          }));
          const today = new Date().toISOString().split('T')[0];
          const assignmentQuery = query(
            collection(db, 'dailyTaskAssignments'),
            where('userId', '==', currentUser.uid),
            where('date', '==', today),
            limit(1)
          );
          const assignmentDocs = await getDocs(assignmentQuery);
          if (!assignmentDocs.empty) {
            const assignmentDoc = assignmentDocs.docs[0];
            const assignmentData = assignmentDoc.data();
            await withRetry(() => updateDoc(doc(db, 'dailyTaskAssignments', assignmentDoc.id), {
              tasksCompleted: (assignmentData.tasksCompleted || 0) + 1,
              earnings: (assignmentData.earnings || 0) + taskData.paymentAmount
            }));
          }
          toast.success(`Task "${taskData.title}" approved! +$${taskData.paymentAmount}`);
        }
      });
    };
    const interval = setInterval(checkAutoApproval, 60000);
    return () => clearInterval(interval);
  }, [currentUser, userProfile]);

  const requestRevision = async (taskId) => {
    try {
      const userTaskRef = doc(db, 'userTasks', taskId);
      const userTaskDoc = await getDoc(userTaskRef);
      if (!userTaskDoc.exists()) return;
      const taskData = userTaskDoc.data();
      if (taskData.revisionCount >= taskData.maxRevisions) {
        toast.error('Maximum revisions reached for this task.');
        return;
      }
      await withRetry(() => updateDoc(userTaskRef, {
        status: 'active',
        revisionRequested: true,
        revisionCount: taskData.revisionCount + 1,
        rejectionReason: '',
        autoApprovalScheduledAt: null
      }));
      toast.success('Task revision requested! You can now resubmit.');
    } catch (error) {
      console.error('Error requesting revision:', error);
      toast.error('Failed to request revision.');
    }
  };

  const startTask = async (task) => {
    try {
      if (dailyTasksRemaining <= 0) {
        toast.error('You have no daily tasks remaining. Upgrade to VIP or wait for reset!');
        return;
      }
      const existingTaskQuery = query(
        collection(db, 'userTasks'),
        where('userId', '==', currentUser.uid),
        where('taskId', '==', task.id),
        where('status', 'in', ['active', 'completed'])
      );
      const existingTasks = await getDocs(existingTaskQuery);
      if (!existingTasks.empty) {
        toast.error('You already have this task assigned!');
        return;
      }
      const userTaskData = {
        userId: currentUser.uid,
        taskId: task.id,
        title: task.title,
        status: 'active',
        assignedAt: serverTimestamp(),
        completedAt: null,
        approvedAt: null,
        submissionData: {},
        paymentAmount: task.paymentAmount,
        isPaid: false,
        paidAt: null,
        reviewerId: null,
        reviewNotes: '',
        rejectionReason: '',
        revisionRequested: false,
        revisionCount: 0,
        maxRevisions: 2,
        autoApprovalScheduledAt: null,
        autoApproved: false
      };
      await withRetry(() => addDoc(collection(db, 'userTasks'), userTaskData));
      await withRetry(() => updateDoc(doc(db, 'users', currentUser.uid), {
        dailyTasksRemaining: dailyTasksRemaining - 1,
        appliedTasks: (userProfile?.appliedTasks || 0) + 1
      }));
      const today = new Date().toISOString().split('T')[0];
      const assignmentQuery = query(
        collection(db, 'dailyTaskAssignments'),
        where('userId', '==', currentUser.uid),
        where('date', '==', today),
        limit(1)
      );
      const assignmentDocs = await getDocs(assignmentQuery);
      if (!assignmentDocs.empty) {
        const assignmentDoc = assignmentDocs.docs[0];
        const assignmentData = assignmentDoc.data();
        await withRetry(() => updateDoc(doc(db, 'dailyTaskAssignments', assignmentDoc.id), {
          tasksAssigned: (assignmentData.tasksAssigned || 0) + 1,
          tasksRemaining: dailyTasksRemaining - 1
        }));
      }
      navigate('/working', { state: { task: { ...task, payRate: task.paymentAmount } } });
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      toast.success(`Starting: ${task.title}`);
    } catch (error) {
      console.error('Error starting task:', error);
      toast.error('Failed to start task. Please try again.');
    }
  };

  const handleTimeTracking = async (taskId) => {
    if (trackingTask === taskId) {
      try {
        await withRetry(() => addDoc(collection(db, 'userTasks', taskId, 'workHours'), {
          hours: workHours / 3600,
          timestamp: serverTimestamp()
        }));
        setTrackingTask(null);
        setWorkHours(0);
        toast.success('Work hours saved!');
      } catch (error) {
        console.error('Error saving work hours:', error);
        toast.error('Failed to save work hours.');
      }
    } else {
      setTrackingTask(taskId);
      setWorkHours(0);
      toast.success('Timer started');
    }
  };

  const filteredTasks = availableTasks.filter(task => {
    const cat = categoryFilter === 'all' || task.category === categoryFilter;
    const price = priceFilter === 'all' ||
      (priceFilter === 'low' && task.paymentAmount <= 12) ||
      (priceFilter === 'medium' && task.paymentAmount > 12 && task.paymentAmount <= 16) ||
      (priceFilter === 'high' && task.paymentAmount > 16);
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
              onClick={() => {
                auth.signOut().then(() => {
                  localStorage.removeItem('user');
                  navigate('/signin');
                });
              }}
              className="inline-flex items-center px-4 py-2 rounded-xl font-medium transition-all bg-white/10 text-white hover:bg-white/20 border border-white/20"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-amber-400/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-100 mb-1">
                  Balance
                </p>
                <p className="text-5xl font-black text-amber-400">
                  ${userProfile?.balance?.toFixed(2) || '0.00'}
                </p>
                <div className="flex items-center mt-3 space-x-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-300 font-medium">
                    Ksh. {(userProfile?.balance * 129.5555).toFixed(2) || '0.00'}
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Trophy, value: streak, label: 'Day Streak', color: 'yellow' },
            { icon: Target, value: `${dailyGoal}%`, label: 'Daily Goal', color: 'green' },
            { icon: Crown, value: dailyTasksRemaining, label: userProfile?.isVIP ? 'VIP Tasks Left' : 'Tasks Remaining', color: 'purple' },
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
                    className="w-full px-4 py-2 rounded-xl border-2 border-blue/20 bg-blue/5 backdrop-blur-md text-blue focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                  >
                    <option value="all">All Categories</option>
                    <option value="Translation">Translation</option>
                    <option value="Content Writing">Content Writing</option>
                    <option value="Data Labeling">Data Labeling</option>
                    <option value="Image Classification">Image Classification</option>
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
                    <option value="low">$1 – $12</option>
                    <option value="medium">$13 – $16</option>
                    <option value="high">$17+</option>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTasks.map(task => (
                  <div
                    key={task.id}
                    className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:bg-white/10 hover:border-amber-400/30 transition-all hover:shadow-xl"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-blue-400/20 text-blue-300 border border-blue-400/30">
                        {task.category}
                      </span>
                      <span className="text-lg font-black text-amber-400">
                        ${task.paymentAmount}
                      </span>
                    </div>
                    <h3 className="text-base font-bold mb-2 text-white">
                      {task.title}
                    </h3>
                    <p className="text-sm mb-2 text-blue-100">
                      Duration: {task.duration}
                    </p>
                    <p className="text-sm mb-2 text-blue-100">
                      Difficulty: {task.difficulty}
                    </p>
                    <p className="text-sm mb-2 text-blue-100">
                      Deadline: {task.deadline}
                    </p>
                    <p className="text-sm mb-4 line-clamp-2 text-blue-100">
                      Requirements: {task.requirements.join(', ') || 'None'}
                    </p>
                    {task.zoomLink && (
                      <p className="text-sm mb-4 text-blue-100">
                        <a href={task.zoomLink} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">
                          Zoom Link
                        </a>
                      </p>
                    )}
                    <button
                      onClick={() => startTask(task)}
                      disabled={dailyTasksRemaining <= 0}
                      className={`w-full font-bold py-2 px-4 rounded-xl transition-all ${
                        dailyTasksRemaining > 0
                          ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 hover:shadow-lg transform hover:scale-[1.02]'
                          : 'bg-gray-500 text-gray-300 cursor-not-allowed opacity-50'
                      }`}
                    >
                      {dailyTasksRemaining > 0 ? 'Start Task' : 'No Tasks Left'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-amber-400/20">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-2xl font-black text-white">
              My Progress
            </h2>
            <p className="text-sm text-blue-100 mt-1">
              Track your active, completed, approved, and rejected tasks
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
                                  {task.category}
                                </span>
                                <span className="text-xs text-blue-200">
                                  Deadline: {task.deadline}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="text-lg font-black text-amber-400">
                                ${task.paymentAmount}
                              </span>
                              <button
                                className={`rounded-md px-3 py-1 transition-colors ${
                                  trackingTask === task.id
                                    ? 'bg-red-600 text-white hover:bg-red-700'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                                onClick={() => handleTimeTracking(task.id)}
                              >
                                {trackingTask === task.id
                                  ? `Stop (${Math.floor(workHours / 60)}m ${workHours % 60}s)`
                                  : 'Track Time'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                                  {task.category}
                                </span>
                                {task.approvedAt && (
                                  <span className="text-xs text-blue-200">
                                    {new Date(task.approvedAt.toDate()).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="text-right">
                                <span className="text-lg font-black text-green-400 block">
                                  +${task.paymentAmount}
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
                {myTasks.filter(t => t.status === 'rejected').length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold text-red-300 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Rejected ({myTasks.filter(t => t.status === 'rejected').length})
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {myTasks.filter(t => t.status === 'rejected').map(task => (
                        <div
                          key={task.id}
                          className="bg-white/5 backdrop-blur-md border border-red-400/30 rounded-2xl p-4 hover:bg-white/10 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-bold text-white mb-2">
                                {task.title}
                              </h4>
                              <div className="flex items-center space-x-3">
                                <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-red-400/20 text-red-300 border border-red-400/30">
                                  ✗ Rejected
                                </span>
                                <span className="text-sm text-blue-100">
                                  {task.category}
                                </span>
                                {task.rejectionReason && (
                                  <span className="text-xs text-red-200">
                                    Reason: {task.rejectionReason}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              {task.revisionCount < task.maxRevisions && (
                                <button
                                  onClick={() => requestRevision(task.id)}
                                  className="bg-amber-400 text-blue-900 font-bold px-4 py-2 rounded-xl hover:shadow-lg transition"
                                >
                                  Request Revision
                                </button>
                              )}
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