import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../services/firebase';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, updateDoc, getDocs, where, serverTimestamp, getDoc, limit } from 'firebase/firestore';
import { Plus, Edit, Trash2, Users, DollarSign, FileText, TrendingUp, CheckCircle, XCircle, Clock, X, LogOut } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const AdminDashboard = () => {
  const { currentUser, userRole } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [userTasks, setUserTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('tasks');
  const [newTask, setNewTask] = useState({
    title: '',
    category: '',
    paymentAmount: '',
    duration: '',
    difficulty: '',
    requirements: '',
    deadline: '',
    zoomLink: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const modalRef = useRef(null);

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

  // Fetch data
  useEffect(() => {
    if (!currentUser || userRole !== 'admin') {
      setLoading(false);
      toast.error('Access denied. Admins only.');
      navigate('/dashboard');
      return;
    }

    // Fetch tasks
    const tasksQuery = query(collection(db, 'tasks'));
    const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
      const taskData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        title: doc.data().title || 'Untitled',
        category: doc.data().category || 'General',
        paymentAmount: Number(doc.data().paymentAmount) || 0,
        isActive: doc.data().isActive !== false,
        createdAt: doc.data().createdAt?.toDate()?.toISOString() || new Date().toISOString(),
      }));
      setTasks(taskData);
      console.log('Tasks fetched:', taskData, `Count: ${taskData.length}`);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching tasks:', err);
      toast.error('Failed to load tasks.');
      setLoading(false);
    });

    // Fetch userTasks for submission review
    const userTasksQuery = query(collection(db, 'userTasks'), where('status', '==', 'completed'));
    const unsubscribeUserTasks = onSnapshot(userTasksQuery, async (snapshot) => {
      const userTaskData = [];
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const taskDoc = await getDocs(query(collection(db, 'tasks'), where('__name__', '==', data.taskId)));
        const userDoc = await getDoc(doc(db, 'users', data.userId));
        if (!taskDoc.empty && userDoc.exists()) {
          const taskDetails = taskDoc.docs[0].data();
          userTaskData.push({
            id: docSnap.id,
            ...data,
            taskTitle: taskDetails.title,
            taskCategory: taskDetails.category,
            paymentAmount: taskDetails.paymentAmount,
            userName: userDoc.data().name,
            userEmail: userDoc.data().email,
          });
        }
      }
      setUserTasks(userTaskData);
      console.log('UserTasks fetched:', userTaskData, `Count: ${userTaskData.length}`);
    }, (err) => {
      console.error('Error fetching userTasks:', err);
      toast.error('Failed to load submissions.');
    });

    // Fetch users
    const usersQuery = query(collection(db, 'users'));
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      const userData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        balance: Number(doc.data().balance) || 0,
        thisMonthEarned: Number(doc.data().thisMonthEarned) || 0,
      }));
      setUsers(userData);
      console.log('Users fetched:', userData, `Count: ${userData.length}`);
    }, (err) => {
      console.error('Error fetching users:', err);
      toast.error('Failed to load users.');
    });

    return () => {
      unsubscribeTasks();
      unsubscribeUserTasks();
      unsubscribeUsers();
    };
  }, [currentUser, userRole, navigate]);

  // Scroll modal into view
  useEffect(() => {
    if (isCreateTaskOpen && modalRef.current) {
      modalRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [isCreateTaskOpen]);

  // Validate form inputs
  const validateForm = () => {
    const newTaskErrors = {};
    if (!newTask.title.trim()) newTaskErrors.title = 'Task title is required';
    if (!newTask.category) newTaskErrors.category = 'Category is required';
    if (!newTask.paymentAmount || newTask.paymentAmount <= 0) newTaskErrors.paymentAmount = 'Price must be greater than $0';
    if (!newTask.duration.trim()) newTaskErrors.duration = 'Duration is required';
    if (!newTask.difficulty) newTaskErrors.difficulty = 'Difficulty is required';
    if (!newTask.deadline) newTaskErrors.deadline = 'Deadline is required';
    if (newTask.zoomLink && !/^https:\/\/(zoom\.us|us\d{2}web\.zoom\.us)\/j\//.test(newTask.zoomLink)) {
      newTaskErrors.zoomLink = 'Invalid Zoom link';
    }
    setErrors(newTaskErrors);
    return Object.keys(newTaskErrors).length === 0;
  };

  // Create task
  const handleCreateTask = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const taskData = {
        title: newTask.title,
        category: newTask.category,
        paymentAmount: Number(newTask.paymentAmount),
        duration: newTask.duration,
        difficulty: newTask.difficulty,
        requirements: newTask.requirements.split(',').map(req => req.trim()).filter(req => req),
        deadline: newTask.deadline,
        zoomLink: newTask.zoomLink || '',
        isActive: true,
        createdAt: serverTimestamp(),
      };
      const docRef = await withRetry(() => addDoc(collection(db, 'tasks'), taskData));
      console.log('Task created with ID:', docRef.id, taskData);
      setNewTask({
        title: '',
        category: '',
        paymentAmount: '',
        duration: '',
        difficulty: '',
        requirements: '',
        deadline: '',
        zoomLink: '',
      });
      setErrors({});
      setIsCreateTaskOpen(false);
      toast.success('Task created successfully!');
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error(`Failed to create task: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId) => {
    try {
      // Check for active userTasks
      const relatedUserTasks = await getDocs(query(collection(db, 'userTasks'), where('taskId', '==', taskId)));
      if (!relatedUserTasks.empty) {
        toast.error('Cannot delete task with active or completed submissions.');
        return;
      }
      await withRetry(() => deleteDoc(doc(db, 'tasks', taskId)));
      console.log('Task deleted:', taskId);
      toast.success('Task deleted successfully!');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error(`Failed to delete task: ${error.message}`);
    }
  };

  // Approve/reject submission
  const handleSubmissionAction = async (userTask, action) => {
    try {
      const userTaskRef = doc(db, 'userTasks', userTask.id);
      if (action === 'approved') {
        const userRef = doc(db, 'users', userTask.userId);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.data();
        await withRetry(() => updateDoc(userTaskRef, {
          status: 'approved',
          approvedAt: serverTimestamp(),
          autoApproved: false,
          reviewerId: currentUser.uid,
          reviewNotes: 'Approved by admin',
        }));
        await withRetry(() => updateDoc(userRef, {
          balance: (userData.balance || 0) + userTask.paymentAmount,
          thisMonthEarned: (userData.thisMonthEarned || 0) + userTask.paymentAmount,
          completedTasks: (userData.completedTasks || 0) + 1,
          successRate: userData.appliedTasks > 0 
            ? `${((userData.completedTasks + 1) / userData.appliedTasks * 100).toFixed(1)}%`
            : '100%',
        }));
        const today = new Date().toISOString().split('T')[0];
        const assignmentQuery = query(
          collection(db, 'dailyTaskAssignments'),
          where('userId', '==', userTask.userId),
          where('date', '==', today),
          limit(1)
        );
        const assignmentDocs = await getDocs(assignmentQuery);
        if (!assignmentDocs.empty) {
          const assignmentDoc = assignmentDocs.docs[0];
          const assignmentData = assignmentDoc.data();
          await withRetry(() => updateDoc(doc(db, 'dailyTaskAssignments', assignmentDoc.id), {
            tasksCompleted: (assignmentData.tasksCompleted || 0) + 1,
            earnings: (assignmentData.earnings || 0) + userTask.paymentAmount,
          }));
        }
        toast.success(`Task "${userTask.taskTitle}" approved! $${userTask.paymentAmount} added to user balance.`);
      } else if (action === 'rejected') {
        const reason = prompt('Enter rejection reason:');
        if (!reason) return;
        await withRetry(() => updateDoc(userTaskRef, {
          status: 'rejected',
          rejectionReason: reason,
          reviewedAt: serverTimestamp(),
          reviewerId: currentUser.uid,
          autoApprovalScheduledAt: null,
        }));
        toast.success(`Task "${userTask.taskTitle}" rejected.`);
      }
    } catch (error) {
      console.error(`Error ${action} submission:`, error);
      toast.error(`Failed to ${action} submission: ${error.message}`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-green-400/20 text-green-300 border-green-400/30';
      case 'in-progress': case 'approved': return 'bg-blue-400/20 text-blue-300 border-blue-400/30';
      case 'completed': return 'bg-blue-600/20 text-blue-300 border-blue-600/30';
      case 'pending': return 'bg-yellow-400/20 text-yellow-300 border-yellow-400/30';
      case 'rejected': return 'bg-red-400/20 text-red-300 border-red-400/30';
      default: return 'bg-gray-400/20 text-gray-300 border-gray-400/30';
    }
  };

  if (!currentUser || userRole !== 'admin') return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <header className="bg-white/10 backdrop-blur-xl border-b border-white/20 sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center space-x-3 mb-1">
                <h1 className="text-2xl font-black text-amber-400">Train2Earn</h1>
                <span className="text-xs bg-amber-400/20 px-2 py-1 rounded-full text-amber-300 border border-amber-400/30">
                  Admin Dashboard
                </span>
              </div>
              <p className="text-sm text-blue-100">Welcome, Admin</p>
            </div>
            <button
              onClick={() => auth.signOut().then(() => navigate('/signin'))}
              className="inline-flex items-center px-4 py-2 rounded-xl font-medium transition-all bg-white/10 text-white hover:bg-white/20 border border-white/20"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-amber-400/20 p-6">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-amber-400" />
              <div>
                <p className="text-sm text-blue-100">Total Tasks</p>
                <p className="text-2xl font-black text-white">{tasks.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-amber-400/20 p-6">
            <div className="flex items-center space-x-3">
              <Clock className="h-8 w-8 text-amber-400" />
              <div>
                <p className="text-sm text-blue-100">Active Tasks</p>
                <p className="text-2xl font-black text-white">
                  {tasks.filter((t) => t.isActive).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-amber-400/20 p-6">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-amber-400" />
              <div>
                <p className="text-sm text-blue-100">Total Users</p>
                <p className="text-2xl font-black text-white">{users.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-amber-400/20 p-6">
            <div className="flex items-center space-x-3">
              <DollarSign className="h-8 w-8 text-amber-400" />
              <div>
                <p className="text-sm text-blue-100">Total Earnings</p>
                <p className="text-2xl font-black text-white">
                  ${users.reduce((sum, user) => sum + (user.balance || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-amber-400/20 p-6">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-8 w-8 text-amber-400" />
              <div>
                <p className="text-sm text-blue-100">Pending Submissions</p>
                <p className="text-2xl font-black text-white">
                  {userTasks.filter((t) => t.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-amber-400/20 p-6">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-8 w-8 text-amber-400" />
              <div>
                <p className="text-sm text-blue-100">Completed Tasks</p>
                <p className="text-2xl font-black text-white">
                  {userTasks.filter((t) => t.status === 'approved').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Task Creation Modal */}
        {isCreateTaskOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center py-8 z-50">
            <div
              ref={modalRef}
              className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-amber-400/20 p-6 max-w-[600px] w-full mx-auto max-h-[90vh] overflow-y-auto"
              role="dialog"
              aria-labelledby="modal-title"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 id="modal-title" className="text-xl font-black text-white">Create New Task</h2>
                <button
                  className="text-blue-100 hover:text-amber-400"
                  onClick={() => {
                    setIsCreateTaskOpen(false);
                    setNewTask({
                      title: '',
                      category: '',
                      paymentAmount: '',
                      duration: '',
                      difficulty: '',
                      requirements: '',
                      deadline: '',
                      zoomLink: '',
                    });
                    setErrors({});
                  }}
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm text-blue-100 mb-6">Add a new task for users to work on.</p>
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="title" className="text-sm font-medium text-blue-100 block mb-1">
                      Task Title <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="title"
                      className={`w-full p-2 border rounded-xl bg-white/5 border-white/20 text-white placeholder-blue-200/50 focus:ring-2 focus:ring-amber-400 ${errors.title ? 'border-red-400' : ''}`}
                      placeholder="Enter task title"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      required
                      aria-invalid={errors.title ? 'true' : 'false'}
                      aria-describedby={errors.title ? 'title-error' : undefined}
                    />
                    {errors.title && (
                      <p id="title-error" className="text-red-400 text-xs mt-1">{errors.title}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="category" className="text-sm font-medium text-blue-100 block mb-1">
                      Category <span className="text-red-400">*</span>
                    </label>
                    <select
                      id="category"
                      className={`w-full p-2 border rounded-xl bg-white/5 border-white/20 text-white focus:ring-2 focus:ring-amber-400 ${errors.category ? 'border-red-400' : ''}`}
                      value={newTask.category}
                      onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                      required
                      aria-invalid={errors.category ? 'true' : 'false'}
                      aria-describedby={errors.category ? 'category-error' : undefined}
                    >
                      <option value="">Select category</option>
                      <option value="Translation">Translation</option>
                      <option value="Content Writing">Content Writing</option>
                      <option value="Data Labeling">Data Labeling</option>
                      <option value="Image Classification">Image Classification</option>
                    </select>
                    {errors.category && (
                      <p id="category-error" className="text-red-400 text-xs mt-1">{errors.category}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label htmlFor="paymentAmount" className="text-sm font-medium text-blue-100 block mb-1">
                    Price ($) <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="paymentAmount"
                    type="number"
                    min="1"
                    className={`w-full p-2 border rounded-xl bg-white/5 border-white/20 text-white placeholder-blue-200/50 focus:ring-2 focus:ring-amber-400 ${errors.paymentAmount ? 'border-red-400' : ''}`}
                    placeholder="15"
                    value={newTask.paymentAmount}
                    onChange={(e) => setNewTask({ ...newTask, paymentAmount: e.target.value })}
                    required
                    aria-invalid={errors.paymentAmount ? 'true' : 'false'}
                    aria-describedby={errors.paymentAmount ? 'paymentAmount-error' : undefined}
                  />
                  {errors.paymentAmount && (
                    <p id="paymentAmount-error" className="text-red-400 text-xs mt-1">{errors.paymentAmount}</p>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="duration" className="text-sm font-medium text-blue-100 block mb-1">
                      Duration <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="duration"
                      className={`w-full p-2 border rounded-xl bg-white/5 border-white/20 text-white placeholder-blue-200/50 focus:ring-2 focus:ring-amber-400 ${errors.duration ? 'border-red-400' : ''}`}
                      placeholder="2-3 hours"
                      value={newTask.duration}
                      onChange={(e) => setNewTask({ ...newTask, duration: e.target.value })}
                      required
                      aria-invalid={errors.duration ? 'true' : 'false'}
                      aria-describedby={errors.duration ? 'duration-error' : undefined}
                    />
                    {errors.duration && (
                      <p id="duration-error" className="text-red-400 text-xs mt-1">{errors.duration}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="difficulty" className="text-sm font-medium text-blue-100 block mb-1">
                      Difficulty <span className="text-red-400">*</span>
                    </label>
                    <select
                      id="difficulty"
                      className={`w-full p-2 border rounded-xl bg-white/5 border-white/20 text-white focus:ring-2 focus:ring-amber-400 ${errors.difficulty ? 'border-red-400' : ''}`}
                      value={newTask.difficulty}
                      onChange={(e) => setNewTask({ ...newTask, difficulty: e.target.value })}
                      required
                      aria-invalid={errors.difficulty ? 'true' : 'false'}
                      aria-describedby={errors.difficulty ? 'difficulty-error' : undefined}
                    >
                      <option value="">Select difficulty</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                    {errors.difficulty && (
                      <p id="difficulty-error" className="text-red-400 text-xs mt-1">{errors.difficulty}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label htmlFor="requirements" className="text-sm font-medium text-blue-100 block mb-1">
                    Requirements (comma-separated)
                  </label>
                  <input
                    id="requirements"
                    className="w-full p-2 border rounded-xl bg-white/5 border-white/20 text-white placeholder-blue-200/50 focus:ring-2 focus:ring-amber-400"
                    placeholder="Native speaker, Experience with..."
                    value={newTask.requirements}
                    onChange={(e) => setNewTask({ ...newTask, requirements: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="deadline" className="text-sm font-medium text-blue-100 block mb-1">
                    Deadline <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="deadline"
                    type="date"
                    className={`w-full p-2 border rounded-xl bg-white/5 border-white/20 text-white focus:ring-2 focus:ring-amber-400 ${errors.deadline ? 'border-red-400' : ''}`}
                    value={newTask.deadline}
                    onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                    required
                    aria-invalid={errors.deadline ? 'true' : 'false'}
                    aria-describedby={errors.deadline ? 'deadline-error' : undefined}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  {errors.deadline && (
                    <p id="deadline-error" className="text-red-400 text-xs mt-1">{errors.deadline}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="zoomLink" className="text-sm font-medium text-blue-100 block mb-1">
                    Zoom Link (Optional)
                  </label>
                  <input
                    id="zoomLink"
                    className={`w-full p-2 border rounded-xl bg-white/5 border-white/20 text-white placeholder-blue-200/50 focus:ring-2 focus:ring-amber-400 ${errors.zoomLink ? 'border-red-400' : ''}`}
                    placeholder="https://zoom.us/j/..."
                    value={newTask.zoomLink}
                    onChange={(e) => setNewTask({ ...newTask, zoomLink: e.target.value })}
                    aria-invalid={errors.zoomLink ? 'true' : 'false'}
                    aria-describedby={errors.zoomLink ? 'zoomLink-error' : undefined}
                  />
                  {errors.zoomLink && (
                    <p id="zoomLink-error" className="text-red-400 text-xs mt-1">{errors.zoomLink}</p>
                  )}
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    className="px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 border border-white/20 transition-all"
                    onClick={() => {
                      setIsCreateTaskOpen(false);
                      setNewTask({
                        title: '',
                        category: '',
                        paymentAmount: '',
                        duration: '',
                        difficulty: '',
                        requirements: '',
                        deadline: '',
                        zoomLink: '',
                      });
                      setErrors({});
                    }}
                    disabled={isSubmitting}
                    aria-label="Cancel task creation"
                  >
                    Cancel
                  </button>
                  <button
                    className={`px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 hover:shadow-xl transform hover:scale-[1.02] transition-all ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={handleCreateTask}
                    disabled={isSubmitting}
                    aria-label={isSubmitting ? 'Creating task...' : 'Create task'}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center space-x-2">
                        <svg className="animate-spin h-5 w-5 text-slate-900" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span>Creating...</span>
                      </span>
                    ) : (
                      'Create Task'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="space-y-6">
          <div className="flex border-b border-white/20">
            {['tasks', 'submissions', 'users', 'analytics'].map((tab) => (
              <button
                key={tab}
                className={`px-4 py-2 font-medium text-sm ${categoryFilter === tab ? 'border-b-2 border-amber-400 text-amber-400' : 'text-blue-100 hover:text-amber-400'}`}
                onClick={() => setCategoryFilter(tab)}
                aria-label={`View ${tab} section`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {categoryFilter === 'tasks' && (
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-amber-400/20 p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-lg font-black text-white">Task Management</h2>
                  <p className="text-sm text-blue-100">Manage all tasks and their status</p>
                </div>
                <button
                  className="inline-flex items-center px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 hover:shadow-xl transform hover:scale-[1.02] transition-all"
                  onClick={() => setIsCreateTaskOpen(true)}
                  aria-label="Create new task"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Task
                </button>
              </div>
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => <Skeleton key={i} height={200} className="rounded-2xl" />)}
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-blue-300" />
                  <p className="text-blue-100">No tasks available.</p>
                  <button
                    className="mt-4 inline-flex items-center px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900"
                    onClick={() => setIsCreateTaskOpen(true)}
                    aria-label="Create a new task"
                  >
                    Create a Task
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tasks.map((task) => (
                    <div key={task.id} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:bg-white/10 hover:border-amber-400/30 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-blue-400/20 text-blue-300 border border-blue-400/30">
                          {task.category}
                        </span>
                        <span className="text-lg font-black text-amber-400">${task.paymentAmount}</span>
                      </div>
                      <h3 className="text-base font-bold mb-2 text-white">{task.title}</h3>
                      <p className="text-sm mb-2 text-blue-100">Status: <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.isActive ? 'open' : 'closed')}`}>{task.isActive ? 'Open' : 'Closed'}</span></p>
                      <p className="text-sm mb-4 text-blue-100">Created: {task.createdAt.split('T')[0]}</p>
                      <div className="flex space-x-2">
                        <button
                          className="px-3 py-1 rounded-xl bg-white/10 text-white hover:bg-white/20 border border-white/20"
                          aria-label={`Edit task ${task.title}`}
                          disabled // TODO: Implement edit functionality
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          className="px-3 py-1 rounded-xl bg-white/10 text-white hover:bg-white/20 border border-white/20"
                          onClick={() => handleDeleteTask(task.id)}
                          aria-label={`Delete task ${task.title}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {categoryFilter === 'submissions' && (
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-amber-400/20 p-6">
              <h2 className="text-lg font-black text-white mb-2">Submission Review</h2>
              <p className="text-sm text-blue-100 mb-4">Review and approve/reject user submissions</p>
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => <Skeleton key={i} height={200} className="rounded-2xl" />)}
                </div>
              ) : userTasks.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-blue-300" />
                  <p className="text-blue-100">No submissions pending review</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userTasks.map((task) => (
                    <div key={task.id} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:bg-white/10 hover:border-amber-400/30 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-blue-400/20 text-blue-300 border border-blue-400/30">
                          {task.taskCategory}
                        </span>
                        <span className="text-lg font-black text-amber-400">${task.paymentAmount}</span>
                      </div>
                      <h3 className="text-base font-bold mb-2 text-white">{task.taskTitle}</h3>
                      <p className="text-sm mb-2 text-blue-100">Submitted by: {task.userName} ({task.userEmail})</p>
                      <p className="text-sm mb-4 text-blue-100">
                        Submitted: {task.completedAt ? new Date(task.completedAt.toDate()).toLocaleString() : 'N/A'}
                      </p>
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-blue-100 mb-2">Submission Details:</p>
                        {Object.entries(task.submissionData || {}).map(([qId, data]) => (
                          <div key={qId} className="mb-2">
                            <p className="text-xs text-blue-200">Q{qId}: {data.type === 'file' ? data.fileName : data.answer}</p>
                          </div>
                        ))}
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleSubmissionAction(task, 'approved')}
                          className="flex-1 font-bold py-2 px-4 rounded-xl bg-gradient-to-r from-green-400 to-green-500 text-slate-900 hover:shadow-lg transform hover:scale-[1.02] transition-all"
                        >
                          <CheckCircle className="w-4 h-4 inline mr-2" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleSubmissionAction(task, 'rejected')}
                          className="flex-1 font-bold py-2 px-4 rounded-xl bg-gradient-to-r from-red-400 to-red-500 text-slate-900 hover:shadow-lg transform hover:scale-[1.02] transition-all"
                        >
                          <XCircle className="w-4 h-4 inline mr-2" />
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {categoryFilter === 'users' && (
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-amber-400/20 p-6">
              <h2 className="text-lg font-black text-white mb-2">User Management</h2>
              <p className="text-sm text-blue-100 mb-4">Manage registered users and their performance</p>
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => <Skeleton key={i} height={200} className="rounded-2xl" />)}
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 mx-auto mb-4 text-blue-300" />
                  <p className="text-blue-100">No users registered.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {users.map((user) => (
                    <div key={user.id} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:bg-white/10 hover:border-amber-400/30 transition-all">
                      <h3 className="text-base font-bold mb-2 text-white">{user.name || 'N/A'}</h3>
                      <p className="text-sm mb-2 text-blue-100">Email: {user.email}</p>
                      <p className="text-sm mb-2 text-blue-100">Completed Tasks: {user.completedTasks || 0}</p>
                      <p className="text-sm mb-2 text-blue-100">Success Rate: {user.successRate || '0%'}</p>
                      <p className="text-sm mb-2 text-blue-100">Balance: ${user.balance || 0}</p>
                      <p className="text-sm text-blue-100">Joined: {user.createdAt ? new Date(user.createdAt.toDate()).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {categoryFilter === 'analytics' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-amber-400/20 p-6">
                <h2 className="text-lg font-black text-white mb-2">Revenue Analytics</h2>
                <p className="text-3xl font-black text-amber-400 mb-2">
                  ${users.reduce((sum, user) => sum + (user.balance || 0), 0).toLocaleString()}
                </p>
                <p className="text-sm text-blue-100 mb-4">Total platform earnings</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-blue-100">
                    <span>This Month</span>
                    <span className="font-semibold">${users.reduce((sum, user) => sum + (user.thisMonthEarned || 0), 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-blue-100">
                    <span>Last Month</span>
                    <span className="font-semibold">${users.reduce((sum, user) => sum + (user.lastMonthEarned || 0), 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-400">
                    <span>Growth</span>
                    <span className="font-semibold">
                      {(() => {
                        const thisMonth = users.reduce((sum, user) => sum + (user.thisMonthEarned || 0), 0);
                        const lastMonth = users.reduce((sum, user) => sum + (user.lastMonthEarned || 0), 0);
                        return lastMonth > 0 ? `${((thisMonth - lastMonth) / lastMonth * 100).toFixed(1)}%` : 'N/A';
                      })()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-amber-400/20 p-6">
                <h2 className="text-lg font-black text-white mb-2">Task Categories</h2>
                <div className="space-y-4">
                  {['Translation', 'Content Writing', 'Data Labeling', 'Image Classification'].map((cat) => (
                    <div key={cat} className="flex justify-between items-center text-blue-100">
                      <span>{cat}</span>
                      <span className="font-semibold">
                        {Math.round((tasks.filter((t) => t.category === cat).length / (tasks.length || 1)) * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <ToastContainer position="bottom-right" theme="dark" autoClose={3000} />
    </div>
  );
};

export default AdminDashboard;