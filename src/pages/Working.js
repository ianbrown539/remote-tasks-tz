// src/pages/Working.js
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import confetti from 'canvas-confetti';
import {
  Clock, Upload, CheckCircle, ArrowLeft, Play, Pause,
  ChevronRight, AlertCircle, Send, X
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
      toast.info('Please sign in to access your tasks');
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
    toast.success('File uploaded');
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
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#84cc16', '#22c55e', '#10b981']
        });
      }
    } else {
      toast.error('Complete this question first');
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
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#84cc16', '#22c55e', '#10b981']
      });

      toast.success('Task submitted successfully!');

      if (isOnboardingTask) {
        toast.info('Welcome aboard! Onboarding approved instantly.');
      } else {
        toast.info('Approval in 1–5 minutes — check your balance soon.');
      }

      setTimeout(() => navigate('/dashboard'), 2500);
    } catch (err) {
      console.error(err);
      toast.error('Submission failed');
    } finally {
      setUploading(false);
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const handleLeaveTask = () => {
    if (window.confirm('Leave this task? Progress is saved automatically.')) {
      navigate('/dashboard');
    }
  };

  if (loading || !task) {
    return (
      <div className="min-h-screen bg-green-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-lime-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-green-200">Loading task...</p>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <>
      <div className="min-h-screen bg-green-950 text-white">
        <ToastContainer position="top-center" theme="dark" autoClose={3000} />

        {/* Compact Header */}
        <header className="bg-green-900/50 backdrop-blur border-b border-white/10 sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
            <button
              onClick={handleLeaveTask}
              className="flex items-center gap-2 text-green-200 hover:text-white text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </button>

            <div className="flex items-center gap-3 bg-green-800/50 px-4 py-2 rounded-full border border-lime-400/30">
              <Clock className="w-4 h-4 text-lime-400" />
              <span className="font-mono text-white">{formatTime(seconds)}</span>
              <button onClick={toggleTimer} className="text-lime-400 hover:text-lime-300">
                {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Task Summary Bar */}
          <div className="bg-green-900/60 backdrop-blur rounded-xl border border-lime-400/20 p-5 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-white">{task.title}</h1>
                <p className="text-green-300 text-sm mt-1">
                  Question {currentQuestion + 1} of {questions.length} • {getProgress()}% complete
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-lime-400">${task.paymentAmount}</div>
                <p className="text-green-400 text-xs">Paid after approval</p>
              </div>
            </div>

            {/* Slim Progress Bar */}
            <div className="mt-4 h-2 bg-green-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-lime-400 to-emerald-500 transition-all duration-500"
                style={{ width: `${getProgress()}%` }}
              />
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Compact Question List */}
            <aside className="lg:col-span-1">
              <div className="bg-green-900/60 backdrop-blur rounded-xl border border-lime-400/20 p-4">
                <h3 className="text-sm font-semibold text-lime-400 uppercase tracking-wider mb-3">Questions</h3>
                <div className="space-y-2">
                  {questions.map((q, i) => (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestion(i)}
                      className={`
                        w-full text-left px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-between transition
                        ${i === currentQuestion
                          ? 'bg-gradient-to-r from-lime-400 to-emerald-500 text-green-950 shadow-md'
                          : isQuestionAnswered(q)
                          ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                          : 'text-green-300 hover:bg-white/5'
                        }
                      `}
                    >
                      <span>Q{i + 1}</span>
                      {isQuestionAnswered(q) && <CheckCircle className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <main className="lg:col-span-3">
              <div className="bg-green-900/60 backdrop-blur rounded-xl border border-lime-400/20 p-6 md:p-8">
                {/* Question Header */}
                <div className="mb-6">
                  <div className="flex gap-3 mb-4">
                    <span className={`
                      px-3 py-1 text-xs font-bold rounded-full
                      ${currentQ.type === 'text' ? 'bg-purple-400/20 text-purple-300' :
                        currentQ.type === 'opinion' ? 'bg-blue-400/20 text-blue-300' :
                        'bg-orange-400/20 text-orange-300'}
                    `}>
                      {currentQ.type === 'text' ? 'Text' : currentQ.type === 'opinion' ? 'Choice' : 'Upload'}
                    </span>
                    {currentQ.required && (
                      <span className="px-3 py-1 text-xs font-bold bg-red-500/20 text-red-300 rounded-full">
                        Required
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl md:text-2xl font-semibold text-white leading-relaxed">
                    {currentQ.question}
                  </h2>
                </div>

                {/* Answer Input */}
                <div className="mb-8">
                  {currentQ.type === 'text' && (
                    <textarea
                      value={answers[currentQ.id] || ''}
                      onChange={e => handleTextAnswer(currentQ.id, e.target.value)}
                      placeholder="Enter your answer..."
                      className="w-full p-4 rounded-lg bg-green-950/50 border border-green-700 text-white placeholder-green-400 focus:border-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-400/30 transition"
                      rows={6}
                    />
                  )}

                  {currentQ.type === 'opinion' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentQ.options?.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => handleOptionSelect(currentQ.id, opt)}
                          className={`
                            p-4 rounded-lg border text-left font-medium transition
                            ${answers[currentQ.id] === opt
                              ? 'border-lime-400 bg-lime-400/20 text-white shadow-md'
                              : 'border-green-700 bg-green-950/50 hover:border-lime-400/50 text-green-100'
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
                        <div className="bg-emerald-500/20 border border-emerald-400/50 rounded-lg p-6 text-center">
                          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                          <p className="font-medium text-white">{uploadedFiles[currentQ.id].name}</p>
                          <button
                            onClick={() => {
                              setUploadedFiles(p => { const x = { ...p }; delete x[currentQ.id]; return x; });
                              setAnswers(p => { const x = { ...p }; delete x[currentQ.id]; return x; });
                            }}
                            className="mt-3 text-sm text-red-400 hover:text-red-300"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={e => handleDrop(e, currentQ.id)}
                          onClick={() => fileInputRef.current?.click()}
                          className={`
                            border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition
                            ${isDragging ? 'border-lime-400 bg-lime-400/10' : 'border-green-600 hover:border-lime-400'}
                          `}
                        >
                          <Upload className="w-12 h-12 text-lime-400 mx-auto mb-4" />
                          <p className="font-medium text-white mb-1">Drop file or click to upload</p>
                          <p className="text-sm text-green-400">Max 10MB</p>
                        </div>
                      )}
                      <input ref={fileInputRef} type="file" onChange={e => handleFileUpload(e, currentQ.id)} className="hidden" />
                    </div>
                  )}
                </div>

                {currentQ.required && !isQuestionAnswered(currentQ) && (
                  <div className="mb-6 p-4 bg-orange-500/20 border border-orange-400/50 rounded-lg flex gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-orange-200">This question is required.</p>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between items-center">
                  <button
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                    className="px-6 py-3 bg-green-800 hover:bg-green-700 rounded-lg font-medium text-white disabled:opacity-50 transition"
                  >
                    Previous
                  </button>

                  {currentQuestion === questions.length - 1 ? (
                    <button
                      onClick={handleSubmit}
                      disabled={uploading || getProgress() < 100}
                      className={`
                        px-8 py-3 rounded-lg font-bold flex items-center gap-3 transition
                        ${getProgress() === 100
                          ? 'bg-gradient-to-r from-lime-400 to-emerald-500 text-green-950 shadow-lg hover:shadow-xl'
                          : 'bg-green-800 text-green-400 cursor-not-allowed'
                        }
                      `}
                    >
                      {uploading ? (
                        <>Submitting... <div className="w-5 h-5 border-2 border-green-950 border-t-transparent rounded-full animate-spin" /></>
                      ) : (
                        <>Submit Task <Send className="w-5 h-5" /></>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      disabled={!canProceedToNext()}
                      className={`
                        px-8 py-3 rounded-lg font-bold flex items-center gap-3 transition
                        ${canProceedToNext()
                          ? 'bg-gradient-to-r from-lime-400 to-emerald-500 text-green-950 shadow-lg hover:shadow-xl'
                          : 'bg-green-800 text-green-400 cursor-not-allowed'
                        }
                      `}
                    >
                      Next <ChevronRight className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
};

export default Working;