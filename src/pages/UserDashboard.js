import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { collection, query, where, onSnapshot, updateDoc, doc, addDoc } from 'firebase/firestore';
import { Clock, DollarSign, FileText, Languages, User, Trophy } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const UserDashboard = () => {
  const { currentUser } = useAuth();
  const [availableTasks, setAvailableTasks] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [trackingTask, setTrackingTask] = useState(null);
  const [workHours, setWorkHours] = useState(0);

  // Fetch user profile and tasks
  useEffect(() => {
    if (!currentUser) return;

    const userRef = doc(db, 'users', currentUser.uid);
    const unsubscribeUser = onSnapshot(userRef, (doc) => {
      if (doc.exists()) setUserProfile(doc.data());
      setLoading(false);
    });

    const availableQuery = query(collection(db, 'tasks'), where('status', '==', 'open'));
    const unsubscribeAvailable = onSnapshot(availableQuery, (snapshot) => {
      setAvailableTasks(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    const myTasksQuery = query(collection(db, 'tasks'), where('assignedTo', '==', currentUser.uid));
    const unsubscribeMyTasks = onSnapshot(myTasksQuery, (snapshot) => {
      setMyTasks(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeUser();
      unsubscribeAvailable();
      unsubscribeMyTasks();
    };
  }, [currentUser]);

  // Apply to a task
  const handleApply = async (taskId, taskTitle) => {
    try {
      await addDoc(collection(db, 'applications'), {
        taskId,
        taskTitle,
        userId: currentUser.uid,
        userName: userProfile?.name || currentUser.email,
        userEmail: currentUser.email,
        experience: userProfile?.skills?.join(', ') || 'N/A',
        status: 'pending',
        appliedAt: new Date().toISOString(),
      });
      await updateDoc(doc(db, 'tasks', taskId), {
        status: 'applied',
        assignedTo: currentUser.uid,
        appliedAt: new Date().toISOString(),
      });
      alert('Applied successfully!');
    } catch (error) {
      console.error('Error applying to task:', error);
      alert('Failed to apply.');
    }
  };

  // Time tracking
  const handleTimeTracking = async (taskId) => {
    if (trackingTask === taskId) {
      try {
        await addDoc(collection(db, 'users', currentUser.uid, 'workHours'), {
          taskId,
          hours: workHours / 3600,
          timestamp: new Date().toISOString(),
        });
        setTrackingTask(null);
        setWorkHours(0);
      } catch (error) {
        console.error('Error saving work hours:', error);
      }
    } else {
      setTrackingTask(taskId);
      setWorkHours(0);
    }
  };

  useEffect(() => {
    let timer;
    if (trackingTask) {
      timer = setInterval(() => setWorkHours((prev) => prev + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [trackingTask]);

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
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'applied': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-100">
        <header className="border-b bg-white">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-blue-600">Work From Home Dashboard</h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold">
                    Total Earned: ${userProfile?.totalEarned || 0}
                  </span>
                </div>
                <button className="border border-gray-300 rounded-md px-3 py-1 text-sm flex items-center hover:bg-gray-100">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                  <p className="text-2xl font-bold">{myTasks.length}</p>
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

          {/* Tabs */}
          <div className="space-y-6">
            <div className="flex border-b">
              <button
                className={`px-4 py-2 font-medium ${categoryFilter === 'available' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
                onClick={() => setCategoryFilter('available')}
              >
                Available Tasks
              </button>
              <button
                className={`px-4 py-2 font-medium ${categoryFilter === 'my-tasks' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
                onClick={() => setCategoryFilter('my-tasks')}
              >
                My Tasks
              </button>
            </div>

            {categoryFilter === 'available' && (
              <div className="space-y-6">
                {/* Filters */}
                <div className="bg-white border rounded-lg p-6 shadow-sm">
                  <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                      <label className="text-sm font-medium mb-2 block">Category</label>
                      <select
                        className="w-full p-2 border rounded-md"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                      >
                        <option value="all">All Categories</option>
                        <option value="Translation">Translation</option>
                        <option value="Content Writing">Content Writing</option>
                      </select>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                      <label className="text-sm font-medium mb-2 block">Price Range</label>
                      <select
                        className="w-full p-2 border rounded-md"
                        value={priceFilter}
                        onChange={(e) => setPriceFilter(e.target.value)}
                      >
                        <option value="all">All Prices</option>
                        <option value="low">$1 - $12</option>
                        <option value="medium">$13 - $16</option>
                        <option value="high">$17 - $20</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Available Tasks */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {loading ? (
                    <p>Loading tasks...</p>
                  ) : filteredTasks.length === 0 ? (
                    <p>No available tasks.</p>
                  ) : (
                    filteredTasks.map((task) => (
                      <div key={task.id} className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold mb-2">{task.title}</h3>
                              <div className="flex items-center space-x-2 mb-2">
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                    task.type === 'Translation' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  {task.type === 'Translation' ? (
                                    <Languages className="h-3 w-3 mr-1" />
                                  ) : (
                                    <FileText className="h-3 w-3 mr-1" />
                                  )}
                                  {task.type}
                                </span>
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium border border-gray-300">
                                  {task.difficulty}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-blue-600">${task.payRate}</div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {task.duration}
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-600 mb-4">{task.description}</p>
                          {task.zoomLink && (
                            <p className="text-sm mb-2">
                              <a href={task.zoomLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                                Join Zoom Meeting
                              </a>
                            </p>
                          )}
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm font-medium mb-1">Requirements:</p>
                              <div className="flex flex-wrap gap-1">
                                {task.requirements?.map((req, index) => (
                                  <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs border border-gray-300">
                                    {req}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <button
                              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                              onClick={() => handleApply(task.id, task.title)}
                            >
                              Apply Now
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {categoryFilter === 'my-tasks' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  {myTasks.length === 0 ? (
                    <p>No tasks assigned.</p>
                  ) : (
                    myTasks.map((task) => (
                      <div key={task.id} className="bg-white border rounded-lg p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold">{task.title}</h3>
                            <p className="text-sm text-gray-500">Deadline: {task.deadline}</p>
                            {task.zoomLink && (
                              <p className="text-sm">
                                <a href={task.zoomLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                                  Join Zoom Meeting
                                </a>
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-blue-600">${task.payRate}</div>
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium text-white ${getStatusColor(task.status)}`}>
                              {task.status}
                            </span>
                          </div>
                        </div>
                        {task.status === 'in-progress' && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>{task.progress || 0}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${task.progress || 0}%` }}
                              ></div>
                            </div>
                            <button
                              className={`w-full py-2 rounded-md ${
                                trackingTask === task.id ? 'bg-red-600 text-white hover:bg-red-700' : 'border border-gray-300 hover:bg-gray-100'
                              }`}
                              onClick={() => handleTimeTracking(task.id)}
                            >
                              {trackingTask === task.id
                                ? `Stop Tracking (${Math.floor(workHours / 60)}m ${workHours % 60}s)`
                                : 'Start Time Tracking'}
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default UserDashboard;