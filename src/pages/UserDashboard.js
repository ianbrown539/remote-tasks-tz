import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { collection, query, where, onSnapshot, addDoc, doc, limit, startAfter, getDocs } from 'firebase/firestore';
import { Clock, DollarSign, FileText, Languages, Trophy } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CompleteApplication from '../components/CompleteApplication';

const UserDashboard = () => {
  const { currentUser } = useAuth();
  const [availableTasks, setAvailableTasks] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [userApplications, setUserApplications] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [loadingAvailable, setLoadingAvailable] = useState(true);
  const [loadingMyTasks, setLoadingMyTasks] = useState(true);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [trackingTask, setTrackingTask] = useState(null);
  const [workHours, setWorkHours] = useState(0);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loadingApply, setLoadingApply] = useState(null); // Track loading state for each task
  const [lastTaskDoc, setLastTaskDoc] = useState(null);
  const [hasMoreTasks, setHasMoreTasks] = useState(true);

  // Retry logic for Firestore operations
  const withRetry = async (fn, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (err) {
        if (i === retries - 1) throw err;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  };

  // Fetch user profile, tasks, and applications
  useEffect(() => {
    if (!currentUser) {
      setError('Please sign in to view the dashboard.');
      setLoadingAvailable(false);
      setLoadingMyTasks(false);
      return;
    }

    // Fetch user profile
    const userRef = doc(db, 'users', currentUser.uid);
    const unsubscribeUser = onSnapshot(
      userRef,
      (doc) => {
        if (doc.exists()) {
          setUserProfile(doc.data());
        } else {
          setError('User profile not found.');
        }
      },
      (err) => {
        console.error('Error fetching user profile:', err);
        setError(
          err.code === 'permission-denied'
            ? 'Permission denied when fetching profile.'
            : 'Failed to load user profile.'
        );
      }
    );

    // Fetch available tasks with pagination
    const availableQuery = query(
      collection(db, 'tasks'),
      where('status', '==', 'open'),
      where('visibility', '==', 'public'),
      limit(10)
    );
    const unsubscribeAvailable = onSnapshot(
      availableQuery,
      (snapshot) => {
        const tasks = snapshot.docs
          .map((doc) => {
            const data = doc.data();
            if (!data.title || !data.type || !data.payRate) {
              console.warn(`Task ${doc.id} missing required fields:`, data);
              return null;
            }
            return {
              id: doc.id,
              title: data.title,
              type: data.type,
              payRate: Number(data.payRate),
              status: data.status,
              createdAt: data.createdAt || new Date().toISOString(),
              requirements: Array.isArray(data.requirements) ? data.requirements : [],
              description: data.description || 'No description provided',
              duration: data.duration || 'N/A',
              difficulty: data.difficulty || 'N/A',
              deadline: data.deadline || 'N/A',
              zoomLink: data.zoomLink || '',
            };
          })
          .filter((task) => task !== null)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setAvailableTasks(tasks);
        setLastTaskDoc(snapshot.docs[snapshot.docs.length - 1]);
        setHasMoreTasks(snapshot.docs.length === 10);
        console.log('Available Tasks:', tasks, `Count: ${tasks.length}`);
        setLoadingAvailable(false);
      },
      (err) => {
        console.error('Error fetching available tasks:', err, err.code);
        setError(
          err.code === 'permission-denied'
            ? 'Permission denied when fetching tasks. Check Firestore rules.'
            : `Failed to load available tasks: ${err.message}`
        );
        setLoadingAvailable(false);
      }
    );

    // Fetch my tasks
    const myTasksQuery = query(collection(db, 'tasks'), where('assignedTo', '==', currentUser.uid));
    const unsubscribeMyTasks = onSnapshot(
      myTasksQuery,
      (snapshot) => {
        const tasks = snapshot.docs
          .map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              title: data.title || 'Untitled',
              type: data.type || 'General',
              payRate: Number(data.payRate) || 0,
              status: data.status || 'in-progress',
              createdAt: data.createdAt || new Date().toISOString(),
              requirements: Array.isArray(data.requirements) ? data.requirements : [],
              description: data.description || 'No description provided',
              duration: data.duration || 'N/A',
              difficulty: data.difficulty || 'N/A',
              deadline: data.deadline || 'N/A',
              zoomLink: data.zoomLink || '',
              progress: Number(data.progress) || 0,
            };
          })
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setMyTasks(tasks);
        console.log('My Tasks:', tasks, `Count: ${tasks.length}`);
        setLoadingMyTasks(false);
      },
      (err) => {
        console.error('Error fetching my tasks:', err);
        setError(
          err.code === 'permission-denied'
            ? 'Permission denied when fetching your tasks.'
            : 'Failed to load your tasks.'
        );
        setLoadingMyTasks(false);
      }
    );

    // Fetch user applications
    const applicationsQuery = query(collection(db, 'applications'), where('userId', '==', currentUser.uid));
    const unsubscribeApplications = onSnapshot(
      applicationsQuery,
      (snapshot) => {
        const apps = snapshot.docs.map((doc) => ({
          id: doc.id,
          taskId: doc.data().taskId,
          status: doc.data().status,
        }));
        setUserApplications(apps);
        console.log('User Applications:', apps, `Count: ${apps.length}`);
      },
      (err) => {
        console.error('Error fetching applications:', err);
        setError('Failed to load applications. Some features may be affected.');
      }
    );

    return () => {
      unsubscribeUser();
      unsubscribeAvailable();
      unsubscribeMyTasks();
      unsubscribeApplications();
    };
  }, [currentUser]);

  // Load more tasks
  const loadMoreTasks = async () => {
    if (!hasMoreTasks || loadingAvailable) return;
    setLoadingAvailable(true);
    try {
      const nextQuery = query(
        collection(db, 'tasks'),
        where('status', '==', 'open'),
        where('visibility', '==', 'public'),
        limit(10),
        startAfter(lastTaskDoc)
      );
      const snapshot = await withRetry(() => getDocs(nextQuery));
      const newTasks = snapshot.docs
        .map((doc) => {
          const data = doc.data();
          if (!data.title || !data.type || !data.payRate) {
            console.warn(`Task ${doc.id} missing required fields:`, data);
            return null;
          }
          return {
            id: doc.id,
            title: data.title,
            type: data.type,
            payRate: Number(data.payRate),
            status: data.status,
            createdAt: data.createdAt || new Date().toISOString(),
            requirements: Array.isArray(data.requirements) ? data.requirements : [],
            description: data.description || 'No description provided',
            duration: data.duration || 'N/A',
            difficulty: data.difficulty || 'N/A',
            deadline: data.deadline || 'N/A',
            zoomLink: data.zoomLink || '',
          };
        })
        .filter((task) => task !== null);
      setAvailableTasks((prev) => [...prev, ...newTasks]);
      setLastTaskDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMoreTasks(snapshot.docs.length === 10);
      console.log('Loaded more tasks:', newTasks, `Total: ${availableTasks.length + newTasks.length}`);
    } catch (err) {
      console.error('Error loading more tasks:', err);
      toast.error('Failed to load more tasks.');
    } finally {
      setLoadingAvailable(false);
    }
  };

  // Handle apply button click with 3-second loader
  const handleApplyClick = (task) => {
    if (!hasApplied(task.id)) {
      setLoadingApply(task.id);
      setTimeout(() => {
        setLoadingApply(null);
        setSelectedTask(task);
        setIsApplyModalOpen(true);
      }, 3000);
    }
  };

  // Time tracking
  useEffect(() => {
    let timer;
    if (trackingTask) {
      timer = setInterval(() => setWorkHours((prev) => prev + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [trackingTask]);

  // Periodic saving of work hours
  useEffect(() => {
    let saveTimer;
    if (trackingTask && workHours > 0) {
      saveTimer = setInterval(async () => {
        try {
          await withRetry(() =>
            addDoc(collection(db, 'users', currentUser.uid, 'workHours'), {
              taskId: trackingTask,
              hours: workHours / 3600,
              timestamp: new Date().toISOString(),
            })
          );
          toast.success('Work hours saved!');
        } catch (error) {
          console.error('Error saving work hours:', error);
          toast.error('Failed to save work hours.');
        }
      }, 60000);
    }
    return () => clearInterval(saveTimer);
  }, [trackingTask, workHours, currentUser]);

  // Time tracking
  const handleTimeTracking = async (taskId) => {
    if (trackingTask === taskId) {
      try {
        await withRetry(() =>
          addDoc(collection(db, 'users', currentUser.uid, 'workHours'), {
            taskId,
            hours: workHours / 3600,
            timestamp: new Date().toISOString(),
          })
        );
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
    }
  };

  // Filter tasks
  const filteredTasks = availableTasks.filter((task) => {
    const categoryMatch = categoryFilter === 'all' || task.type === categoryFilter;
    const priceMatch =
      priceFilter === 'all' ||
      (priceFilter === 'low' && task.payRate <= 12) ||
      (priceFilter === 'medium' && task.payRate > 12 && task.payRate <= 16) ||
      (priceFilter === 'high' && task.payRate > 16);
    return categoryMatch && priceMatch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
      case 'approved':
        return 'bg-green-500';
      case 'completed':
        return 'bg-blue-500';
      case 'applied':
      case 'pending':
        return 'bg-yellow-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Check if user has applied to a task
  const hasApplied = (taskId) =>
    userApplications.some(
      (app) => app.taskId === taskId && ['pending', 'approved'].includes(app.status)
    );

  return (
    <>
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4 py-6 relative">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-white border rounded-lg p-6 shadow-sm">
              <div className="flex items-center space-x-2">
                <Trophy className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Tasks Completed</p>
                  <p className="text-2xl font-bold">{userProfile?.completedTasks || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white border rounded-lg p-6 shadow-sm">
              <div className="flex items-center space-x-2">
                <Clock className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Active Tasks</p>
                  <p className="text-2xl font-bold">{myTasks.filter((t) => t.status === 'in-progress').length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white border rounded-lg p-6 shadow-sm">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">This Month</p>
                  <p className="text-2xl font-bold">${userProfile?.thisMonthEarned || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white border rounded-lg p-6 shadow-sm">
              <div className="flex items-center space-x-2">
                <FileText className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Success Rate</p>
                  <p className="text-2xl font-bold">{userProfile?.successRate || '0%'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Available Tasks Filters */}
          <div className="bg-white border rounded-lg p-6 mb-8 shadow-sm">
            <h2 className="text-lg font-semibold mb-2">Available Tasks</h2>
            <p className="text-sm text-gray-500 mb-4">Browse and apply for available tasks</p>
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min-w-[200px]">
                <label htmlFor="categoryFilter" className="text-sm font-medium mb-2 block">
                  Category
                </label>
                <select
                  id="categoryFilter"
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  aria-label="Filter tasks by category"
                >
                  <option value="all">All Categories</option>
                  <option value="Translation">Translation</option>
                  <option value="Content Writing">Content Writing</option>
                  <option value="Graphic Design">Graphic Design</option>
                  <option value="Data Entry">Data Entry</option>
                  <option value="Web Development">Web Development</option>
                </select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <label htmlFor="priceFilter" className="text-sm font-medium mb-2 block">
                  Price Range
                </label>
                <select
                  id="priceFilter"
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value)}
                  aria-label="Filter tasks by price range"
                >
                  <option value="all">All Prices</option>
                  <option value="low">$1 - $12</option>
                  <option value="medium">$13 - $16</option>
                  <option value="high">$17+</option>
                </select>
              </div>
            </div>

            {/* Available Tasks Cards */}
            {loadingAvailable ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="bg-white border rounded-lg p-6 shadow-sm">
                    <Skeleton height={24} width={200} />
                    <Skeleton height={16} width={100} className="mt-2" />
                    <Skeleton height={16} width={150} className="mt-2" />
                    <Skeleton height={16} width={120} className="mt-2" />
                    <Skeleton height={40} width={120} className="mt-4" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600">{error}</p>
                <button
                  className="mt-4 bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700"
                  onClick={() => window.location.reload()}
                  aria-label="Retry loading tasks"
                >
                  Retry
                </button>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No available tasks match your filters.</p>
                <button
                  className="mt-4 bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700"
                  onClick={() => {
                    setCategoryFilter('all');
                    setPriceFilter('all');
                  }}
                  aria-label="Reset filters"
                >
                  View All Tasks
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTasks.map((task) => (
                    <div key={task.id} className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                      <h3 className="text-lg font-semibold mb-2">{task.title}</h3>
                      <div className="flex items-center mb-2">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            task.type === 'Translation'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {task.type === 'Translation' ? (
                            <Languages className="h-3 w-3 mr-1" />
                          ) : (
                            <FileText className="h-3 w-3 mr-1" />
                          )}
                          {task.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{task.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="text-sm text-gray-500">Price: ${task.payRate}</span>
                        <span className="text-sm text-gray-500">Duration: {task.duration}</span>
                        <span className="text-sm text-gray-500">Difficulty: {task.difficulty}</span>
                      </div>
                      <button
                        className={`w-full rounded-md px-4 py-2 transition-colors flex items-center justify-center ${
                          hasApplied(task.id)
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : loadingApply === task.id
                            ? 'bg-blue-600 text-white opacity-50 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                        onClick={() => handleApplyClick(task)}
                        disabled={hasApplied(task.id) || loadingApply === task.id}
                        aria-label={
                          hasApplied(task.id)
                            ? `Already applied for ${task.title}`
                            : loadingApply === task.id
                            ? `Loading application for ${task.title}`
                            : `Apply for ${task.title}`
                        }
                      >
                        {hasApplied(task.id) ? (
                          'Applied'
                        ) : loadingApply === task.id ? (
                          <>
                            <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                              />
                            </svg>
                            Loading...
                          </>
                        ) : (
                          'Apply Now'
                        )}
                      </button>
                    </div>
                  ))}
                </div>
                {hasMoreTasks && (
                  <div className="text-center mt-6">
                    <button
                      className={`bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700 ${
                        loadingAvailable ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      onClick={loadMoreTasks}
                      disabled={loadingAvailable}
                      aria-label="Load more tasks"
                    >
                      {loadingAvailable ? 'Loading...' : 'Load More'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Productivity Tips */}
          <div className="bg-white border rounded-lg p-6 mb-8 shadow-sm">
            <h2 className="text-lg font-semibold mb-2">Work-from-Home Tips</h2>
            <p className="text-sm text-gray-500 mb-4">Maximize your remote work productivity</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Create a dedicated workspace free from distractions.</li>
              <li>Schedule regular breaks to maintain focus.</li>
              <li>Use Zoom for virtual client meetings (check task details for links).</li>
            </ul>
          </div>

          {/* Task Application Modal */}
          {isApplyModalOpen && (
            <CompleteApplication
              task={selectedTask}
              userProfile={userProfile}
              currentUser={currentUser}
              onClose={() => setIsApplyModalOpen(false)}
              onSubmit={() => {
                setIsApplyModalOpen(false);
                toast.success('Application submitted successfully!');
              }}
            />
          )}

          {/* My Tasks Section */}
          <div className="bg-white border rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-2">My Tasks</h2>
            <p className="text-sm text-gray-500 mb-4">Manage your assigned tasks</p>
            {loadingMyTasks ? (
              <div className="space-y-4">
                <Skeleton height={40} count={5} />
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600">{error}</p>
                <button
                  className="mt-4 bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700"
                  onClick={() => window.location.reload()}
                  aria-label="Retry loading tasks"
                >
                  Retry
                </button>
              </div>
            ) : myTasks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No tasks assigned.</p>
                <button
                  className="mt-4 bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  aria-label="Browse available tasks"
                >
                  Browse Available Tasks
                </button>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-3 text-left">Title</th>
                    <th className="p-3 text-left">Category</th>
                    <th className="p-3 text-left">Price</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Created</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {myTasks.map((task) => (
                    <tr key={task.id} className="border-t">
                      <td className="p-3 font-medium">{task.title}</td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            task.type === 'Translation'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {task.type === 'Translation' ? (
                            <Languages className="h-3 w-3 mr-1" />
                          ) : (
                            <FileText className="h-3 w-3 mr-1" />
                          )}
                          {task.type}
                        </span>
                      </td>
                      <td className="p-3">${task.payRate}</td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium text-white ${getStatusColor(
                            task.status
                          )}`}
                        >
                          {task.status}
                        </span>
                      </td>
                      <td className="p-3">{task.createdAt.split('T')[0]}</td>
                      <td className="p-3">
                        {task.status === 'in-progress' && (
                          <button
                            className={`rounded-md px-3 py-1 transition-colors ${
                              trackingTask === task.id
                                ? 'bg-red-600 text-white hover:bg-red-700'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                            onClick={() => handleTimeTracking(task.id)}
                            aria-label={
                              trackingTask === task.id ? 'Stop tracking time' : 'Start tracking time'
                            }
                          >
                            {trackingTask === task.id
                              ? `Stop (${Math.floor(workHours / 60)}m ${workHours % 60}s)`
                              : 'Track Time'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
      <Footer />
    </>
  );
};

export default UserDashboard;