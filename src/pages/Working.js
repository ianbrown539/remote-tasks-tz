import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import confetti from 'canvas-confetti';
import { Clock, Upload, FileText, Image, CheckCircle, ArrowLeft, Play, Pause, DollarSign, ChevronRight, AlertCircle } from 'lucide-react';
import { db } from '../services/firebase';
import { doc, updateDoc, getDoc, collection, query, where, getDocs, serverTimestamp, limit } from 'firebase/firestore'; // Added limit
import { useAuth } from '../context/AuthContext';

const Working = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const task = location.state?.task;

  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef();

  // Sample AI training questions for different task categories
  const questionSets = {
    'Translation': [
      {
        id: 1,
        type: 'text',
        question: 'Translate the following English phrase to Spanish: "The quick brown fox jumps over the lazy dog"',
        required: true
      },
      {
        id: 2,
        type: 'opinion',
        question: 'Rate the naturalness of this translation on a scale of 1-5, where 5 is most natural: "El zorro marrón rápido salta sobre el perro perezoso"',
        options: ['1 - Very Unnatural', '2 - Unnatural', '3 - Neutral', '4 - Natural', '5 - Very Natural'],
        required: true
      },
      {
        id: 3,
        type: 'text',
        question: 'Provide an alternative, more colloquial translation of the same phrase that would be used in everyday conversation.',
        required: true
      },
      {
        id: 4,
        type: 'opinion',
        question: 'Which translation better preserves the original meaning?',
        options: ['First translation (literal)', 'Second translation (colloquial)', 'Both equally', 'Neither'],
        required: true
      },
      {
        id: 5,
        type: 'file',
        question: 'Upload a screenshot or image showing the translation in context (e.g., in a document or translation tool)',
        acceptedFormats: 'image/*',
        required: true
      }
    ],
    'Content Writing': [
      {
        id: 1,
        type: 'text',
        question: 'Write a compelling 50-word product description for a smart home security camera that emphasizes privacy and ease of use.',
        required: true,
        maxLength: 300
      },
      {
        id: 2,
        type: 'opinion',
        question: 'What tone is most appropriate for this product description?',
        options: ['Professional and technical', 'Friendly and conversational', 'Urgent and persuasive', 'Educational and informative'],
        required: true
      },
      {
        id: 3,
        type: 'text',
        question: 'Create 3 headline options for a blog post about "The Future of Remote Work in 2025"',
        required: true
      },
      {
        id: 4,
        type: 'opinion',
        question: 'Which content format would best engage readers for this topic?',
        options: ['Long-form article (2000+ words)', 'Listicle with actionable tips', 'Interview-style Q&A', 'Data-driven infographic story'],
        required: true
      },
      {
        id: 5,
        type: 'file',
        question: 'Upload a sample or reference image that inspires your content approach',
        acceptedFormats: 'image/*',
        required: false
      }
    ],
    'Data Labeling': [
      {
        id: 1,
        type: 'opinion',
        question: 'Examine the following image scenario: A person is holding a smartphone while crossing a street. What is the primary safety concern?',
        options: ['Distracted walking', 'Poor visibility', 'Traffic violation', 'No concern present'],
        required: true
      },
      {
        id: 2,
        type: 'file',
        question: 'Upload an image containing at least 3 distinct objects that need labeling',
        acceptedFormats: 'image/*',
        required: true
      },
      {
        id: 3,
        type: 'text',
        question: 'List all objects you can identify in the uploaded image, separated by commas',
        required: true
      },
      {
        id: 4,
        type: 'opinion',
        question: 'Rate the image quality for machine learning training purposes',
        options: ['Excellent - Clear and well-lit', 'Good - Minor issues', 'Fair - Some blur or poor lighting', 'Poor - Unusable'],
        required: true
      },
      {
        id: 5,
        type: 'text',
        question: 'Describe any potential biases or issues you notice in the image that could affect AI training',
        required: true
      }
    ],
    'Image Classification': [
      {
        id: 1,
        type: 'opinion',
        question: 'Classify the sentiment of the following image: A smiling child playing in a park. Choose one:',
        options: ['Positive', 'Negative', 'Neutral'],
        required: true
      },
      {
        id: 2,
        type: 'file',
        question: 'Upload an image for classification',
        acceptedFormats: 'image/*',
        required: true
      },
      {
        id: 3,
        type: 'text',
        question: 'Describe the main elements in the uploaded image',
        required: true
      },
      {
        id: 4,
        type: 'opinion',
        question: 'What is the primary object or subject in the image?',
        options: ['Person', 'Animal', 'Object', 'Landscape'],
        required: true
      },
      {
        id: 5,
        type: 'text',
        question: 'Explain why you classified the image this way',
        required: true
      }
    ]
  };

  // Select appropriate question set based on task category, fallback to Content Writing
  const questions = questionSets[task?.category] || questionSets['Content Writing'];

  // Redirect if no task or user
  useEffect(() => {
    if (!task || !currentUser) {
      toast.error('No task selected or user not authenticated');
      navigate('/dashboard');
      return;
    }
    setLoading(false);
  }, [task, currentUser, navigate]);

  // Timer
  useEffect(() => {
    if (!isActive || !task) return;
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [isActive, task]);

  const formatTime = (s) => {
    const h = String(Math.floor(s / 3600)).padStart(2, '0');
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const sec = String(s % 60).padStart(2, '0');
    return `${h}:${m}:${sec}`;
  };

  const handleFileUpload = (e, questionId) => {
    const file = e.target.files?.[0] || e.dataTransfer?.files?.[0];
    if (!file) return;
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('File size exceeds 10MB limit');
      return;
    }

    const currentQ = questions[currentQuestion];
    const acceptedFormats = currentQ.acceptedFormats || 'image/*,application/pdf';
    const isValidType = acceptedFormats.split(',').some(format => {
      if (format.trim() === 'image/*') return file.type.startsWith('image/');
      if (format.trim() === 'application/pdf') return file.type === 'application/pdf';
      return file.type === format.trim();
    });

    if (isValidType) {
      setUploadedFiles(prev => ({ ...prev, [questionId]: file }));
      setAnswers(prev => ({ ...prev, [questionId]: file.name }));
      toast.success('File uploaded successfully');
    } else {
      toast.error('Invalid file type. Please check accepted formats.');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e, questionId) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e, questionId);
  };

  const handleTextAnswer = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleOptionSelect = (questionId, option) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const isQuestionAnswered = (question) => {
    if (!question.required) return true;
    const answer = answers[question.id];
    if (question.type === 'file') {
      return uploadedFiles[question.id] !== undefined;
    }
    return answer && answer.trim().length > 0;
  };

  const canProceedToNext = () => {
    return isQuestionAnswered(questions[currentQuestion]);
  };

  const handleNext = () => {
    if (!canProceedToNext()) {
      toast.error('Please answer this required question before proceeding');
      return;
    }
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      toast.success('Progress saved');
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    const unansweredRequired = questions.filter(q => q.required && !isQuestionAnswered(q));
    
    if (unansweredRequired.length > 0) {
      toast.error(`Please answer all required questions (${unansweredRequired.length} remaining)`);
      return;
    }

    setUploading(true);

    try {
      // Find the userTask document
      const userTaskQuery = query(
        collection(db, 'userTasks'),
        where('userId', '==', currentUser.uid),
        where('taskId', '==', task.id),
        where('status', '==', 'active'),
        limit(1)
      );
      const userTaskDocs = await getDocs(userTaskQuery);
      
      if (userTaskDocs.empty) {
        toast.error('Task not found or already completed');
        setUploading(false);
        return;
      }

      const userTaskDoc = userTaskDocs.docs[0];
      const userTaskId = userTaskDoc.id;

      // Prepare submission data (simulate file upload metadata)
      const submissionData = {};
      Object.keys(answers).forEach(questionId => {
        if (uploadedFiles[questionId]) {
          const file = uploadedFiles[questionId];
          submissionData[questionId] = {
            type: 'file',
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            // For production, upload to Firebase Storage and store download URL
            // url: await uploadToStorage(file)
          };
        } else {
          submissionData[questionId] = {
            type: questions.find(q => q.id === parseInt(questionId)).type,
            answer: answers[questionId]
          };
        }
      });

      // Calculate random approval delay (5-20 minutes in milliseconds)
      const minDelay = 5 * 60 * 1000;
      const maxDelay = 20 * 60 * 1000;
      const approvalDelay = minDelay + Math.random() * (maxDelay - minDelay);
      const autoApprovalTime = new Date(Date.now() + approvalDelay);

      // Update userTask document
      await updateDoc(doc(db, 'userTasks', userTaskId), {
        status: 'completed',
        completedAt: serverTimestamp(),
        submissionData,
        autoApprovalScheduledAt: autoApprovalTime,
      });

      // Update user completedTasks and hasDoneFirstTask
      const userRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        await updateDoc(userRef, {
          completedTasks: (userData.completedTasks || 0) + 1,
          hasDoneFirstTask: userData.hasDoneFirstTask || true
        });
      }

      // Update dailyTaskAssignments
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
        await updateDoc(doc(db, 'dailyTaskAssignments', assignmentDoc.id), {
          tasksCompleted: (assignmentData.tasksCompleted || 0) + 1
        });
      }

      confetti({ particleCount: 200, spread: 70, origin: { y: 0.6 } });
      toast.success(`Task completed successfully! Approval pending in ~${Math.round(approvalDelay / 60000)} minutes`, {
        autoClose: 4000,
      });
      setUploading(false);
      setTimeout(() => navigate('/dashboard'), 3500);
    } catch (error) {
      console.error('Error submitting task:', error);
      toast.error('Failed to submit task. Please try again.');
      setUploading(false);
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
    toast.info(isActive ? 'Timer paused' : 'Timer resumed');
  };

  const getProgress = () => {
    const answeredCount = questions.filter(q => isQuestionAnswered(q)).length;
    return Math.round((answeredCount / questions.length) * 100);
  };

  if (!task || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-amber-400 mx-auto mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-white text-lg">Loading task...</p>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-xl border-b border-white/20 sticky top-0 z-40 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to leave? Your progress will be lost.')) {
                  navigate('/dashboard');
                }
              }}
              className="inline-flex items-center px-4 py-2 rounded-xl font-medium transition-all text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Exit Task
            </button>
            <div className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="font-mono font-semibold text-white">
                {formatTime(seconds)}
              </span>
              <button
                onClick={toggleTimer}
                className="ml-2 p-1 rounded-lg hover:bg-white/10 transition-colors text-amber-400"
              >
                {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Task Header */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-amber-400/20 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {task.category || 'AI Training'}
                </span>
                <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-green-400/20 text-green-300 border border-green-400/30">
                  {getProgress()}% Complete
                </span>
              </div>
              <h1 className="text-2xl font-black mb-2 text-white">
                {task.title}
              </h1>
              <p className="text-sm text-blue-100">
                Question {currentQuestion + 1} of {questions.length}
              </p>
            </div>
            <div className="ml-6 text-center p-4 rounded-2xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 border-2 border-amber-400/30">
              <p className="text-xs font-medium mb-1 text-amber-200">
                Reward
              </p>
              <div className="flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-amber-400" />
                <span className="text-3xl font-black text-amber-400">
                  {task.paymentAmount}
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="h-3 rounded-full overflow-hidden bg-white/10 border border-white/20">
              <div 
                className="h-3 bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500 shadow-lg"
                style={{ width: `${getProgress()}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Question Navigation Sidebar */}
          <div className="lg:col-span-1 bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-amber-400/20 p-4 h-fit lg:sticky lg:top-24">
            <h3 className="text-sm font-bold mb-3 text-amber-300">
              Questions
            </h3>
            <div className="space-y-2">
              {questions.map((q, index) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestion(index)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                    currentQuestion === index
                      ? 'bg-amber-400 text-slate-900 shadow-lg'
                      : isQuestionAnswered(q)
                      ? 'bg-green-400/20 text-green-300 border border-green-400/30 hover:bg-green-400/30'
                      : 'bg-white/5 text-blue-100 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>Q{index + 1}</span>
                    {isQuestionAnswered(q) && (
                      <CheckCircle className="w-4 h-4" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Question Area */}
          <div className="lg:col-span-3">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-amber-400/20 p-8 mb-6">
              
              {/* Question Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      currentQ.type === 'text' 
                        ? 'bg-purple-400/20 text-purple-300 border border-purple-400/30'
                        : currentQ.type === 'opinion'
                        ? 'bg-blue-400/20 text-blue-300 border border-blue-400/30'
                        : 'bg-orange-400/20 text-orange-300 border border-orange-400/30'
                    }`}>
                      {currentQ.type === 'text' ? 'Text Response' : currentQ.type === 'opinion' ? 'Multiple Choice' : 'File Upload'}
                    </span>
                    {currentQ.required && (
                      <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-red-400/20 text-red-300 border border-red-400/30">
                        Required
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-bold leading-relaxed text-white">
                    {currentQ.question}
                  </h2>
                </div>
              </div>

              {/* Answer Area */}
              <div className="mt-6">
                {currentQ.type === 'text' && (
                  <div>
                    <textarea
                      value={answers[currentQ.id] || ''}
                      onChange={(e) => handleTextAnswer(currentQ.id, e.target.value)}
                      placeholder="Type your answer here..."
                      maxLength={currentQ.maxLength}
                      rows={6}
                      className="w-full px-4 py-3 rounded-2xl border-2 border-white/20 bg-white/5 backdrop-blur-md text-white placeholder-blue-200/50 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 resize-none transition-all"
                    />
                    {currentQ.maxLength && (
                      <p className="text-xs mt-2 text-blue-200">
                        {(answers[currentQ.id] || '').length} / {currentQ.maxLength} characters
                      </p>
                    )}
                  </div>
                )}

                {currentQ.type === 'opinion' && (
                  <div className="space-y-3">
                    {currentQ.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleOptionSelect(currentQ.id, option)}
                        className={`w-full text-left px-5 py-4 rounded-2xl border-2 transition-all ${
                          answers[currentQ.id] === option
                            ? 'border-amber-400 bg-amber-400/20 shadow-lg'
                            : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${
                            answers[currentQ.id] === option
                              ? 'border-amber-400 bg-amber-400'
                              : 'border-white/40'
                          }`}>
                            {answers[currentQ.id] === option && (
                              <div className="w-2.5 h-2.5 rounded-full bg-slate-900"></div>
                            )}
                          </div>
                          <span className="font-medium text-white">
                            {option}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {currentQ.type === 'file' && (
                  <div>
                    {uploadedFiles[currentQ.id] ? (
                      <div className="bg-white/5 border-2 border-green-400/30 rounded-2xl p-6 backdrop-blur-md">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`p-3 rounded-xl ${
                              uploadedFiles[currentQ.id].type.startsWith('image/') 
                                ? 'bg-blue-400/20'
                                : 'bg-red-400/20'
                            }`}>
                              {uploadedFiles[currentQ.id].type.startsWith('image/') ? (
                                <Image className="w-6 h-6 text-blue-300" />
                              ) : (
                                <FileText className="w-6 h-6 text-red-300" />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-white">
                                {uploadedFiles[currentQ.id].name}
                              </p>
                              <p className="text-sm text-blue-200">
                                {(uploadedFiles[currentQ.id].size / 1024).toFixed(2)} KB
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="w-6 h-6 text-green-400" />
                            <button
                              onClick={() => {
                                setUploadedFiles(prev => {
                                  const newFiles = { ...prev };
                                  delete newFiles[currentQ.id];
                                  return newFiles;
                                });
                                setAnswers(prev => {
                                  const newAnswers = { ...prev };
                                  delete newAnswers[currentQ.id];
                                  return newAnswers;
                                });
                                toast.info('File removed');
                              }}
                              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all bg-white/10 text-white hover:bg-white/20 border border-white/20"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current.click()}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, currentQ.id)}
                        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                          isDragging
                            ? 'border-amber-400 bg-amber-400/10'
                            : 'border-white/30 hover:border-amber-400/50 hover:bg-white/5'
                        }`}
                      >
                        <div className="inline-flex p-4 rounded-full mb-4 bg-white/10">
                          <Upload className="w-8 h-8 text-amber-400" />
                        </div>
                        <p className="text-lg font-bold mb-2 text-white">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-sm text-blue-200">
                          {currentQ.acceptedFormats === 'image/*' ? 'PNG, JPG, GIF' : 'PDF, Images'} up to 10MB
                        </p>
                      </div>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={currentQ.acceptedFormats || 'image/*,application/pdf'}
                      onChange={(e) => handleFileUpload(e, currentQ.id)}
                      className="hidden"
                    />
                  </div>
                )}
              </div>

              {/* Validation Alert */}
              {currentQ.required && !isQuestionAnswered(currentQ) && (
                <div className="mt-6 flex items-start space-x-3 p-4 rounded-2xl bg-amber-900/20 border-2 border-amber-400/30">
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-amber-400" />
                  <p className="text-sm text-amber-200">
                    This question is required. Please provide an answer to continue.
                  </p>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className={`px-6 py-3 rounded-2xl font-bold transition-all ${
                  currentQuestion === 0
                    ? 'opacity-50 cursor-not-allowed bg-white/10 text-blue-200'
                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                }`}
              >
                Previous
              </button>

              {currentQuestion < questions.length - 1 ? (
                <button
                  onClick={handleNext}
                  disabled={!canProceedToNext()}
                  className={`inline-flex items-center px-6 py-3 rounded-2xl font-bold transition-all ${
                    canProceedToNext()
                      ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 hover:shadow-xl transform hover:scale-[1.02]'
                      : 'opacity-50 cursor-not-allowed bg-white/10 text-blue-200'
                  }`}
                >
                  Next Question
                  <ChevronRight className="w-4 h-4 ml-2" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={uploading || getProgress() < 100}
                  className={`inline-flex items-center px-8 py-3 rounded-2xl font-black transition-all ${
                    getProgress() === 100 && !uploading
                      ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 hover:shadow-2xl transform hover:scale-[1.02]'
                      : 'opacity-50 cursor-not-allowed bg-white/10 text-blue-200'
                  }`}
                >
                  {uploading ? (
                    <span className="flex items-center space-x-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Submitting...</span>
                    </span>
                  ) : (
                    `Submit & Earn $${task.paymentAmount}`
                  )}
                </button>
              )}
            </div>

            {/* Info Box */}
            <div className="p-4 rounded-2xl bg-blue-400/10 border-2 border-blue-400/20 backdrop-blur-md">
              <p className="text-sm text-blue-100">
                <strong className="text-amber-400">Tip:</strong> Answer all {questions.length} questions carefully. Your responses help train AI systems to be more accurate and helpful.
              </p>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer position="top-right" theme="dark" />
    </div>
  );
};

export default Working;