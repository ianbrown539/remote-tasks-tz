import React, { useState, useRef } from 'react';
import { X } from 'lucide-react';
import { db } from '../services/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';

const CompleteApplication = ({ task, userProfile, currentUser, onClose, onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitLoader, setIsSubmitLoader] = useState(false);
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

  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmitLoader(true);
    setIsSubmitting(true);

    // Simulate 4-second loader
    await new Promise((resolve) => setTimeout(resolve, 4000));

    try {
      // Save application to Firestore
      await withRetry(() =>
        addDoc(collection(db, 'applications'), {
          taskId: task.id,
          taskTitle: task.title,
          userId: currentUser.uid,
          userName: userProfile?.name || currentUser.email,
          userEmail: currentUser.email,
          experience: userProfile?.skills?.join(', ') || 'N/A',
          status: 'pending',
          appliedAt: new Date().toISOString(),
        })
      );

      // Prepare mailto link
      const userName = userProfile?.name || currentUser.email || 'User';
      const emailBody = `
Dear Work From Home Team,

I am writing to apply for the task "${task.title}".

Task Details:
- Title: ${task.title}
- Description: ${task.description || 'No description provided'}
- Pay Rate: $${task.payRate || 'N/A'}
- Duration: ${task.duration || 'N/A'}
- Difficulty: ${task.difficulty || 'N/A'}
- Requirements: ${task.requirements?.length > 0 ? task.requirements.join(', ') : 'None'}
- Deadline: ${task.deadline || 'N/A'}

My contact details:
- Name: ${userName}
- Email: ${currentUser.email}

I look forward to your response with further instructions.

Best regards,
${userName}
      `.trim();
      const encodedSubject = encodeURIComponent(`Application for ${task.title}`);
      const encodedBody = encodeURIComponent(emailBody);
      const mailtoLink = `mailto:workfromhome.onlinepay@gmail.com?subject=${encodedSubject}&body=${encodedBody}`;

      // Open email client
      window.location.href = mailtoLink;

      toast.success('Application submitted successfully! Your email client has been opened with a pre-filled application template.');
      onSubmit();
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error(`Failed to submit application: ${error.message}`);
    } finally {
      setIsSubmitLoader(false);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white w-full h-full p-6 overflow-y-auto"
        role="dialog"
        aria-labelledby="modal-title"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 id="modal-title" className="text-xl font-bold text-gray-900">Complete Application</h2>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-6">Submit your application for the selected task.</p>
        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Your Name</label>
            <input
              className="w-full p-2 border rounded-md bg-gray-100"
              value={userProfile?.name || currentUser.email || 'N/A'}
              disabled
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Your Email</label>
            <input
              className="w-full p-2 border rounded-md bg-gray-100"
              value={currentUser.email || 'N/A'}
              disabled
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Task Title</label>
            <input
              className="w-full p-2 border rounded-md bg-gray-100"
              value={task?.title || 'Untitled'}
              disabled
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Category</label>
            <input
              className="w-full p-2 border rounded-md bg-gray-100"
              value={task?.type || 'General'}
              disabled
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Description</label>
            <textarea
              className="w-full p-2 border rounded-md bg-gray-100"
              value={task?.description || 'No description provided'}
              rows="4"
              disabled
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Price ($)</label>
              <input
                className="w-full p-2 border rounded-md bg-gray-100"
                value={task?.payRate || 0}
                disabled
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Duration</label>
              <input
                className="w-full p-2 border rounded-md bg-gray-100"
                value={task?.duration || 'N/A'}
                disabled
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Difficulty</label>
              <input
                className="w-full p-2 border rounded-md bg-gray-100"
                value={task?.difficulty || 'N/A'}
                disabled
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Requirements</label>
            <div className="flex flex-wrap gap-1">
              {(task?.requirements?.length > 0 ? task.requirements : ['None']).map((req, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded text-xs border border-gray-300"
                >
                  {req}
                </span>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Deadline</label>
            <input
              className="w-full p-2 border rounded-md bg-gray-100"
              value={task?.deadline || 'N/A'}
              disabled
            />
          </div>
          {task?.zoomLink && (
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Zoom Link</label>
              <input
                className="w-full p-2 border rounded-md bg-gray-100"
                value={task.zoomLink}
                disabled
              />
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <button
              className="border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-100 transition-colors"
              onClick={onClose}
              disabled={isSubmitting || isSubmitLoader}
              aria-label="Cancel application"
            >
              Cancel
            </button>
            <button
              className={`bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700 transition-colors flex items-center ${
                isSubmitting || isSubmitLoader ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={handleSubmit}
              disabled={isSubmitting || isSubmitLoader}
              aria-label={isSubmitting || isSubmitLoader ? 'Submitting application...' : 'Submit application'}
            >
              {(isSubmitting || isSubmitLoader) ? (
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
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteApplication;