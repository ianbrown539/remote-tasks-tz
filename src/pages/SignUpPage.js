import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { auth, db } from '../services/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  increment,
  arrayUnion,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { toast } from 'react-toastify';

// Referral code generator
const generateReferralCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const nums = '0123456789';
  let code = '';
  code += chars.charAt(Math.floor(Math.random() * chars.length));
  code += chars.charAt(Math.floor(Math.random() * chars.length));
  for (let i = 0; i < 4; i++) {
    code += nums.charAt(Math.floor(Math.random() * nums.length));
  }
  code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
};

function SignUpPage() {
  const [searchParams] = useSearchParams();
  const referredByCode = searchParams.get('ref');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getPasswordStrength = () => {
    if (password.length === 0) return { text: '', color: '' };
    if (password.length < 6) return { text: 'Weak', color: 'text-red-500' };
    if (password.length < 10) return { text: 'Medium', color: 'text-yellow-500' };
    return { text: 'Strong', color: 'text-lime-500' };
  };

  const isValidPhone = (num) => {
    const cleaned = num.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 15;
  };

  useEffect(() => {
    if (referredByCode) {
      toast.success(`Welcome! You're joining via a friend's invitation 🎁`, {
        autoClose: 5000,
      });
    }
  }, [referredByCode]);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!name.trim()) { setError('Full name is required'); setLoading(false); return; }
    if (!email.trim()) { setError('Email is required'); setLoading(false); return; }
    if (!phone.trim()) { setError('Phone number is required'); setLoading(false); return; }
    if (!isValidPhone(phone)) { setError('Enter a valid phone number'); setLoading(false); return; }
    if (!password) { setError('Password is required'); setLoading(false); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); setLoading(false); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); setLoading(false); return; }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      const myReferralCode = generateReferralCode();

      await setDoc(doc(db, 'users', user.uid), {
        userId: user.uid,
        createdAt: serverTimestamp(),
        email: email.trim().toLowerCase(),
        name: name.trim(),
        phone: phone.trim(),
        referralCode: myReferralCode,
        referredBy: referredByCode || null,
        totalReferrals: 0,
        vipReferrals: 0,
        referralEarnings: 0,
        recentReferrals: [],
        currentbalance: 0,
        thisMonthEarned: 0,
        totalEarned: 0,
        ApprovedTasks: 0,
        hasDoneOnboardingTask: false,
        isVIP: false,
        tier: "standard",
        dailyTasksRemaining: 2,
      });

      if (referredByCode) {
        const referrerQuery = await getDocs(
          query(collection(db, 'users'), where('referralCode', '==', referredByCode))
        );

        if (!referrerQuery.empty) {
          const referrerDoc = referrerQuery.docs[0];
          const referrerRef = doc(db, 'users', referrerDoc.id);

          await updateDoc(referrerRef, {
            totalReferrals: increment(1),
            referralEarnings: increment(5),
            currentbalance: increment(5),
            recentReferrals: arrayUnion({
              userId: user.uid,
              name: name.trim(),
              phone: phone.trim(),
              isVIP: false,
              referredAt: Date.now(),
            }),
          });

          toast.success(`$5 added to your referrer's account! 💰`);
        }
      }

      toast.success('Welcome to RemoTasks! Your account is ready.');
      navigate('/dashboard');
    } catch (err) {
      console.error('Signup error:', err);
      let msg = 'Failed to create account. Please try again.';

      if (err.message.includes('timeout')) {
        msg = 'Slow connection. Account may have been created — try logging in.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'This email is already registered. Please sign in.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Invalid email address.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password too weak. Use 6+ characters.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Too many attempts. Please wait a minute.';
      }

      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950 via-green-900 to-emerald-900 flex items-center justify-center px-4 py-12">
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-12 items-center">

        {/* Left Side – Hero */}
        <div className="text-white space-y-8">
          <div className="flex flex-col gap-3">
            <Link to="/" className="text-4xl md:text-5xl font-extrabold flex items-center gap-3">
              Remote AI <span className="text-lime-400">Tasks</span>
            </Link>
            <span className="text-sm bg-lime-400/20 px-3 py-1 rounded-full inline-block w-fit">
              by HandshakeAI Labs
            </span>
          </div>

          <h1 className="text-5xl font-black leading-tight">
            Start Contributing<br />
            to AI Development<br />
            From Home
          </h1>

          <p className="text-xl text-green-100 leading-relaxed">
            Join thousands of people worldwide helping train the next generation of AI.
            Work flexibly on your schedule — no experience required.
          </p>

          <div className="space-y-4 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-lime-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Flexible remote tasks</span>
            </div>
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-lime-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Get paid weekly</span>
            </div>
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-lime-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Tasks available daily</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 text-sm text-green-200">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-lime-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Paid via PayPal, Bank Transfer, or M-Pesa
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-lime-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Free to join • Cancel anytime
            </div>
          </div>
        </div>

        {/* Right Side – Form */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-lime-400/30">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-slate-800">Create Your Free Account</h2>
            <p className="text-gray-600 mt-2">Takes less than 2 minutes</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm mb-6 border border-red-200 animate-pulse">
              {error}
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-6">
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
              required
            />

            <input
              type="tel"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
              required
            />

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
              required
            />

            <div className="relative">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                required
              />
              {password && (
                <span className={`absolute right-4 top-3.5 text-xs font-medium ${getPasswordStrength().color}`}>
                  {getPasswordStrength().text}
                </span>
              )}
            </div>

            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-lime-400 to-green-500 text-slate-900 font-black text-xl py-5 rounded-xl hover:shadow-2xl hover:shadow-lime-400/50 transform hover:scale-105 transition disabled:opacity-60 disabled:transform-none disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-4 border-slate-900"></div>
                  Creating Account...
                </span>
              ) : (
                'Create Free Account'
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/signin" className="font-bold text-lime-600 hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;