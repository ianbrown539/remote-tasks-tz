import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { auth, db } from '../services/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import {
  doc,
  setDoc,
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
import { Smartphone, Lock, User, Gift, ArrowRight, CheckCircle } from 'lucide-react';

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

// Generate email from phone number
const generateEmailFromPhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  return `user${cleaned}@remotetasks.tz`;
};

function SignUpPage() {
  const [searchParams] = useSearchParams();
  const referredByCode = searchParams.get('ref');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getPasswordStrength = () => {
    if (password.length === 0) return { text: '', color: '' };
    if (password.length < 6) return { text: 'Dhaifu', color: 'text-red-500' };
    if (password.length < 10) return { text: 'Wastani', color: 'text-yellow-500' };
    return { text: 'Imara', color: 'text-lime-500' };
  };

  // Tanzania phone validation (Vodacom, Tigo, Airtel, Halotel)
  const isValidTZPhone = (num) => {
    const cleaned = num.replace(/\D/g, '');
    // Accepts: 0769500302, 0652345678, or 255769500302, 255652345678
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

  useEffect(() => {
    if (referredByCode) {
      toast.success(`🎁 Karibu! Umealikwa na rafiki yako`, {
        autoClose: 5000,
      });
    }
  }, [referredByCode]);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!name.trim()) { setError('Jina kamili linahitajika'); setLoading(false); return; }
    if (!phone.trim()) { setError('Namba ya simu inahitajika'); setLoading(false); return; }
    if (!isValidTZPhone(phone)) { 
      setError('Weka namba sahihi (Vodacom, Tigo, Airtel, Halotel)'); 
      setLoading(false); 
      return; 
    }
    if (!password) { setError('Neno la siri linahitajika'); setLoading(false); return; }
    if (password !== confirmPassword) { 
      setError('Maneno ya siri hayalingani'); 
      setLoading(false); 
      return; 
    }
    if (password.length < 6) { 
      setError('Neno la siri lazima liwe na herufi 6 au zaidi'); 
      setLoading(false); 
      return; 
    }

    try {
      const normalizedPhone = normalizeTZPhone(phone);
      const generatedEmail = generateEmailFromPhone(normalizedPhone);

      const userCredential = await createUserWithEmailAndPassword(auth, generatedEmail, password);
      const user = userCredential.user;

      const myReferralCode = generateReferralCode();

      await setDoc(doc(db, 'users', user.uid), {
        userId: user.uid,
        createdAt: serverTimestamp(),
        email: generatedEmail,
        name: name.trim(),
        phone: normalizedPhone,
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
              phone: normalizedPhone,
              isVIP: false,
              referredAt: Date.now(),
            }),
          });

          toast.success(`$5 imeongezwa kwa rafiki aliyekualika! 💰`);
        }
      }

      toast.success('🎉 Karibu Remote AI Tasks! Akaunti yako iko tayari.');
      navigate('/dashboard');
    } catch (err) {
      console.error('Signup error:', err);
      let msg = 'Imeshindwa kufungua akaunti. Jaribu tena.';

      if (err.message.includes('timeout')) {
        msg = 'Mtandao polepole. Akaunti inaweza ikawa imefunguliwa — jaribu kuingia.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'Namba hii ya simu tayari imesajiliwa. Tafadhali ingia.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Namba ya simu si sahihi.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Neno la siri ni dhaifu. Tumia herufi 6 au zaidi.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Umejaribu mara nyingi. Subiri dakika moja.';
      }

      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950 via-green-900 to-emerald-900 flex items-center justify-center px-4 py-8">
      <div className="max-w-5xl w-full grid md:grid-cols-2 gap-8 items-center">

        {/* Left Side – Hero */}
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
            Anza Kupata Pesa Leo<br />
            <span className="text-lime-400">Kwa Kufanya Kazi Nyumbani</span>
          </h1>

          <p className="text-base text-green-100 leading-relaxed">
            Jiunge na maelfu ya Watanzania wanaofanya kazi za AI na kupata pesa kila wiki. 
            Hakuna ujuzi maalum unahitajika.
          </p>

          <div className="space-y-3 bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-lime-400 flex-shrink-0" />
              <span className="text-sm font-medium">Kazi za mtandaoni zenye mfuko</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-lime-400 flex-shrink-0" />
              <span className="text-sm font-medium">Malipo kila wiki kupitia M-Pesa</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-lime-400 flex-shrink-0" />
              <span className="text-sm font-medium">Kazi zinapatikana kila siku</span>
            </div>
          </div>

          {referredByCode && (
            <div className="bg-gradient-to-r from-lime-400/20 to-emerald-500/20 border-2 border-lime-400 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-lime-400 rounded-full flex items-center justify-center">
                  <Gift className="w-5 h-5 text-green-950" />
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">Zawadi ya Kujisajili!</p>
                  <p className="text-xs text-green-200">
                    Rafiki yako atapata $5 ukimaliza kujisajili
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-4 text-xs text-green-200">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-lime-400" />
              Ni bure kabisa
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-lime-400" />
              Anza kufanya kazi mara moja
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-lime-400" />
              Hakuna malipo ya ujumbe
            </div>
          </div>
        </div>

        {/* Right Side – Form */}
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-lime-400/30">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Fungua Akaunti Yako</h2>
            <p className="text-gray-600 text-sm mt-1">Inachukua dakika 2 tu</p>
            <p className="text-green-600 text-xs mt-1">Create Your Free Account</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm mb-5 border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Jina Kamili / Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent text-sm"
                required
              />
            </div>

            <div className="relative">
              <Smartphone className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                placeholder="Namba ya Simu / Phone (0769500302)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent text-sm"
                required
              />
              {phone && isValidTZPhone(phone) && (
                <CheckCircle className="absolute right-3 top-3.5 w-5 h-5 text-lime-500" />
              )}
            </div>
            <p className="text-xs text-gray-500 -mt-2 ml-1">
              Vodacom, Tigo, Airtel, Halotel
            </p>

            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="password"
                placeholder="Neno la Siri / Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-20 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent text-sm"
                required
              />
              {password && (
                <span className={`absolute right-3 top-3.5 text-xs font-semibold ${getPasswordStrength().color}`}>
                  {getPasswordStrength().text}
                </span>
              )}
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="password"
                placeholder="Thibitisha Neno la Siri / Confirm"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent text-sm"
                required
              />
              {confirmPassword && password === confirmPassword && (
                <CheckCircle className="absolute right-3 top-3.5 w-5 h-5 text-lime-500" />
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-lime-400 to-green-500 text-green-950 font-bold text-base py-3.5 rounded-lg hover:shadow-xl hover:shadow-lime-400/30 transform hover:scale-105 transition disabled:opacity-60 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-green-950 border-t-transparent"></div>
                  Inafungua Akaunti...
                </>
              ) : (
                <>
                  Fungua Akaunti Bure
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center text-sm text-gray-600">
              Una akaunti tayari?{' '}
              <Link to="/signin" className="font-semibold text-lime-600 hover:text-lime-700 hover:underline">
                Ingia hapa
              </Link>
            </div>
            <p className="text-center text-xs text-gray-500 mt-2">
              Already have an account? <Link to="/signin" className="text-lime-600">Sign in</Link>
            </p>
          </div>

          <div className="mt-5 bg-lime-50 border border-lime-200 rounded-lg p-3">
            <p className="text-xs text-gray-700 text-center">
              🔒 Taarifa zako ni salama. Tunatumia encryption ya kisasa.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;