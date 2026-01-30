import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Smartphone, Lock, ArrowRight, CheckCircle } from 'lucide-react';

// Generate email from phone number (matches signup logic)
const generateEmailFromPhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  return `user${cleaned}@remotetasks.tz`;
};

// Tanzania phone validation
const isValidTZPhone = (num) => {
  const cleaned = num.replace(/\D/g, '');
  return /^0(6[2-9]|7[1-9])\d{7}$/.test(cleaned) || /^255(6[2-9]|7[1-9])\d{7}$/.test(cleaned);
};

const normalizeTZPhone = (num) => {
  const cleaned = num.replace(/\D/g, '');
  if (/^0(6[2-9]|7[1-9])\d{7}$/.test(cleaned)) {
    return `255${cleaned.slice(1)}`;
  }
  if (/^255(6[2-9]|7[1-9])\d{7}$/.test(cleaned)) {
    return cleaned;
  }
  return null;
};

function SignInPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!isValidTZPhone(phone)) {
      setError('Weka namba sahihi ya simu');
      setLoading(false);
      return;
    }

    try {
      const normalizedPhone = normalizeTZPhone(phone);
      const email = generateEmailFromPhone(normalizedPhone);

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        setError('Akaunti haijapatikana. Tafadhali jisajili kwanza.');
        setLoading(false);
        return;
      }

      const userData = { ...userDoc.data(), userId: user.uid };
      localStorage.setItem('user', JSON.stringify(userData));

      // Optional: Admin routing
      const role = userDoc.data().role || 'user';
      if (email === 'admin@remotetasks.tz' && role === 'admin') {
        navigate('/admindashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Sign-in error:', err);
      let msg =
        err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential'
          ? 'Namba ya simu au neno la siri si sahihi.'
          : err.code === 'auth/too-many-requests'
          ? 'Umejaribu mara nyingi. Subiri kidogo.'
          : 'Imeshindwa kuingia. Jaribu tena.';

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950 via-green-900 to-emerald-900 flex items-center justify-center px-4 py-8">
      <div className="max-w-5xl w-full grid md:grid-cols-2 gap-8 items-center">

        {/* Left Side – Welcome Back */}
        <div className="text-white space-y-6">
          <div className="flex flex-col gap-2">
            <Link to="/" className="text-3xl md:text-4xl font-bold flex items-center gap-2">
              Remote AI <span className="text-lime-400">Tasks</span>
            </Link>
            <span className="text-xs bg-lime-400/20 border border-lime-400/30 px-3 py-1 rounded-full inline-block w-fit">
              🇹🇿 Made in Tanzania
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold leading-tight">
            Karibu Tena!<br />
            <span className="text-lime-400">Welcome Back</span>
          </h1>

          <p className="text-base text-green-100 leading-relaxed">
            Ingia kwenye akaunti yako ili kuendelea kufanya kazi na kupata pesa. 
            Kazi mpya zinaongezwa kila siku.
          </p>

          <div className="space-y-3 bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-lime-400 flex-shrink-0" />
              <span className="text-sm font-medium">Kazi mpya kila siku</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-lime-400 flex-shrink-0" />
              <span className="text-sm font-medium">Malipo kila wiki M-Pesa</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-lime-400 flex-shrink-0" />
              <span className="text-sm font-medium">Fanya kazi popote, wakati wowote</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-xs text-green-200">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-lime-400" />
              Pata dashboard haraka
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-lime-400" />
              Msaada wa haraka
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-lime-400" />
              Salama 100%
            </div>
          </div>
        </div>

        {/* Right Side – Sign In Form */}
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-lime-400/30">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Ingia Kwenye Akaunti</h2>
            <p className="text-gray-600 text-sm mt-1">Endelea kupata pesa</p>
            <p className="text-green-600 text-xs mt-1">Sign In to Your Account</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm mb-5 border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Namba ya Simu / Phone Number
              </label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent text-sm transition"
                  placeholder="0769500302"
                  required
                />
                {phone && isValidTZPhone(phone) && (
                  <CheckCircle className="absolute right-3 top-3.5 w-5 h-5 text-lime-500" />
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1 ml-1">
                Vodacom, Tigo, Airtel, Halotel
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Neno la Siri / Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent text-sm transition"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex justify-between items-center text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-3.5 h-3.5 text-lime-500 rounded focus:ring-lime-500" />
                <span className="text-gray-600">Nikumbuke / Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-lime-600 hover:underline font-medium">
                Umesahau neno la siri?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-lime-400 to-green-500 text-green-950 font-bold text-base py-3.5 rounded-lg hover:shadow-xl hover:shadow-lime-400/30 transform hover:scale-105 transition disabled:opacity-60 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-green-950 border-t-transparent"></div>
                  Inaingia...
                </>
              ) : (
                <>
                  Ingia / Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              Huna akaunti bado?{' '}
              <Link to="/signup" className="font-semibold text-lime-600 hover:text-lime-700 hover:underline">
                Jisajili bure
              </Link>
            </p>
            <p className="text-center text-xs text-gray-500 mt-2">
              New here? <Link to="/signup" className="text-lime-600">Create free account</Link>
            </p>
          </div>

          <div className="mt-5 bg-lime-50 border border-lime-200 rounded-lg p-3">
            <p className="text-xs text-gray-700 text-center">
              🔒 Usalama wa hali ya juu • Secured by Firebase
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignInPage;