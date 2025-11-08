import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const role = userDoc.exists() ? userDoc.data().role : 'user';

      // Admin check
      if (email === 'workfromhome.onlinepay@gmail.com' && role === 'admin') {
        navigate('/admindashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Sign-in error:', err);
      setError(
        err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password'
          ? 'Invalid email or password.'
          : err.code === 'auth/too-many-requests'
          ? 'Too many attempts. Try again later.'
          : 'Failed to sign in. Please check your connection.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Full-screen immersive background */}
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4 py-12">
        <div className="max-w-6xl w-full grid md:grid-cols-2 gap-12 items-center">

          {/* Left: Welcome Back + Live Stats */}
          <div className="text-white space-y-8">
            <div className="flex items-center space-x-3">
              <div className="text-4xl font-black text-amber-400">Train2Earn</div>
              <span className="text-sm bg-amber-400/20 px-3 py-1 rounded-full">by ComoAI Labs</span>
            </div>

            <h1 className="text-5xl font-black leading-tight">
              Welcome Back<br />
              <span className="text-amber-400">AI Trainer</span>
            </h1>

            <p className="text-xl text-blue-100 leading-relaxed">
              You’re one click away from 3,000+ live tasks and your next payout.<br />
              Members earned <strong className="text-amber-400">$428,000 last week</strong>.
            </p>

            <div className="space-y-4 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex justify-between">
                <span className="text-sm">Tasks available now</span>
                <span className="font-bold text-green-400">3,124</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Avg. task payout</span>
                <span className="font-bold text-amber-400">$22.80</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Next payout</span>
                <span className="font-bold">Thursday, 11:59 PM</span>
              </div>
            </div>

            <div className="flex items-center gap-8 text-sm opacity-80">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Instant dashboard access
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                48-hour support response
              </div>
            </div>
          </div>

          {/* Right: Sign In Form */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-amber-400/20">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-slate-800">Sign In to Train2Earn</h2>
              <p className="text-gray-600 mt-2">Access your dashboard and start earning</p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm mb-6 border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSignIn} className="space-y-6">
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
              </div>

              <div className="flex justify-between items-center text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 text-amber-500 rounded focus:ring-amber-400" />
                  <span className="text-gray-600">Remember me</span>
                </label>
                <a href="/forgot-password" className="text-amber-600 hover:underline font-medium">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-bold py-4 rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing In...' : 'Sign In to Dashboard'}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-gray-600">
              <p>
                New to Train2Earn?{' '}
                <Link to="/signup" className="font-semibold text-amber-600 hover:underline">
                  Create free account →
                </Link>
              </p>
            </div>

            <p className="mt-6 text-xs text-gray-500 text-center">
              Secured by Firebase • End-to-end encrypted
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default SignInPage;