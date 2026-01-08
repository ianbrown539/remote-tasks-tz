// src/pages/WithdrawPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../services/firebase';
import {
  doc,
  getDoc,
  getDocs,
  updateDoc,
  increment,
  arrayUnion,
  serverTimestamp,
  query,
  collection,
  where,
  setDoc,
  onSnapshot,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { toast, ToastContainer } from 'react-toastify';
import {
  DollarSign,
  Smartphone,
  CreditCard,
  Building2,
  ArrowLeft,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Calendar,
  X,
  Check,
  Lock,
  ShieldCheck,
  TrendingUp,
  Crown,
  User,
  Sparkles,
  Zap,
  PartyPopper,
  Rocket,
  BadgeCheck,
  RefreshCw,
  Users,
  Gift
} from 'lucide-react';
import Confetti from 'react-confetti';
import 'react-toastify/dist/ReactToastify.css';
import { getCurrentExchangeRate, formatKES } from './UserDashboard';

const VIP_CONFIG = {
  Bronze: { priceUSD: 1.99, dailyTasks: 3 },
  Silver: { priceUSD: 4.99, dailyTasks: 8 },
  Gold: { priceUSD: 9.99, dailyTasks: 15 },
};

const MIN_WITHDRAWAL_USD = 10.00;
const MIN_COMPLETED_TASKS = 15;
const FEE_PERCENTAGE = 2;

const REQUIRED_TOTAL_REFERRALS = 5;
const REQUIRED_VIP_REFERRALS = 2;

const STANDARD_REFERRAL_BONUS = 5;
const VIP_UPGRADE_BONUS = 10;

const normalizePhoneNumber = (input) => {
  if (!input) return null;
  const cleaned = input.replace(/\D/g, '');
  if (/^0[71]\d{8}$/.test(input)) return `254${cleaned.slice(1)}`;
  if (/^\+254[17]\d{8}$/.test(input)) return cleaned.slice(4);
  if (/^254[17]\d{8}$/.test(cleaned)) return cleaned;
  return null;
};

const isValidMpesaNumber = (input) =>
  /^0[17]\d{8}$/.test(input) || /^\+254[17]\d{8}$/.test(input) || /^254[17]\d{8}$/.test(input.replace(/\D/g, ''));

const WithdrawPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('mpesa');
  const [phone, setPhone] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [bankDetails, setBankDetails] = useState({
    bankName: '',
    accountName: '',
    accountNumber: '',
    swiftCode: '',
  });
  const [loading, setLoading] = useState(false);
  const [withdrawals, setWithdrawals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [eligibility, setEligibility] = useState({
    kycComplete: false,
    minAmount: false,
    minTasks: false,
  });
  const [showVIPModal, setShowVIPModal] = useState(false);
  const [selectedVIP, setSelectedVIP] = useState('');
  const [mpesaNumber, setMpesaNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [withdrawalData, setWithdrawalData] = useState(null);
  const [animationStep, setAnimationStep] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [refreshingWithdrawals, setRefreshingWithdrawals] = useState(false);

  const basicRequirementsMet = eligibility.kycComplete && eligibility.minAmount && eligibility.minTasks;
  const allRequirementsMet =
    basicRequirementsMet &&
    (profile?.totalReferrals || 0) >= REQUIRED_TOTAL_REFERRALS &&
    (profile?.vipReferrals || 0) >= REQUIRED_VIP_REFERRALS;

  const getStatusIcon = useCallback((status) => {
    const config = {
      pending: { Icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
      processing: { Icon: RefreshCw, color: 'text-blue-600', bg: 'bg-blue-50' },
      completed: { Icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
      failed: { Icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
    }[status] || { Icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' };
    const Icon = config.Icon;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
        <Icon className="w-4 h-4" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  }, []);

  const loadWithdrawals = useCallback(async (userId) => {
    if (!userId) return;
    setRefreshingWithdrawals(true);
    try {
      const q = query(collection(db, 'withdrawals'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const withdrawalsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        requestedAt: doc.data().requestedAt?.toDate() || new Date(),
      }));
      withdrawalsData.sort((a, b) => b.requestedAt - a.requestedAt);
      setWithdrawals(withdrawalsData.slice(0, 10));
    } catch (error) {
      console.error('Error loading withdrawals:', error);
      toast.error('Failed to load history');
    } finally {
      setRefreshingWithdrawals(false);
    }
  }, []);

  const setupWithdrawalsListener = useCallback((userId) => {
    if (!userId) return;
    const q = query(collection(db, 'withdrawals'), where('userId', '==', userId));
    return onSnapshot(q, (snapshot) => {
      let data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        requestedAt: d.data().requestedAt?.toDate() || new Date(),
      }));
      data.sort((a, b) => b.requestedAt - a.requestedAt);
      setWithdrawals(data.slice(0, 10));
    }, (error) => {
      console.error('Listener error:', error);
      loadWithdrawals(userId);
    });
  }, [loadWithdrawals]);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser === null) return;
      if (!currentUser) {
        toast.info('Sign in to withdraw', { icon: <Lock className="w-5 h-5" /> });
        navigate('/signin', { replace: true });
        return;
      }
      setUser(currentUser);
      const userRef = doc(db, 'users', currentUser.uid);
      const unsubUser = onSnapshot(userRef, (snap) => {
        if (!snap.exists()) {
          toast.error('Profile not found');
          navigate('/dashboard');
          return;
        }
        const data = snap.data();
        setProfile(data);
        setBalance(data.currentbalance || 0);
        setPhone(data.phone || '');
      });
      const unsubWithdrawals = setupWithdrawalsListener(currentUser.uid);
      return () => {
        unsubUser();
        if (unsubWithdrawals) unsubWithdrawals();
      };
    });
    return () => unsubAuth();
  }, [navigate, setupWithdrawalsListener]);

  const refreshWithdrawals = () => user && loadWithdrawals(user.uid);

  useEffect(() => {
    if (!profile) return;
    const tasksDone = profile.ApprovedTasks || 0;
    const minAmountNeeded = MIN_WITHDRAWAL_USD / (1 - FEE_PERCENTAGE / 100);
    const amountOk = balance >= minAmountNeeded;

    setEligibility({
      kycComplete: profile.hasDoneOnboardingTask || false,
      minAmount: amountOk,
      minTasks: tasksDone >= MIN_COMPLETED_TASKS,
    });
  }, [profile, balance]);

  const startWithdrawalAnimation = (data) => {
    setWithdrawalData(data);
    setShowSuccessModal(true);
    setAnimationStep(0);
    setShowConfetti(true);
    setTimeout(() => setAnimationStep(1), 1500);
    setTimeout(() => setAnimationStep(2), 3000);
    setTimeout(() => setShowConfetti(false), 7000);
    setTimeout(() => user && loadWithdrawals(user.uid), 5000);
  };

  const handleRealVIPUpgrade = async () => {
    if (!selectedVIP) return toast.error('Select a tier');
    const normalized = normalizePhoneNumber(mpesaNumber);
    if (!normalized || !isValidMpesaNumber(mpesaNumber)) return toast.error('Invalid M-Pesa number');

    setIsProcessing(true);
    const liveRate = getCurrentExchangeRate();
    const usdPrice = VIP_CONFIG[selectedVIP].priceUSD;
    const kesAmount = Math.round(usdPrice * liveRate);
    const clientReference = `VIP_${user.uid}_${Date.now()}`;

    try {
      const res = await fetch('/api/stk-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: normalized,
          amount: kesAmount,
          reference: clientReference,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'STK push failed');

      toast.info(
        <div className="text-xs">
          <p>STK push sent to {mpesaNumber}</p>
          <p className="text-lime-400 mt-1">
            Ksh.{kesAmount.toLocaleString()} (≈ ${usdPrice} @ {liveRate.toFixed(2)} KES/USD)
          </p>
        </div>,
        { autoClose: 15000 }
      );

      const poll = setInterval(async () => {
        try {
          const statusRes = await fetch(`/api/transaction-status?reference=${data.lipwaReference}`);
          const statusData = await statusRes.json();
          if (statusData.success && statusData.status) {
            const newStatus = statusData.status.toUpperCase();
            if (newStatus === 'SUCCESS') {
              clearInterval(poll);
              toast.success('VIP upgraded! 🎉');
              await finalizeVIPUpgrade();
            } else if (newStatus === 'FAILED') {
              clearInterval(poll);
              toast.error('Payment failed');
              setIsProcessing(false);
            }
          }
        } catch (e) {
          console.error('Polling error:', e);
        }
      }, 3000);

      setTimeout(() => {
        clearInterval(poll);
        if (isProcessing) {
          toast.warn('Payment timed out — refresh if completed');
          setIsProcessing(false);
        }
      }, 300000);
    } catch (e) {
      toast.error(e.message || 'Upgrade failed');
      setIsProcessing(false);
    }
  };

  const handleVIPReferralBonus = async (upgradedUserId, upgradedUserPhone) => {
    try {
      const upgradedSnap = await getDoc(doc(db, 'users', upgradedUserId));
      const upgradedData = upgradedSnap.data();
      const referredByCode = upgradedData?.referredBy;
      if (!referredByCode || !upgradedUserPhone) return;

      const referrerQuery = await getDocs(
        query(collection(db, 'users'), where('referralCode', '==', referredByCode))
      );
      if (referrerQuery.empty) return;

      const referrerRef = referrerQuery.docs[0].ref;
      const referrerSnap = await getDoc(referrerRef);
      const referrerData = referrerSnap.data();

      const alreadyHasVIPBonus = (referrerData.recentReferrals || []).some(
        (r) => r.phone === upgradedUserPhone && (r.isVIP || r.vipUpgraded)
      );
      if (alreadyHasVIPBonus) return;

      await updateDoc(referrerRef, {
        vipReferrals: increment(1),
        referralEarnings: increment(VIP_UPGRADE_BONUS),
        currentbalance: increment(VIP_UPGRADE_BONUS),
        recentReferrals: arrayUnion({
          phone: upgradedUserPhone,
          isVIP: true,
          vipUpgraded: true,
          upgradeDate: serverTimestamp(),
        }),
      });
    } catch (err) {
      console.error('VIP bonus error:', err);
    }
  };

  const finalizeVIPUpgrade = async () => {
    await handleVIPReferralBonus(user.uid, profile.phone);
    const newMax = VIP_CONFIG[selectedVIP].dailyTasks;
    await updateDoc(doc(db, 'users', user.uid), {
      isVIP: true,
      tier: `${selectedVIP}VIP`,
      dailyTasksRemaining: newMax,
      lastTaskResetDate: serverTimestamp(),
      vipUpgradedAt: serverTimestamp(),
    });
    setProfile(prev => ({ ...prev, isVIP: true, tier: `${selectedVIP}VIP` }));
    toast.success(`${selectedVIP} VIP Activated! ${newMax} tasks/day unlocked!`);
    setShowVIPModal(false);
    setIsProcessing(false);
    setSelectedVIP('');
    setMpesaNumber('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!allRequirementsMet) {
      setShowModal(true);
      return;
    }

    const usd = parseFloat(amount);
    if (isNaN(usd) || usd <= 0 || usd > balance) return toast.error('Invalid amount');

    const feeAmount = (usd * FEE_PERCENTAGE) / 100;
    const amountAfterFee = usd - feeAmount;
    if (amountAfterFee < MIN_WITHDRAWAL_USD) return toast.error(`Minimum $${MIN_WITHDRAWAL_USD} after fee`);

    if (method === 'mpesa') {
      const normalized = normalizePhoneNumber(phone);
      if (!normalized) return toast.error('Invalid M-Pesa number');
    }

    setLoading(true);
    try {
      const withdrawalId = `${user.uid}_${Date.now()}`;
      const payload = {
        userId: user.uid,
        name: profile.name || 'User',
        email: user.email,
        amount: usd,
        method,
        status: 'pending',
        requestedAt: serverTimestamp(),
      };
      if (method === 'mpesa') payload.phone = normalizePhoneNumber(phone);
      if (method === 'paypal') payload.paypalEmail = paypalEmail;
      if (method === 'bank') payload.bankDetails = bankDetails;

      await setDoc(doc(db, 'withdrawals', withdrawalId), payload);
      await updateDoc(doc(db, 'users', user.uid), { currentbalance: increment(-usd) });

      const withdrawalInfo = {
        id: withdrawalId,
        amount: usd,
        method,
        fee: feeAmount,
        receive: amountAfterFee,
        phone: method === 'mpesa' ? phone : null,
        email: method === 'paypal' ? paypalEmail : null,
        bankDetails: method === 'bank' ? bankDetails : null,
        timestamp: new Date(),
      };

      startWithdrawalAnimation(withdrawalInfo);
      resetForm();
      setAmount('');
    } catch (err) {
      console.error('Withdrawal error:', err);
      toast.error('Failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAmount('');
    setPaypalEmail('');
    setBankDetails({ bankName: '', accountName: '', accountNumber: '', swiftCode: '' });
  };

  const scrollToReferralCard = () => {
    setShowModal(false);
    setTimeout(() => {
      const card = document.getElementById('referral-card');
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        card.classList.add('ring-4', 'ring-lime-400', 'ring-offset-4', 'ring-offset-green-950');
        setTimeout(() => card.classList.remove('ring-4', 'ring-lime-400', 'ring-offset-4', 'ring-offset-green-950'), 3000);
      }
    }, 300);
  };

  const fee = amount ? (parseFloat(amount) * FEE_PERCENTAGE) / 100 : 0;
  const receive = amount ? parseFloat(amount) - fee : 0;

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-950 via-green-900 to-emerald-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-lime-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg text-green-100">Loading withdrawal page...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer position="top-center" theme="light" />
      {showConfetti && <Confetti recycle={false} numberOfPieces={400} gravity={0.3} colors={['#84cc16', '#22c55e', '#10b981', '#14b8a6']} />}

      {/* Success Animation Modal */}
      {showSuccessModal && withdrawalData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-10 max-w-md w-full shadow-2xl border border-lime-300/50 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-lime-400/10 via-emerald-400/10 to-green-500/10 animate-pulse" />

            <div className="relative z-10 text-center">
              {animationStep === 0 && (
                <div className="animate-fade-in">
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-blue-200">
                    <Zap className="w-12 h-12 text-blue-600 animate-pulse" />
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 mb-4">Processing...</h3>
                  <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              )}
              {animationStep === 1 && (
                <div className="animate-fade-in">
                  <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-emerald-200">
                    <BadgeCheck className="w-12 h-12 text-emerald-600 animate-bounce" />
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 mb-4">Approved!</h3>
                  <p className="text-lg text-slate-600 mb-6">Transferring funds...</p>
                  <div className="flex justify-center gap-2">
                    {[0, 150, 300].map(delay => (
                      <div key={delay} className="w-4 h-4 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                    ))}
                  </div>
                </div>
              )}
              {animationStep === 2 && (
                <div className="animate-fade-in">
                  <div className="w-24 h-24 bg-gradient-to-br from-lime-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                    <PartyPopper className="w-12 h-12 text-white animate-tada" />
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 mb-4">Success! 🎉</h3>
                  <p className="text-lg text-slate-600 mb-8">Withdrawal completed</p>

                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border-2 border-emerald-300">
                    <div className="flex justify-between mb-4">
                      <span className="text-slate-600">Amount</span>
                      <span className="text-3xl font-black text-emerald-600">${withdrawalData.amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-500">Fee (2%)</span>
                      <span className="text-red-600">-${withdrawalData.fee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span className="text-slate-700">You receive</span>
                      <span className="text-emerald-600">${withdrawalData.receive.toFixed(2)}</span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-emerald-200 text-sm text-slate-600">
                      <p>{withdrawalData.method === 'mpesa' ? `M-Pesa: ${withdrawalData.phone}` : withdrawalData.method.toUpperCase()}</p>
                      <p className="mt-1">Expected: {withdrawalData.method === 'mpesa' ? 'Instant' : '24–48 hours'}</p>
                    </div>
                  </div>

                  <div className="mt-8 space-y-3">
                    <button
                      onClick={() => setShowSuccessModal(false)}
                      className="w-full bg-gradient-to-r from-lime-400 to-green-500 text-slate-900 font-black py-4 rounded-xl hover:shadow-2xl transition"
                    >
                      Continue Earning
                    </button>
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="w-full bg-slate-100 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-200 transition"
                    >
                      Back to Dashboard
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIP Modal */}
      {showVIPModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-lime-300/50">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <Crown className="w-8 h-8 text-lime-500" />
                <h2 className="text-3xl font-black text-slate-900">Upgrade to VIP</h2>
              </div>
              <button onClick={() => setShowVIPModal(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="bg-gradient-to-r from-lime-50 to-green-50 border-2 border-lime-400 rounded-2xl p-6 text-center mb-8">
              <p className="text-xl font-black text-slate-800">Earn up to 15× more daily</p>
              <p className="text-slate-600 mt-2">Faster withdrawals • Priority support</p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              {Object.entries(VIP_CONFIG).map(([tier, config]) => {
                const isSelected = selectedVIP === tier;
                const isRecommended = tier === 'Silver';
                return (
                  <label
                    key={tier}
                    className={`relative cursor-pointer rounded-2xl border-4 p-6 text-center transition-all shadow-lg ${
                      isSelected
                        ? 'border-lime-500 bg-gradient-to-br from-lime-400 to-green-500 text-white'
                        : 'border-slate-200 bg-white hover:border-lime-400'
                    }`}
                  >
                    <input type="radio" name="vipTier" value={tier} checked={isSelected} onChange={e => setSelectedVIP(e.target.value)} className="sr-only" />
                    {isRecommended && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                        Best Value
                      </span>
                    )}
                    <Crown className={`w-10 h-10 mx-auto mb-3 ${isSelected ? 'text-white' : 'text-lime-500'}`} />
                    <p className={`text-xl font-black ${isSelected ? 'text-white' : 'text-slate-900'}`}>{tier}</p>
                    <p className={`text-3xl font-black my-3 ${isSelected ? 'text-white' : 'text-slate-900'}`}>${config.priceUSD}</p>
                    <p className={`text-lg font-bold ${isSelected ? 'text-white/90' : 'text-lime-600'}`}>
                      {formatKES(config.priceUSD)}
                    </p>
                    <p className={`text-sm mt-3 ${isSelected ? 'text-white/80' : 'text-slate-600'}`}>
                      {config.dailyTasks} tasks/day
                    </p>
                  </label>
                );
              })}
            </div>

            {selectedVIP && (
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-400 rounded-2xl p-6 text-center mb-8">
                <p className="text-lg font-medium text-slate-700">Payment Amount</p>
                <p className="text-4xl font-black text-emerald-600">
                  {formatKES(VIP_CONFIG[selectedVIP].priceUSD)}
                </p>
                <p className="text-sm text-slate-500 mt-2">
                  Rate: 1 USD = {getCurrentExchangeRate().toFixed(2)} KES
                </p>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-lg font-bold text-slate-800 mb-3">M-Pesa Number</label>
                <input
                  type="tel"
                  value={mpesaNumber}
                  onChange={e => setMpesaNumber(e.target.value)}
                  placeholder="0712345678"
                  className="w-full px-6 py-5 rounded-2xl border-4 border-lime-400 focus:border-green-500 focus:ring-4 focus:ring-lime-400/30 text-xl"
                />
              </div>
              <button
                onClick={handleRealVIPUpgrade}
                disabled={isProcessing || !selectedVIP || !isValidMpesaNumber(mpesaNumber)}
                className={`w-full py-6 rounded-2xl font-black text-2xl flex items-center justify-center gap-4 transition-all ${
                  selectedVIP && isValidMpesaNumber(mpesaNumber)
                    ? 'bg-gradient-to-r from-lime-400 to-green-500 text-slate-900 hover:shadow-2xl hover:shadow-lime-400/60 active:scale-98'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {isProcessing ? (
                  <>Sending STK Push... <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" /></>
                ) : (
                  <>Pay via M-Pesa <Smartphone className="w-8 h-8" /></>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Requirements Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-lime-300/50">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-900">Withdrawal Requirements</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="bg-gradient-to-r from-lime-50 to-emerald-50 border-2 border-lime-400 rounded-2xl p-6 mb-8 text-center">
              <p className="text-xl font-black text-slate-800">
                {allRequirementsMet ? 'All Clear! ✓' : basicRequirementsMet ? 'Almost There!' : 'Keep Going!'}
              </p>
            </div>

            <div className="space-y-5">
              {/* Basic 3 */}
              <div className="flex items-center gap-4">
                {eligibility.kycComplete ? <Check className="w-8 h-8 text-emerald-600" /> : <X className="w-8 h-8 text-red-500" />}
                <div>
                  <p className="font-bold text-lg">Identity Verified</p>
                  <p className="text-sm text-slate-600">Complete onboarding task</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {eligibility.minAmount ? <Check className="w-8 h-8 text-emerald-600" /> : <X className="w-8 h-8 text-red-500" />}
                <div>
                  <p className="font-bold text-lg">Minimum Balance</p>
                  <p className="text-sm text-slate-600">≥ ${(MIN_WITHDRAWAL_USD / (1 - FEE_PERCENTAGE / 100)).toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {eligibility.minTasks ? <Check className="w-8 h-8 text-emerald-600" /> : <X className="w-8 h-8 text-red-500" />}
                <div>
                  <p className="font-bold text-lg">Task Completion</p>
                  <p className="text-sm text-slate-600">{MIN_COMPLETED_TASKS}+ approved tasks</p>
                </div>
              </div>

              {basicRequirementsMet && (
                <>
                  <div className="my-6 border-t-2 border-dashed border-lime-400" />
                  <div className="flex items-center gap-4">
                    {(profile?.totalReferrals || 0) >= REQUIRED_TOTAL_REFERRALS ? <Check className="w-8 h-8 text-emerald-600" /> : <X className="w-8 h-8 text-orange-500" />}
                    <div>
                      <p className="font-bold text-lg">Invite {REQUIRED_TOTAL_REFERRALS} Friends</p>
                      <p className="text-sm text-slate-600">Earn $5 each • ({profile?.totalReferrals || 0}/{REQUIRED_TOTAL_REFERRALS})</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {(profile?.vipReferrals || 0) >= REQUIRED_VIP_REFERRALS ? <Check className="w-8 h-8 text-emerald-600" /> : <X className="w-8 h-8 text-orange-500" />}
                    <div>
                      <p className="font-bold text-lg">{REQUIRED_VIP_REFERRALS} Friends Upgrade to VIP</p>
                      <p className="text-sm text-slate-600">Earn $10 extra each • ({profile?.vipReferrals || 0}/{REQUIRED_VIP_REFERRALS})</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="mt-10">
              {allRequirementsMet ? (
                <div className="text-center bg-emerald-50 rounded-2xl p-6 border-2 border-emerald-400">
                  <PartyPopper className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
                  <p className="text-2xl font-black text-emerald-700">Withdrawals Unlocked!</p>
                </div>
              ) : (
                <button
                  onClick={basicRequirementsMet ? scrollToReferralCard : () => setShowModal(false)}
                  className="w-full bg-gradient-to-r from-lime-400 to-green-500 text-slate-900 font-black py-5 rounded-2xl hover:shadow-2xl transition text-xl"
                >
                  {basicRequirementsMet ? 'Complete Referrals →' : 'Close & Keep Earning'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Page */}
      <div className="min-h-screen bg-gradient-to-br from-green-950 via-green-900 to-emerald-900 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-green-200 hover:text-white mb-8 text-lg">
            <ArrowLeft className="w-6 h-6" /> Back
          </button>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
            <div>
              <h1 className="text-4xl font-black text-white mb-3">Withdraw Earnings</h1>
              <p className="text-xl text-green-200">Fast & secure payouts — M-Pesa instant</p>
            </div>
            {!profile?.isVIP && (
              <button
                onClick={() => setShowVIPModal(true)}
                className="bg-gradient-to-r from-lime-400 to-green-500 text-slate-900 font-black px-8 py-4 rounded-2xl hover:shadow-2xl transition flex items-center gap-3 text-xl"
              >
                <Crown className="w-7 h-7" />
                Upgrade to VIP
              </button>
            )}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Withdrawal Form */}
            <div className="lg:col-span-2">
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-lime-300/30">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-lime-200/50">
                  <div>
                    <p className="text-lg text-slate-600">Available Balance</p>
                    <p className="text-5xl font-black text-slate-900">${balance.toFixed(2)}</p>
                    <p className="text-xl text-lime-600 font-bold">{formatKES(balance)}</p>
                  </div>
                  <DollarSign className="w-16 h-16 text-lime-500" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div>
                    <label className="block text-xl font-bold text-slate-800 mb-4">
                      Amount (USD) — Min ${MIN_WITHDRAWAL_USD} after 2% fee
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      className="w-full px-6 py-5 text-2xl font-bold rounded-2xl border-4 border-lime-400 focus:ring-4 focus:ring-lime-400/30"
                      placeholder="10.00"
                      min="0.01"
                      max={balance}
                    />
                    {amount && parseFloat(amount) > 0 && (
                      <div className={`mt-6 p-6 rounded-2xl ${receive >= MIN_WITHDRAWAL_USD ? 'bg-emerald-50 border-2 border-emerald-400' : 'bg-red-50 border-2 border-red-400'}`}>
                        <div className="space-y-3 text-lg">
                          <div className="flex justify-between">
                            <span>Requested</span>
                            <span className="font-bold">${parseFloat(amount).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-red-600">
                            <span>Fee (2%)</span>
                            <span className="font-bold">-${fee.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-black text-2xl">
                            <span>You receive</span>
                            <span className={receive >= MIN_WITHDRAWAL_USD ? 'text-emerald-600' : 'text-red-600'}>
                              ${receive.toFixed(2)}
                            </span>
                          </div>
                          <p className="text-center text-xl font-bold text-lime-600">≈ {formatKES(receive)}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {[10.21, 25, 50].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setAmount(val.toFixed(2))}
                        disabled={val > balance}
                        className="py-4 rounded-2xl bg-gradient-to-r from-lime-400 to-green-500 text-slate-900 font-black text-xl hover:shadow-lg disabled:opacity-50"
                      >
                        ${val}
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="block text-xl font-bold text-slate-800 mb-5">Payment Method</label>
                    <div className="grid grid-cols-3 gap-5">
                      {[
                        { id: 'mpesa', label: 'M-Pesa', icon: Smartphone },
                        { id: 'paypal', label: 'PayPal', icon: CreditCard },
                        { id: 'bank', label: 'Bank', icon: Building2 },
                      ].map(opt => {
                        const Icon = opt.icon;
                        return (
                          <label
                            key={opt.id}
                            className={`flex flex-col items-center p-6 rounded-2xl border-4 cursor-pointer transition-all ${
                              method === opt.id
                                ? 'border-lime-500 bg-gradient-to-br from-lime-50 to-green-50 shadow-xl'
                                : 'border-slate-300 hover:border-lime-400'
                            }`}
                          >
                            <input type="radio" name="method" value={opt.id} checked={method === opt.id} onChange={e => setMethod(e.target.value)} className="sr-only" />
                            <Icon className={`w-12 h-12 mb-3 ${method === opt.id ? 'text-lime-600' : 'text-slate-600'}`} />
                            <span className="text-lg font-bold">{opt.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {method === 'mpesa' && (
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="0712345678 or +254..."
                      className="w-full px-6 py-5 text-xl rounded-2xl border-4 border-lime-400 focus:ring-4 focus:ring-lime-400/30"
                    />
                  )}

                  <button
                    type="submit"
                    disabled={loading || !amount || !allRequirementsMet}
                    className="w-full bg-gradient-to-r from-lime-400 to-green-500 text-slate-900 font-black text-3xl py-6 rounded-3xl hover:shadow-2xl hover:shadow-lime-400/60 transition disabled:opacity-50"
                  >
                    {loading ? 'Processing Request...' : 'Request Withdrawal'}
                  </button>
                </form>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* User Card */}
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-lime-300/30">
                <div className="flex items-center gap-5 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-lime-500 to-green-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg">
                    {profile?.name?.[0] ?? '?'}
                  </div>
                  <div>
                    <p className="text-2xl font-black text-slate-900">{profile?.name || 'User'}</p>
                    <p className="text-lg text-lime-600 font-bold">{profile?.tier || 'Standard'}</p>
                  </div>
                </div>
                <div className="space-y-3 text-lg">
                  <p>Tasks: <strong className="text-slate-900">{profile?.ApprovedTasks || 0}</strong></p>
                  <p>Referrals: <strong className="text-lime-600">{profile?.totalReferrals || 0}</strong></p>
                </div>
              </div>

              {/* Referral Earnings Card */}
              <div id="referral-card" className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-lime-300/50">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-lime-400 to-green-500 rounded-2xl flex items-center justify-center shadow-xl">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900">Referral Earnings</h3>
                      <p className="text-slate-600">Invite & earn real money</p>
                    </div>
                  </div>
                  <p className="text-4xl font-black text-lime-600">${(profile?.referralEarnings || 0).toFixed(2)}</p>
                </div>

                <div className="grid grid-cols-2 gap-5 mb-8">
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 text-center border border-slate-200">
                    <p className="text-4xl font-black text-slate-800">{profile?.totalReferrals || 0}</p>
                    <p className="text-slate-600 mt-2">Total Friends</p>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 text-center border-2 border-emerald-300">
                    <p className="text-4xl font-black text-emerald-600">{profile?.vipReferrals || 0}</p>
                    <p className="text-emerald-700 mt-2">VIP Friends</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-lime-50 to-emerald-50 rounded-2xl p-6 text-center mb-8 border-2 border-lime-400">
                  <p className="text-xl font-black text-slate-800">
                    $5 per friend • <span className="text-emerald-600">$15 when they go VIP</span>
                  </p>
                </div>

                {/* Recent Referrals */}
                {(profile?.recentReferrals?.length > 0) ? (
                  <div className="space-y-4 mb-8 max-h-64 overflow-y-auto">
                    {profile.recentReferrals.slice(0, 5).map((ref, i) => {
                      const isVIP = ref.isVIP || ref.vipUpgraded;
                      const reward = isVIP ? 15 : 5;
                      return (
                        <div key={i} className={`p-5 rounded-2xl border-2 ${isVIP ? 'bg-emerald-50 border-emerald-400' : 'bg-slate-50 border-slate-300'}`}>
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-bold text-slate-800">•••{ref.phone?.slice(-4)}</p>
                              <p className={`text-sm font-medium flex items-center gap-2 mt-1 ${isVIP ? 'text-emerald-700' : 'text-slate-600'}`}>
                                {isVIP && <Crown className="w-4 h-4" />} {isVIP ? 'VIP Member' : 'Standard'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className={`text-2xl font-black ${isVIP ? 'text-emerald-600' : 'text-lime-600'}`}>+${reward}</p>
                              {isVIP && <p className="text-emerald-600 font-bold text-sm">VIP Bonus!</p>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 mb-8">
                    <Sparkles className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-xl font-bold text-slate-600">No referrals yet</p>
                    <p className="text-slate-500 mt-2">Start inviting and watch earnings grow!</p>
                  </div>
                )}

                <button
                  onClick={async () => {
                    const link = `${window.location.origin}/signup?ref=${profile?.referralCode || ''}`;
                    if (navigator.share) {
                      await navigator.share({ url: link, title: 'Earn with RemoTasks!' });
                    } else {
                      const whatsapp = `https://wa.me/?text=${encodeURIComponent(`Join RemoTasks and earn real money! 💰\n\n${link}\n\nI'll get $5 when you join — and $15 when you go VIP!`)}`;
                      window.open(whatsapp, '_blank');
                    }
                  }}
                  className="w-full bg-gradient-to-r from-lime-400 to-green-500 text-slate-900 font-black text-2xl py-6 rounded-3xl hover:shadow-2xl transition flex items-center justify-center gap-4"
                >
                  <Users className="w-8 h-8" />
                  Invite Friends Now
                </button>

                <div className="mt-6 bg-slate-50 rounded-2xl p-5 border border-slate-300">
                  <p className="text-center text-sm font-bold text-slate-600 mb-3">Your Link</p>
                  <div className="flex items-center gap-3 bg-white rounded-xl p-4 border border-lime-400">
                    <code className="flex-1 text-xs text-slate-700 break-all font-mono">
                      {window.location.origin}/signup?ref={profile?.referralCode}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/signup?ref=${profile?.referralCode}`);
                        toast.success('Link copied!');
                      }}
                      className="p-3 bg-lime-400 rounded-lg hover:bg-lime-500 transition"
                    >
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* History */}
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-lime-300/30">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-black text-slate-900">Recent Withdrawals</h3>
                  <button onClick={refreshWithdrawals} className="p-3 hover:bg-slate-100 rounded-xl">
                    <RefreshCw className={`w-6 h-6 ${refreshingWithdrawals ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                {withdrawals.length > 0 ? (
                  <div className="space-y-4">
                    {withdrawals.map(w => (
                      <div key={w.id} className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-2xl font-black text-slate-900">${w.amount?.toFixed(2)}</p>
                            <p className="text-lime-600 font-bold">{formatKES(w.amount)}</p>
                            <p className="text-sm text-slate-600 mt-1">
                              {w.method.toUpperCase()} • {w.requestedAt?.toLocaleDateString()}
                            </p>
                          </div>
                          {getStatusIcon(w.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-xl text-slate-600">No withdrawals yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WithdrawPage;