import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../services/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

// Helper to generate a random referral code (e.g., SD23ZIM1)
const generateReferralCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const nums = '0123456789';
  let code = '';
  code += chars.charAt(Math.floor(Math.random() * chars.length)); // Start with letter
  code += chars.charAt(Math.floor(Math.random() * chars.length));
  for (let i = 0; i < 4; i++) {
    code += nums.charAt(Math.floor(Math.random() * nums.length)); // Add 4 numbers
  }
  code += chars.charAt(Math.floor(Math.random() * chars.length)); // End with letter
  return code;
};

function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState(''); // Added for phone input
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Password strength indicator
  const getPasswordStrength = () => {
    if (password.length < 6) return { text: 'Weak', color: 'text-red-500' };
    if (password.length < 10) return { text: 'Medium', color: 'text-amber-500' };
    return { text: 'Strong', color: 'text-green-500' };
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const role = email === 'workfromhome.onlinepay@gmail.com' ? 'admin' : 'user';
      const referralCode = generateReferralCode();

      await setDoc(doc(db, 'users', user.uid), {
        balance: 1000,
        createdAt: serverTimestamp(),
        email: email,
        hasDoneFirstTask: false,
        isActive: false,
        isVIP: false,
        name: name,
        phone: phone || '+254755444444', // Fallback if phone not provided
        referralCode: referralCode,
        userId: user.uid,
        role: role,
        appliedTasks: 0,
        completedTasks: 0,
        thisMonthEarned: 0,
        successRate: '0%',
        onboardingCompleted: false,
      });

      navigate(role === 'admin' ? '/admindashboard' : '/dashboard');
    } catch (err) {
      console.error('Sign-up error:', err);
      setError(
        err.code === 'auth/email-already-in-use'
          ? 'This email is already registered.'
          : err.code === 'auth/invalid-email'
          ? 'Please enter a valid email address.'
          : err.code === 'auth/weak-password'
          ? 'Password must be at least 6 characters.'
          : 'Failed to create account. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Full-screen background with gradient overlay */}
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4 py-12">
        <div className="max-w-6xl w-full grid md:grid-cols-2 gap-12 items-center">
          
          {/* Left: Trust + Preview */}
          <div className="text-white space-y-8">
            <div className="flex items-center space-x-3">
              <div className="text-4xl font-black text-amber-400">Train2Earn</div>
              <span className="text-sm bg-amber-400/20 px-3 py-1 rounded-full">by ComoAI Labs</span>
            </div>

            <h1 className="text-5xl font-black leading-tight">
              Start Earning<br />
              <span className="text-amber-400">$15–$50/hour</span><br />
              Today
            </h1>

            <p className="text-xl text-blue-100 leading-relaxed">
              Join 50,000+ members training AI from home. No experience needed. 
              Complete your first paid task in under 10 minutes.
            </p>

            <div className="space-y-4 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex justify-between text-sm">
                <span>First task payout</span>
                <span className="font-bold text-amber-400">$18–$35</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Time to complete</span>
                <span className="font-bold">6–12 minutes</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Available now</span>
                <span className="font-bold text-green-400">3,124 tasks</span>
              </div>
            </div>

            <div className="flex items-center gap-8 text-sm opacity-80">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Paid weekly via PayPal, M-pesa or Bank
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Cancel anytime
              </div>
            </div>
          </div>

          {/* Right: Signup Form */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-amber-400/20">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-slate-800">Create Your Free Account</h2>
              <p className="text-gray-600 mt-2">Takes less than 2 minutes</p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm mb-6 border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSignUp} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
                  placeholder="+254755444444"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
                  placeholder="••••••••"
                  required
                />
                {password && (
                  <p className={`text-sm mt-2 ${getPasswordStrength().color}`}>
                    Password strength: <span className="font-semibold">{getPasswordStrength().text}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-bold py-4 rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Create Free Account'}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-gray-600">
              <p>
                Already have an account?{' '}
                <Link to="/signin" className="font-semibold text-amber-600 hover:underline">
                  Sign in here
                </Link>
              </p>
            </div>

            <p className="mt-6 text-xs text-gray-500 text-center">
              By signing up, you agree to our{' '}
              <a href="#" className="underline hover:text-amber-600">Terms</a> and{' '}
              <a href="#" className="underline hover:text-amber-600">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default SignUpPage;