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
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        setError('Account not found. Please sign up first.');
        setLoading(false);
        return;
      }

      const userData = { ...userDoc.data(), userId: user.uid };
      localStorage.setItem('user', JSON.stringify(userData));

      // Optional: Admin routing (update email/role as needed)
      const role = userDoc.data().role || 'user';
      if (email.trim() === 'admin1@gmail.com' && role === 'admin') {
        navigate('/admindashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Sign-in error:', err);
      let msg =
        err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password'
          ? 'Invalid email or password.'
          : err.code === 'auth/too-many-requests'
          ? 'Too many attempts. Please try again later.'
          : 'Failed to sign in. Please check your credentials and try again.';

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950 via-green-900 to-emerald-900 flex items-center justify-center px-4 py-12">
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-12 items-center">

        {/* Left Side – Welcome Back */}
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
            Welcome Back<br />
            <span className="text-lime-400">AI Contributor</span>
          </h1>

          <p className="text-xl text-green-100 leading-relaxed">
            Log in to access thousands of available tasks and continue contributing to the future of AI.
          </p>

          <div className="space-y-4 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-lime-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">New tasks added daily</span>
            </div>
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-lime-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Weekly payments</span>
            </div>
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-lime-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Work anytime, anywhere</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-8 text-sm text-green-200">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-lime-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Instant dashboard access
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-lime-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Fast support response
            </div>
          </div>
        </div>

        {/* Right Side – Sign In Form */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-lime-400/30">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-slate-800">Sign In to Remote AI Tasks</h2>
            <p className="text-gray-600 mt-2">Access your dashboard and continue earning</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm mb-6 border border-red-200 animate-pulse">
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex justify-between items-center text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-lime-500 rounded focus:ring-lime-500" />
                <span className="text-gray-600">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-lime-600 hover:underline font-medium">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-lime-400 to-green-500 text-slate-900 font-black text-lg py-5 rounded-xl hover:shadow-2xl hover:shadow-lime-400/50 transform hover:scale-105 transition disabled:opacity-60 disabled:transform-none disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-4 border-slate-900"></div>
                  Signing In...
                </span>
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-600">
            <p>
              New to Remote AI Tasks?{' '}
              <Link to="/signup" className="font-bold text-lime-600 hover:underline">
                Create free account
              </Link>
            </p>
          </div>

          <p className="mt-6 text-xs text-gray-500 text-center">
            Secured by Firebase • End-to-end encrypted
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignInPage;