import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Plus, Edit, Trash2, Users, DollarSign, FileText, TrendingUp, CheckCircle, XCircle, Clock, X } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [applications, setApplications] = useState([]);
  const [users, setUsers] = useState([]);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('tasks');
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    type: '',
    payRate: '',
    duration: '',
    difficulty: '',
    requirements: '',
    deadline: '',
    zoomLink: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const modalRef = useRef(null);

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

  // Fetch data
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const userRef = doc(db, 'users', currentUser.uid);
    const unsubscribeUser = onSnapshot(
      userRef,
      (doc) => {
        if (doc.exists() && doc.data().role === 'admin') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching user role:', err);
        toast.error('Failed to verify admin status.');
        setLoading(false);
      }
    );

    const tasksQuery = query(collection(db, 'tasks'));
    const unsubscribeTasks = onSnapshot(
      tasksQuery,
      (snapshot) => {
        const taskData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          title: doc.data().title || 'Untitled',
          type: doc.data().type || 'General',
          payRate: Number(doc.data().payRate) || 0,
          status: doc.data().status || 'open',
          createdAt: doc.data().createdAt || new Date().toISOString(),
        }));
        setTasks(taskData);
        console.log('Tasks fetched:', taskData, `Count: ${taskData.length}`);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching tasks:', err);
        toast.error('Failed to load tasks.');
        setLoading(false);
      }
    );

    const applicationsQuery = query(collection(db, 'applications'));
    const unsubscribeApplications = onSnapshot(
      applicationsQuery,
      (snapshot) => {
        const appData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setApplications(appData);
        console.log('Applications fetched:', appData);
      },
      (err) => {
        console.error('Error fetching applications:', err);
        toast.error('Failed to load applications.');
      }
    );

    const usersQuery = query(collection(db, 'users'));
    const unsubscribeUsers = onSnapshot(
      usersQuery,
      (snapshot) => {
        const userData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setUsers(userData);
        console.log('Users fetched:', userData);
      },
      (err) => {
        console.error('Error fetching users:', err);
        toast.error('Failed to load users.');
      }
    );

    return () => {
      unsubscribeUser();
      unsubscribeTasks();
      unsubscribeApplications();
      unsubscribeUsers();
    };
  }, [currentUser]);

  // Scroll modal into view when opened
  useEffect(() => {
    if (isCreateTaskOpen && modalRef.current) {
      modalRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [isCreateTaskOpen]);

  // Validate form inputs
  const validateForm = () => {
    const newTaskErrors = {};
    if (!newTask.title.trim()) newTaskErrors.title = 'Task title is required';
    if (!newTask.description.trim()) newTaskErrors.description = 'Description is required';
    if (!newTask.type) newTaskErrors.type = 'Category is required';
    if (!newTask.payRate || newTask.payRate <= 0) newTaskErrors.payRate = 'Price must be greater than $0';
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
        ...newTask,
        payRate: Number(newTask.payRate),
        status: 'open',
        assignedTo: null, // Explicitly null for general tasks
        visibility: 'public', // Mark as public for all users
        createdAt: new Date().toISOString(),
        requirements: newTask.requirements
          .split(',')
          .map((req) => req.trim())
          .filter((req) => req),
      };
      await withRetry(() => addDoc(collection(db, 'tasks'), taskData));
      setNewTask({
        title: '',
        description: '',
        type: '',
        payRate: '',
        duration: '',
        difficulty: '',
        requirements: '',
        deadline: '',
        zoomLink: '',
      });
      setErrors({});
      setIsCreateTaskOpen(false);
      toast.success('Task created successfully!');
      console.log('Task created:', taskData);
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
      await withRetry(() => deleteDoc(doc(db, 'tasks', taskId)));
      toast.success('Task deleted successfully!');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task.');
    }
  };

  // Approve/reject application
  const handleApplicationAction = async (appId, action) => {
    try {
      const appRef = doc(db, 'applications', appId);
      const app = applications.find((a) => a.id === appId);
      await withRetry(() => updateDoc(appRef, { status: action }));
      if (action === 'approved') {
        await withRetry(() =>
          updateDoc(doc(db, 'tasks', app.taskId), {
            status: 'in-progress',
            assignedTo: app.userId,
          })
        );
      }
      toast.success(`Application ${action}!`);
    } catch (error) {
      console.error(`Error ${action} application:`, error);
      toast.error(`Failed to ${action} application.`);
    }
  };

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

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-red-600">Access denied. Admins only.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-100">
        <header className="border-b bg-white">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-blue-600">Admin Dashboard</h1>
              <button
                className="bg-blue-600 text-white py-2 px-4 rounded-md flex items-center hover:bg-blue-700 transition-colors"
                onClick={() => setIsCreateTaskOpen(true)}
                aria-label="Create new task"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6 relative">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
            <div className="bg-white border rounded-lg p-6 shadow-sm">
              <div className="flex items-center space-x-2">
                <FileText className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Total Tasks</p>
                  <p className="text-2xl font-bold">{tasks.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white border rounded-lg p-6 shadow-sm">
              <div className="flex items-center space-x-2">
                <Clock className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Active Tasks</p>
                  <p className="text-2xl font-bold">
                    {tasks.filter((t) => t.status === 'in-progress').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white border rounded-lg p-6 shadow-sm">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Total Users</p>
                  <p className="text-2xl font-bold">{users.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white border rounded-lg p-6 shadow-sm">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Total Earnings</p>
                  <p className="text-2xl font-bold">
                    ${users.reduce((sum, user) => sum + (user.totalEarned || 0), 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white border rounded-lg p-6 shadow-sm">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Pending Applications</p>
                  <p className="text-2xl font-bold">
                    {applications.filter((a) => a.status === 'pending').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white border rounded-lg p-6 shadow-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Completed Tasks</p>
                  <p className="text-2xl font-bold">
                    {tasks.filter((t) => t.status === 'completed').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Task Creation Modal */}
          {isCreateTaskOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center py-8 z-50">
              <div
                ref={modalRef}
                className="bg-white rounded-lg p-6 sm:max-w-[600px] w-full mx-auto shadow-xl transform transition-all duration-300 scale-100 max-h-[calc(100vh-4rem)] overflow-y-auto"
                role="dialog"
                aria-labelledby="modal-title"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 id="modal-title" className="text-xl font-bold text-gray-900">Create New Task</h2>
                  <button
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => {
                      setIsCreateTaskOpen(false);
                      setNewTask({
                        title: '',
                        description: '',
                        type: '',
                        payRate: '',
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
                <p className="text-sm text-gray-500 mb-6">Add a new task for freelancers to work on.</p>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="title" className="text-sm font-medium text-gray-700 block mb-1">
                        Task Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="title"
                        className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Enter task title"
                        value={newTask.title}
                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                        required
                        aria-invalid={errors.title ? 'true' : 'false'}
                        aria-describedby={errors.title ? 'title-error' : undefined}
                      />
                      {errors.title && (
                        <p id="title-error" className="text-red-500 text-xs mt-1">{errors.title}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="type" className="text-sm font-medium text-gray-700 block mb-1">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="type"
                        className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.type ? 'border-red-500' : 'border-gray-300'}`}
                        value={newTask.type}
                        onChange={(e) => setNewTask({ ...newTask, type: e.target.value })}
                        required
                        aria-invalid={errors.type ? 'true' : 'false'}
                        aria-describedby={errors.type ? 'type-error' : undefined}
                      >
                        <option value="">Select category</option>
                        <option value="Translation">Translation</option>
                        <option value="Content Writing">Content Writing</option>
                        <option value="Graphic Design">Graphic Design</option>
                        <option value="Data Entry">Data Entry</option>
                        <option value="Web Development">Web Development</option>
                      </select>
                      {errors.type && (
                        <p id="type-error" className="text-red-500 text-xs mt-1">{errors.type}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="description" className="text-sm font-medium text-gray-700 block mb-1">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="description"
                      className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Detailed task description"
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      rows="4"
                      required
                      aria-invalid={errors.description ? 'true' : 'false'}
                      aria-describedby={errors.description ? 'description-error' : undefined}
                    />
                    {errors.description && (
                      <p id="description-error" className="text-red-500 text-xs mt-1">{errors.description}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="payRate" className="text-sm font-medium text-gray-700 block mb-1">
                        Price ($) <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="payRate"
                        type="number"
                        min="1"
                        className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.payRate ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="15"
                        value={newTask.payRate}
                        onChange={(e) => setNewTask({ ...newTask, payRate: e.target.value })}
                        required
                        aria-invalid={errors.payRate ? 'true' : 'false'}
                        aria-describedby={errors.payRate ? 'payRate-error' : undefined}
                      />
                      {errors.payRate && (
                        <p id="payRate-error" className="text-red-500 text-xs mt-1">{errors.payRate}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="duration" className="text-sm font-medium text-gray-700 block mb-1">
                        Duration <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="duration"
                        className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.duration ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="2-3 hours"
                        value={newTask.duration}
                        onChange={(e) => setNewTask({ ...newTask, duration: e.target.value })}
                        required
                        aria-invalid={errors.duration ? 'true' : 'false'}
                        aria-describedby={errors.duration ? 'duration-error' : undefined}
                      />
                      {errors.duration && (
                        <p id="duration-error" className="text-red-500 text-xs mt-1">{errors.duration}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="difficulty" className="text-sm font-medium text-gray-700 block mb-1">
                        Difficulty <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="difficulty"
                        className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.difficulty ? 'border-red-500' : 'border-gray-300'}`}
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
                        <p id="difficulty-error" className="text-red-500 text-xs mt-1">{errors.difficulty}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="requirements" className="text-sm font-medium text-gray-700 block mb-1">
                      Requirements (comma-separated)
                    </label>
                    <input
                      id="requirements"
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                      placeholder="Native speaker, Experience with..."
                      value={newTask.requirements}
                      onChange={(e) => setNewTask({ ...newTask, requirements: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="deadline" className="text-sm font-medium text-gray-700 block mb-1">
                      Deadline <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="deadline"
                      type="date"
                      className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.deadline ? 'border-red-500' : 'border-gray-300'}`}
                      value={newTask.deadline}
                      onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                      required
                      aria-invalid={errors.deadline ? 'true' : 'false'}
                      aria-describedby={errors.deadline ? 'deadline-error' : undefined}
                      min={new Date().toISOString().split('T')[0]} // Prevent past dates
                    />
                    {errors.deadline && (
                      <p id="deadline-error" className="text-red-500 text-xs mt-1">{errors.deadline}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="zoomLink" className="text-sm font-medium text-gray-700 block mb-1">
                      Zoom Link (Optional)
                    </label>
                    <input
                      id="zoomLink"
                      className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.zoomLink ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="https://zoom.us/j/..."
                      value={newTask.zoomLink}
                      onChange={(e) => setNewTask({ ...newTask, zoomLink: e.target.value })}
                      aria-invalid={errors.zoomLink ? 'true' : 'false'}
                      aria-describedby={errors.zoomLink ? 'zoomLink-error' : undefined}
                    />
                    {errors.zoomLink && (
                      <p id="zoomLink-error" className="text-red-500 text-xs mt-1">{errors.zoomLink}</p>
                    )}
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      className="border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-100 transition-colors"
                      onClick={() => {
                        setIsCreateTaskOpen(false);
                        setNewTask({
                          title: '',
                          description: '',
                          type: '',
                          payRate: '',
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
                      className={`bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700 transition-colors flex items-center ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={handleCreateTask}
                      disabled={isSubmitting}
                      aria-label={isSubmitting ? 'Creating task...' : 'Create task'}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Creating...
                        </>
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
            <div className="flex border-b">
              <button
                className={`px-4 py-2 font-medium ${categoryFilter === 'tasks' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
                onClick={() => setCategoryFilter('tasks')}
                aria-label="View task management"
              >
                Task Management
              </button>
              <button
                className={`px-4 py-2 font-medium ${categoryFilter === 'applications' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
                onClick={() => setCategoryFilter('applications')}
                aria-label="View applications"
              >
                Applications
              </button>
              <button
                className={`px-4 py-2 font-medium ${categoryFilter === 'users' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
                onClick={() => setCategoryFilter('users')}
                aria-label="View user management"
              >
                User Management
              </button>
              <button
                className={`px-4 py-2 font-medium ${categoryFilter === 'analytics' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
                onClick={() => setCategoryFilter('analytics')}
                aria-label="View analytics"
              >
                Analytics
              </button>
            </div>

            {categoryFilter === 'tasks' && (
              <div className="bg-white border rounded-lg p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-2">Task Management</h2>
                <p className="text-sm text-gray-500 mb-4">Manage all tasks and their status</p>
                {loading ? (
                  <div className="space-y-4">
                    <Skeleton height={40} count={5} />
                  </div>
                ) : tasks.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No tasks available.</p>
                    <button
                      className="mt-4 bg-blue-600 text-white rounded-md px-4 py-2"
                      onClick={() => setIsCreateTaskOpen(true)}
                      aria-label="Create a new task"
                    >
                      Create a Task
                    </button>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-3 text-left">Title</th>
                        <th className="p-3 text-left">Category</th>
                        <th className="p-3 text-left">Price</th>
                        <th className="p-3 text-left">Applicants</th>
                        <th className="p-3 text-left">Status</th>
                        <th className="p-3 text-left">Created</th>
                        <th className="p-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.map((task) => (
                        <tr key={task.id} className="border-t">
                          <td className="p-3 font-medium">{task.title}</td>
                          <td className="p-3">{task.type}</td>
                          <td className="p-3">${task.payRate}</td>
                          <td className="p-3">
                            {applications.filter((a) => a.taskId === task.id).length}
                          </td>
                          <td className="p-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium text-white ${getStatusColor(task.status)}`}>
                              {task.status}
                            </span>
                          </td>
                          <td className="p-3">{task.createdAt.split('T')[0]}</td>
                          <td className="p-3">
                            <div className="flex space-x-2">
                              <button
                                className="border border-gray-300 rounded-md p-2 hover:bg-gray-100"
                                aria-label={`Edit task ${task.title}`}
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                className="border border-gray-300 rounded-md p-2 hover:bg-gray-100"
                                onClick={() => handleDeleteTask(task.id)}
                                aria-label={`Delete task ${task.title}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {categoryFilter === 'applications' && (
              <div className="bg-white border rounded-lg p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-2">Task Applications</h2>
                <p className="text-sm text-gray-500 mb-4">Review and manage user applications</p>
                {loading ? (
                  <div className="space-y-4">
                    <Skeleton height={40} count={5} />
                  </div>
                ) : applications.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No applications available.</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-3 text-left">Task</th>
                        <th className="p-3 text-left">User</th>
                        <th className="p-3 text-left">Email</th>
                        <th className="p-3 text-left">Experience</th>
                        <th className="p-3 text-left">Status</th>
                        <th className="p-3 text-left">Applied</th>
                        <th className="p-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((app) => (
                        <tr key={app.id} className="border-t">
                          <td className="p-3 font-medium">{app.taskTitle}</td>
                          <td className="p-3">{app.userName}</td>
                          <td className="p-3">{app.userEmail}</td>
                          <td className="p-3">{app.experience}</td>
                          <td className="p-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium text-white ${getStatusColor(app.status)}`}>
                              {app.status}
                            </span>
                          </td>
                          <td className="p-3">{app.appliedAt.split('T')[0]}</td>
                          <td className="p-3">
                            {app.status === 'pending' && (
                              <div className="flex space-x-2">
                                <button
                                  className="border border-gray-300 rounded-md p-2 hover:bg-gray-100"
                                  onClick={() => handleApplicationAction(app.id, 'approved')}
                                  aria-label={`Approve application for ${app.taskTitle}`}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </button>
                                <button
                                  className="border border-gray-300 rounded-md p-2 hover:bg-gray-100"
                                  onClick={() => handleApplicationAction(app.id, 'rejected')}
                                  aria-label={`Reject application for ${app.taskTitle}`}
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {categoryFilter === 'users' && (
              <div className="bg-white border rounded-lg p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-2">User Management</h2>
                <p className="text-sm text-gray-500 mb-4">Manage registered users and their performance</p>
                {loading ? (
                  <div className="space-y-4">
                    <Skeleton height={40} count={5} />
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No users registered.</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-3 text-left">Name</th>
                        <th className="p-3 text-left">Email</th>
                        <th className="p-3 text-left">Completed Tasks</th>
                        <th className="p-3 text-left">Success Rate</th>
                        <th className="p-3 text-left">Total Earned</th>
                        <th className="p-3 text-left">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-t">
                          <td className="p-3 font-medium">{user.name || 'N/A'}</td>
                          <td className="p-3">{user.email}</td>
                          <td className="p-3">{user.completedTasks || 0}</td>
                          <td className="p-3">{user.successRate || '0%'}</td>
                          <td className="p-3">${user.totalEarned || 0}</td>
                          <td className="p-3">{user.joinedAt ? user.joinedAt.split('T')[0] : 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {categoryFilter === 'analytics' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border rounded-lg p-6 shadow-sm">
                  <h2 className="text-lg font-semibold mb-2">Revenue Analytics</h2>
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    ${users.reduce((sum, user) => sum + (user.totalEarned || 0), 0).toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-500 mb-4">Total platform earnings</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>This Month</span>
                      <span className="font-semibold">
                        ${users.reduce((sum, user) => sum + (user.thisMonthEarned || 0), 0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Last Month</span>
                      <span className="font-semibold">
                        ${users.reduce((sum, user) => sum + (user.lastMonthEarned || 0), 0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Growth</span>
                      <span className="font-semibold">+12.1%</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white border rounded-lg p-6 shadow-sm">
                  <h2 className="text-lg font-semibold mb-2">Task Categories</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Translation Tasks</span>
                      <span className="font-semibold">
                        {Math.round(
                          (tasks.filter((t) => t.type === 'Translation').length / (tasks.length || 1)) * 100
                        )}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Content Writing</span>
                      <span className="font-semibold">
                        {Math.round(
                          (tasks.filter((t) => t.type === 'Content Writing').length / (tasks.length || 1)) * 100
                        )}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
      <Footer />
    </>
  );
};

export default AdminDashboard;