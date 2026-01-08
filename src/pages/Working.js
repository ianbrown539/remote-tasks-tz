// src/pages/Working.js
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import confetti from 'canvas-confetti';
import {
  Clock, Upload, CheckCircle, ArrowLeft, Play, Pause,
  ChevronRight, AlertCircle, Send
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import availableTasks from '../data/availableTasks';

const Working = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const task = availableTasks.find(t => t.id === taskId);

  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(true);
  const [myTaskInstance, setMyTaskInstance] = useState(null);
  const fileInputRef = useRef(null);

  const questions = task?.questions || [];

  useEffect(() => {
    if (currentUser === null) return;
    if (!currentUser) {
      toast.info('Please sign in to access your tasks', { icon: '🔒' });
      navigate('/signin', { replace: true });
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    if (!taskId || !task || !currentUser) {
      toast.error('Invalid task');
      navigate('/dashboard');
      return;
    }

    const isOnboardingTask = task.id === availableTasks[0]?.id;
    const savedTasks = JSON.parse(localStorage.getItem(`myTasks_${currentUser.uid}`) || '[]');
    const hasCompletedOnboarding = savedTasks.some(t =>
      t.id.includes(task.id) && ['completed', 'approved'].includes(t.status)
    );

    if (isOnboardingTask && hasCompletedOnboarding) {
      toast.success('Onboarding complete! All tasks unlocked 🎉');
      navigate('/dashboard', { replace: true });
      return;
    }

    const taskInstance = savedTasks.find(t =>
      t.id.startsWith(taskId) && t.status === 'in-progress'
    );

    if (taskInstance) {
      setMyTaskInstance(taskInstance);
      const elapsed = Math.floor((new Date() - new Date(taskInstance.startedAt)) / 1000);
      setSeconds(elapsed);
    }

    setLoading(false);
  }, [taskId, task, currentUser, navigate]);

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = (s) => {
    const m = String(Math.floor(s / 60)).padStart(2, '0');
    const sec = String(s % 60).padStart(2, '0');
    return `${m}:${sec}`;
  };

  const handleFileUpload = (e, questionId) => {
    const file = e.target.files?.[0] || e.dataTransfer?.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large (max 10MB)');
      return;
    }
    setUploadedFiles(prev => ({ ...prev, [questionId]: file }));
    setAnswers(prev => ({ ...prev, [questionId]: file.name }));
    toast.success('File uploaded successfully');
  };

  const handleDragOver = e => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e, qid) => { e.preventDefault(); setIsDragging(false); handleFileUpload(e, qid); };

  const handleTextAnswer = (id, val) => setAnswers(prev => ({ ...prev, [id]: val }));
  const handleOptionSelect = (id, opt) => setAnswers(prev => ({ ...prev, [id]: opt }));

  const isQuestionAnswered = (q) => {
    if (!q.required) return true;
    if (q.type === 'file') return !!uploadedFiles[q.id];
    return answers[q.id]?.toString().trim().length > 0;
  };

  const getProgress = () => {
    const answered = questions.filter(isQuestionAnswered).length;
    return Math.round((answered / questions.length) * 100);
  };

  const canProceedToNext = () => isQuestionAnswered(questions[currentQuestion]);

  const handleNext = () => {
    if (canProceedToNext()) {
      setCurrentQuestion(p => p + 1);
      if (getProgress() === 100) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.8 },
          colors: ['#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4']
        });
      }
    } else {
      toast.error('Please complete this question');
    }
  };

  const handlePrevious = () => setCurrentQuestion(p => Math.max(0, p - 1));

  const handleSubmit = async () => {
    const missing = questions.filter(q => q.required && !isQuestionAnswered(q));
    if (missing.length > 0) {
      toast.error(`Please answer ${missing.length} required question(s)`);
      return;
    }

    setUploading(true);
    try {
      const savedTasks = JSON.parse(localStorage.getItem(`myTasks_${currentUser.uid}`) || '[]');
      const taskInstanceId = myTaskInstance?.id || `${taskId}_${Date.now()}`;
      const isOnboardingTask = taskId === availableTasks[0]?.id;

      const completedTask = {
        id: taskInstanceId,
        ...task,
        status: 'completed',
        startedAt: myTaskInstance?.startedAt || new Date(Date.now() - seconds * 1000),
        completedAt: new Date(),
        completedQuestions: questions.length,
        totalQuestions: questions.length,
        answers,
        ...(isOnboardingTask ? {} : { approvalScheduled: Date.now() + 90000 + Math.random() * 120000 }),
      };

      const index = savedTasks.findIndex(t => t.id === taskInstanceId);
      if (index >= 0) savedTasks[index] = completedTask;
      else savedTasks.push(completedTask);

      localStorage.setItem(`myTasks_${currentUser.uid}`, JSON.stringify(savedTasks));

      confetti({
        particleCount: 250,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4']
      });

      toast.success('Task submitted successfully! 🎉');

      if (isOnboardingTask) {
        toast.info('Instant approval in progress... Welcome aboard!', { autoClose: 8000 });
      } else {
        toast.info('Approval in 1–5 minutes — check your balance!', { autoClose: 6000 });
      }

      setTimeout(() => navigate('/dashboard'), 3000);
    } catch (err) {
      console.error(err);
      toast.error('Submission failed');
    } finally {
      setUploading(false);
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
    toast.info(isActive ? 'Timer paused' : 'Timer resumed', { autoClose: 1500 });
  };

  const handleLeaveTask = () => {
    if (window.confirm('Leave task? Your progress is saved automatically.')) {
      navigate('/dashboard');
    }
  };

  if (loading || !task) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-950 via-green-900 to-emerald-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-lime-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg text-green-100">Loading task...</p>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950 via-green-900 to-emerald-900">
      {/* Header */}
      <header className="bg-black/40 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-5 py-4 flex justify-between items-center">
          <button
            onClick={handleLeaveTask}
            className="flex items-center gap-2 text-green-100 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" /> Dashboard
          </button>
          <div className="flex items-center gap-4 bg-white/10 px-5 py-3 rounded-full border border-lime-400/30">
            <Clock className="w-5 h-5 text-lime-400" />
            <span className="font-bold text-white text-lg">{formatTime(seconds)}</span>
            <button onClick={toggleTimer} className="text-lime-400 hover:text-lime-300">
              {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-5 py-8">
        {/* Task Header */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-lime-400/20 p-8 mb-8 shadow-xl">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex gap-4 mb-4">
                <span className="px-4 py-2 bg-lime-400/20 text-lime-300 text-sm font-bold rounded-full border border-lime-400/40">
                  {task.category}
                </span>
                <span className="px-4 py-2 bg-emerald-400/20 text-emerald-300 text-sm font-bold rounded-full border border-emerald-400/40">
                  {getProgress()}% Complete
                </span>
              </div>
              <h1 className="text-3xl font-black text-white mb-2">{task.title}</h1>
              <p className="text-lg text-green-200">Question {currentQuestion + 1} of {questions.length}</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-black text-lime-400">${task.paymentAmount}</div>
              <p className="text-sm text-green-300">Paid after approval</p>
            </div>
          </div>
          <div className="mt-6 h-4 bg-white/10 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-lime-400 to-green-500 transition-all duration-700 rounded-full shadow-lg"
              style={{ width: `${getProgress()}%` }}
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Question Sidebar */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-lime-400/20 p-6 space-y-3">
            <h3 className="text-lg font-bold text-lime-400 mb-4">Questions</h3>
            {questions.map((q, i) => (
              <button
                key={q.id}
                onClick={() => setCurrentQuestion(i)}
                className={`
                  w-full text-left px-5 py-4 rounded-xl text-base font-semibold transition-all flex justify-between items-center shadow-sm
                  ${i === currentQuestion
                    ? 'bg-gradient-to-r from-lime-400 to-green-500 text-slate-900 shadow-lg'
                    : isQuestionAnswered(q)
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 hover:bg-emerald-500/30'
                    : 'text-green-200 hover:bg-white/10 border border-white/10'
                  }
                `}
              >
                <span>Q{i + 1}</span>
                {isQuestionAnswered(q) && <CheckCircle className="w-5 h-5" />}
              </button>
            ))}
          </div>

          {/* Main Question Area */}
          <div className="lg:col-span-3 space-y-8">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-lime-400/20 p-10 shadow-2xl">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <div className="flex gap-4 mb-6">
                    <span className={`
                      px-5 py-2 text-sm font-bold rounded-full border
                      ${currentQ.type === 'text' ? 'bg-purple-400/20 text-purple-300 border-purple-400/40' :
                        currentQ.type === 'opinion' ? 'bg-blue-400/20 text-blue-300 border-blue-400/40' :
                        'bg-orange-400/20 text-orange-300 border-orange-400/40'}
                    `}>
                      {currentQ.type === 'text' ? 'Text Answer' : currentQ.type === 'opinion' ? 'Multiple Choice' : 'File Upload'}
                    </span>
                    {currentQ.required && (
                      <span className="px-5 py-2 text-sm font-bold bg-red-500/20 text-red-300 rounded-full border border-red-500/40">
                        Required
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-white leading-relaxed">{currentQ.question}</h2>
                </div>
              </div>

              {/* Answer Input */}
              <div className="mt-8">
                {currentQ.type === 'text' && (
                  <textarea
                    value={answers[currentQ.id] || ''}
                    onChange={e => handleTextAnswer(currentQ.id, e.target.value)}
                    placeholder="Type your detailed response here..."
                    className="w-full p-6 rounded-2xl bg-white/5 border border-lime-400/30 text-white placeholder-green-300 focus:border-lime-400 focus:outline-none focus:ring-4 focus:ring-lime-400/20 transition resize-none text-lg"
                    rows={8}
                  />
                )}

                {currentQ.type === 'opinion' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentQ.options?.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleOptionSelect(currentQ.id, opt)}
                        className={`
                          p-6 rounded-2xl border-2 text-lg font-medium transition-all shadow-md
                          ${answers[currentQ.id] === opt
                            ? 'border-lime-400 bg-gradient-to-br from-lime-400/20 to-green-500/20 text-white shadow-xl scale-105'
                            : 'border-white/20 bg-white/5 hover:border-lime-400/50 hover:bg-white/10 text-green-100'
                          }
                        `}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}

                {currentQ.type === 'file' && (
                  <div>
                    {uploadedFiles[currentQ.id] ? (
                      <div className="bg-gradient-to-br from-emerald-500/20 to-green-600/20 border-2 border-emerald-400/50 rounded-2xl p-10 text-center shadow-xl">
                        <CheckCircle className="w-20 h-20 text-emerald-400 mx-auto mb-6" />
                        <p className="text-2xl font-bold text-white mb-2">{uploadedFiles[currentQ.id].name}</p>
                        <p className="text-green-200 mb-6">File ready for submission</p>
                        <button
                          onClick={() => {
                            setUploadedFiles(p => { const x = { ...p }; delete x[currentQ.id]; return x; });
                            setAnswers(p => { const x = { ...p }; delete x[currentQ.id]; return x; });
                          }}
                          className="text-red-400 hover:text-red-300 font-medium"
                        >
                          Remove file
                        </button>
                      </div>
                    ) : (
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={e => handleDrop(e, currentQ.id)}
                        onClick={() => fileInputRef.current?.click()}
                        className={`
                          border-4 border-dashed rounded-2xl p-20 text-center cursor-pointer transition-all shadow-xl
                          ${isDragging ? 'border-lime-400 bg-lime-400/10' : 'border-white/30 hover:border-lime-400 hover:bg-white/5'}
                        `}
                      >
                        <Upload className="w-20 h-20 text-lime-400 mx-auto mb-6" />
                        <p className="text-2xl font-bold text-white mb-2">Drop file here or click to upload</p>
                        <p className="text-lg text-green-300">Max 10MB • {currentQ.acceptedFormats || 'Any format'}</p>
                      </div>
                    )}
                    <input ref={fileInputRef} type="file" onChange={e => handleFileUpload(e, currentQ.id)} className="hidden" />
                  </div>
                )}
              </div>

              {currentQ.required && !isQuestionAnswered(currentQ) && (
                <div className="mt-8 p-6 bg-orange-500/20 border-2 border-orange-400/50 rounded-2xl flex gap-4 shadow-lg">
                  <AlertCircle className="w-8 h-8 text-orange-400 flex-shrink-0" />
                  <p className="text-lg text-orange-200 font-medium">
                    This question is required to proceed.
                  </p>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-10">
              <button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="px-8 py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-bold text-white disabled:opacity-50 transition text-lg"
              >
                Previous
              </button>

              {currentQuestion === questions.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={uploading || getProgress() < 100}
                  className={`
                    px-10 py-5 rounded-2xl font-black text-xl flex items-center gap-4 transition-all shadow-xl
                    ${getProgress() === 100
                      ? 'bg-gradient-to-r from-lime-400 to-green-500 text-slate-900 hover:shadow-2xl hover:shadow-lime-400/60 active:scale-98'
                      : 'bg-white/10 text-green-300 cursor-not-allowed'
                    }
                  `}
                >
                  {uploading ? (
                    <>Submitting... <div className="w-6 h-6 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" /></>
                  ) : (
                    <>Submit Task <Send className="w-6 h-6" /></>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={!canProceedToNext()}
                  className={`
                    px-10 py-5 rounded-2xl font-black text-xl flex items-center gap-4 transition-all shadow-xl
                    ${canProceedToNext()
                      ? 'bg-gradient-to-r from-lime-400 to-green-500 text-slate-900 hover:shadow-2xl hover:shadow-lime-400/60 active:scale-98'
                      : 'bg-white/10 text-green-300 cursor-not-allowed'
                    }
                  `}
                >
                  Next Question <ChevronRight className="w-6 h-6" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        theme="light"
        newestOnTop
        closeOnClick
        toastClassName="font-medium"
      />
    </div>
  );
};

export default Working;